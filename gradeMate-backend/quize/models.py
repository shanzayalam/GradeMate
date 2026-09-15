"""
Models module for quize application.

Includes Quiz, StudentSubmission, PlagiarismResult, and QuizSolution models.
"""

from django.db import models
from accounts.models import User


class Quiz(models.Model):
    """Quiz model representing an assignment or test created by a teacher."""

    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    logic_weight = models.FloatField(
        default=0.5,
        help_text="Weight for AST logic-based grading (0.0 to 1.0)"
    )
    similarity_threshold = models.FloatField(
        default=0.7,
        help_text="Threshold for flagging plagiarism/similarity (0.0 to 1.0)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return human-readable quiz title."""
        return self.name

    class Meta:
        ordering = ['-created_at']


class StudentSubmission(models.Model):
    """Student submission model storing submission image, OCR text, and grade."""

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    student = models.CharField(max_length=255)
    submission_image = models.ImageField(upload_to='submissions/')
    extracted_text = models.TextField(blank=True)
    score = models.FloatField(null=True, blank=True)
    graded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['quiz', 'student']

    def __str__(self):
        """Return submission identifier."""
        return f"{self.student} - {self.quiz.name}"


class PlagiarismResult(models.Model):
    """Plagiarism comparison result between two student submissions."""

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    student1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='student1_results'
    )
    student2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='student2_results'
    )
    similarity_score = models.FloatField()
    comparison_details = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['quiz', 'student1', 'student2']


class QuizSolution(models.Model):
    """Quiz reference solution uploaded by instructor."""

    quiz = models.OneToOneField(Quiz, on_delete=models.CASCADE)
    solution_image = models.ImageField(upload_to='solutions/')
    extracted_solution_text = models.TextField(blank=True)

    def __str__(self):
        """Return solution string representation."""
        return f"Solution for {self.quiz.name}"