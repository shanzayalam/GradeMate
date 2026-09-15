"""
Quiz API views for managing quizzes, grading submissions, and plagiarism analysis.
"""

import json
import logging
from django.http import JsonResponse
from django.db.models import Avg, Max, Min
from rest_framework import status
from rest_framework.decorators import api_view
from rapidfuzz import fuzz

from accounts.models import User
from quize.models import Quiz, StudentSubmission, QuizSolution
from quize.ocr import extract_text, correct_cpp_code
from quize.AST_Levenshtein import evaluate_quiz, process_quiz
from utils.decorators import jwt_required

logger = logging.getLogger(__name__)


@api_view(['POST'])
@jwt_required
def dashboard(request):
    """
    Retrieve statistics and recent quizzes created by the authenticated user.
    """
    try:
        user_id = request.user_payload.get("user_id")
        user = User.objects.get(id=user_id)

        quizzes = Quiz.objects.filter(created_by=user)
        total_quizzes = quizzes.count()
        recent_quizzes = quizzes.order_by('-created_at')[:5]

        recent_data = []
        for quiz in recent_quizzes:
            recent_data.append({
                "id": quiz.id,
                "name": quiz.name,
                "date": quiz.created_at.strftime("%Y-%m-%d"),
                "student_count": quiz.submissions.count(),
                "actions": {
                    "view_url": f"/quiz/{quiz.id}/view",
                    "grade_url": f"/quiz/{quiz.id}/grade",
                    "delete_url": f"/quiz/{quiz.id}/delete"
                }
            })

        return JsonResponse({
            "total_quizzes": total_quizzes,
            "recent_quizzes": recent_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Dashboard stats error: {str(e)}")
        return JsonResponse(
            {"error": "Failed to fetch dashboard statistics."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def upload_quiz(request):
    """
    Upload reference solution and student submissions for automated AI grading.
    """
    try:
        user_id = request.user_payload.get("user_id")
        user = User.objects.get(id=user_id)

        quiz_name = request.data.get("quizName", "Untitled Quiz")
        logic_weight = float(request.data.get("logicWeight", 0.5))
        total_marks = float(request.data.get("total", 100))
        similarity_threshold = float(
            request.data.get("similarityThreshold", 0.7)
        )
        solution_image = request.FILES.get("solutionImage")

        # Process solution image OCR if provided
        corrected_solution_text = ""
        if solution_image:
            extracted_solution = extract_text(solution_image)
            corrected_solution = correct_cpp_code(extracted_solution)
            corrected_solution_text = "\n".join(corrected_solution)

        quiz = Quiz.objects.create(
            name=quiz_name,
            created_by=user,
            logic_weight=logic_weight,
            similarity_threshold=similarity_threshold
        )

        quiz_solution = None
        if solution_image:
            quiz_solution = QuizSolution.objects.create(
                quiz=quiz,
                solution_image=solution_image,
                extracted_solution_text=corrected_solution_text
            )

        solution_image_url = (
            request.build_absolute_uri(quiz_solution.solution_image.url)
            if quiz_solution and solution_image else None
        )

        student_names = request.data.getlist("studentNames")
        student_images = request.FILES.getlist("studentImages")

        students_results = []
        total_obtained_score = 0.0

        for i in range(len(student_names)):
            name = student_names[i]
            image = student_images[i] if i < len(student_images) else None

            corrected_student_text = ""
            if image:
                extracted_student = extract_text(image)
                corrected_student = correct_cpp_code(extracted_student)
                corrected_student_text = "\n".join(corrected_student)

            # Perform individual AST & Levenshtein evaluation
            eval_result = process_quiz(
                corrected_solution_text,
                corrected_student_text,
                {
                    "logic_weight": logic_weight,
                    "similarity_threshold": similarity_threshold
                }
            )

            final_score = eval_result["final_score"]
            lev_score = eval_result["levenshtein_score"]
            ast_score = eval_result["ast_score"]
            grade = eval_result["grade"]
            obtained_marks = round((final_score / 100.0) * total_marks, 2)

            submission = None
            if image:
                submission = StudentSubmission.objects.create(
                    quiz=quiz,
                    student=name,
                    submission_image=image,
                    extracted_text=corrected_student_text,
                    score=obtained_marks,
                    graded=True
                )

            total_obtained_score += final_score

            students_results.append({
                "id": submission.id if submission else i + 1,
                "name": name,
                "image": (
                    request.build_absolute_uri(submission.submission_image.url)
                    if submission and submission.submission_image else None
                ),
                "levenshtein_score": lev_score,
                "extractedText": corrected_student_text,
                "obtained_marks": obtained_marks,
                "final_score": final_score,
                "grade": grade,
                "ast_score": ast_score,
                "total_marks": total_marks,
            })

        total_students = len(students_results)
        average_score = (
            round(total_obtained_score / total_students, 2)
            if total_students > 0 else 0.0
        )

        logger.info(
            f"Quiz '{quiz_name}' created with {total_students} submissions."
        )

        return JsonResponse({
            "quizName": quiz.name,
            "totalStudents": total_students,
            "averageScore": average_score,
            "solutionImage": solution_image_url,
            "solutionImageText": corrected_solution_text,
            "students": students_results
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Upload quiz exception: {str(e)}")
        return JsonResponse(
            {"error": f"Failed to upload and grade quiz: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def quiz_view(request):
    """
    Fetch comprehensive quiz details, student performance, and stats.
    """
    try:
        user_id = request.user_payload.get("user_id")
        user = User.objects.get(id=user_id)
        data = json.loads(request.body) if request.body else request.data
        quiz_id = data.get("quiz_id")

        if not quiz_id:
            return JsonResponse(
                {"error": "quiz_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        quiz = Quiz.objects.get(id=quiz_id, created_by=user)

        try:
            solution = QuizSolution.objects.get(quiz=quiz)
            solution_url = request.build_absolute_uri(solution.solution_image.url)
        except QuizSolution.DoesNotExist:
            solution_url = None

        submissions_qs = quiz.submissions.all()
        total_students = submissions_qs.count()

        graded_subs = submissions_qs.filter(graded=True, score__isnull=False)

        avg_score = graded_subs.aggregate(avg=Avg('score'))['avg'] or 0.0
        max_score = graded_subs.aggregate(max=Max('score'))['max'] or 0.0
        min_score = graded_subs.aggregate(min=Min('score'))['min'] or 0.0

        passing_count = graded_subs.filter(score__gte=50.0).count()
        passing_rate = (
            f"{round((passing_count / total_students) * 100)}%"
            if total_students else "0%"
        )

        students_data = []
        for i, sub in enumerate(submissions_qs):
            score_val = sub.score if sub.score is not None else 0
            grade_val = (
                "A" if score_val >= 80 else "B" if score_val >= 70
                else "C" if score_val >= 60 else "D" if score_val >= 50 else "F"
            )
            students_data.append({
                "id": sub.id,
                "name": sub.student,
                "grade": grade_val if sub.graded else "N/A",
                "score": score_val,
                "status": (
                    "Passed" if sub.graded and score_val >= 50
                    else "Failed" if sub.graded else "Not graded"
                ),
                "submissionDate": sub.created_at.strftime("%b %d, %Y"),
                "feedback": (
                    "Excellent work" if sub.graded and score_val >= 90
                    else "Good effort" if sub.graded and score_val >= 75
                    else "Needs improvement" if sub.graded else "Not yet graded"
                )
            })

        return JsonResponse({
            "id": quiz.id,
            "name": quiz.name,
            "date": quiz.created_at.strftime("%b %d, %Y"),
            "totalStudents": total_students,
            "avgScore": round(avg_score, 2),
            "highestScore": max_score,
            "lowestScore": min_score,
            "passingRate": passing_rate,
            "students": students_data,
            "solutionImage": solution_url
        }, status=status.HTTP_200_OK)

    except Quiz.DoesNotExist:
        return JsonResponse(
            {"error": "Quiz not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Quiz view exception: {str(e)}")
        return JsonResponse(
            {"error": "Failed to retrieve quiz details."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def get_all_quizes(request):
    """
    Retrieve all quizzes created by the current authenticated user.
    """
    try:
        user_id = request.user_payload.get("user_id")
        user = User.objects.get(id=user_id)
        quizzes = Quiz.objects.filter(created_by=user).order_by('-created_at')

        data = []
        for quiz in quizzes:
            data.append({
                "id": quiz.id,
                "name": quiz.name,
                "date": quiz.created_at.strftime("%b %d, %Y"),
                "student_count": quiz.submissions.count()
            })

        return JsonResponse({"quizes": data}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Get all quizzes exception: {str(e)}")
        return JsonResponse(
            {"error": "Failed to retrieve quizzes list."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@jwt_required
def check_plagiarism(request):
    """
    Cross-compare all student submissions within a quiz for code plagiarism.
    """
    try:
        data = json.loads(request.body) if request.body else request.data
        quiz_id = data.get("quizId")
        if not quiz_id:
            return JsonResponse(
                {"error": "Quiz ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        quiz = Quiz.objects.get(id=quiz_id)
        submissions = list(StudentSubmission.objects.filter(quiz=quiz))

        if not submissions:
            return JsonResponse(
                {"error": "No submissions found for this quiz."},
                status=status.HTTP_404_NOT_FOUND
            )

        threshold = quiz.similarity_threshold * 100.0
        plagiarism_results = []

        for i in range(len(submissions)):
            for j in range(i + 1, len(submissions)):
                sub1 = submissions[i]
                sub2 = submissions[j]

                text1 = sub1.extracted_text or ""
                text2 = sub2.extracted_text or ""

                if not text1 or not text2:
                    sim_score = 0.0
                else:
                    sim_score = fuzz.token_sort_ratio(text1, text2)

                plagiarism_results.append({
                    "student1": sub1.student,
                    "student2": sub2.student,
                    "similarity": round(sim_score / 100.0, 2),
                    "flag": sim_score >= threshold,
                    "matches": []
                })

        return JsonResponse({
            "quiz_id": quiz.id,
            "quiz_name": quiz.name,
            "plagiarism_results": plagiarism_results
        }, status=status.HTTP_200_OK)

    except Quiz.DoesNotExist:
        return JsonResponse(
            {"error": "Quiz not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Check plagiarism exception: {str(e)}")
        return JsonResponse(
            {"error": "Failed to analyze plagiarism."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
