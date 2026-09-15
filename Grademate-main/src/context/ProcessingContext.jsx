import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  mockQuizzes,
  getMockPlagiarismData,
  getMockComparisonData,
  getMockGradingResults,
  getMockReportData,
  getMockExtractedText,
  mockDashboardStats,
  mockRecentActivities,
  getMockQuizDetailsWithGrades
} from '../data/mockData';

// Create context
const ProcessingContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Custom hook for using the context
export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
};

// Provider component
export const ProcessingProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);


// Grade a quiz
const gradeQuiz = useCallback(async (values) => {
  console.log('Grading quiz with values:', values);
  setIsProcessing(true);
  setError(null);

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    // Add text fields
    formData.append('quizName', values.quizName);
    formData.append('logicWeight', values.logicWeight);
    formData.append('similarityThreshold', values.similarityThreshold);
    formData.append('total', values.total);

    // Add solution image
    formData.append('solutionImage', values.solutionImage);

    // Add student names as separate array
    values.studentSubmissions.forEach((submission) => {
      formData.append('studentNames', submission.studentName);
    });

    // Add all student images as a separate array
    values.studentSubmissions.forEach((submission) => {
      formData.append('studentImages', submission.image);
    });

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/v1/quizzes/upload_quiz/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error data:', errorData);
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const results = await response.json();
    console.log('Grading results:', results);

    // Format solution text from array to string if needed
    const solutionImageText = Array.isArray(results.solutionImageText) 
      ? results.solutionImageText.join('\n') 
      : results.solutionImageText || "No text extracted from solution image";

    // Calculate average score if not provided by API
    let averageScore = results.averageScore;
    if (averageScore === undefined || averageScore === null) {
      if (results.students && results.students.length > 0) {
        const totalScores = results.students.reduce((sum, student) => {
          const studentScore = student.final_score || student.obtained_marks || 0;
          return sum + studentScore;
        }, 0);
        averageScore = totalScores / results.students.length;
      } else {
        averageScore = 0;
      }
    }

    // Transform the API response to match what GradingPage.jsx expects
    const transformedResults = {
      quizName: results.quizName,
      totalStudents: results.totalStudents || (results.students?.length || 0),
      averageScore: averageScore,
      solutionImage: results.solutionImage,
      solutionImageText: solutionImageText,
      students: results.students.map(student => {
        const score = student.final_score 
          ? Math.round(student.final_score * 100 / values.total) 
          : student.obtained_marks 
            ? Math.round(student.obtained_marks * 100 / values.total)
            : student.ast_score || 0;
            
        const extractedText = Array.isArray(student.extractedText) 
          ? student.extractedText.join('\n') 
          : student.extractedText || "No text extracted from student submission";
            
        const similarity = student.similarity !== undefined 
          ? student.similarity 
          : student.levenshtein_score 
            ? 1 - (student.levenshtein_score / 100) 
            : 0;

        return {
          id: student.id,
          name: student.name,
          image: student.image,
          score: score,
          total_marks: student.total_marks || values.total,
          ast_score: student.ast_score || 0,
          obtained_marks: student.obtained_marks || 0,
          final_score: student.final_score || 0,
          similarity: similarity,
          levenshtein_score: student.levenshtein_score || 0,
          plagiarismFlag: similarity >= values.similarityThreshold,
          extractedText: extractedText,
          grade: student.grade || 'N/A',
          feedback: student.feedback || []
        };
      })
    };

    setIsProcessing(false);
    return transformedResults;
  } catch (err) {
    setError(err.message || 'An error occurred during grading');
    setIsProcessing(false);
    throw err;
  }
}, []);


const analyzePlagiarism = useCallback(async (quizId) => {
  console.log('Analyzing plagiarism for quiz ID:', quizId);
  setIsProcessing(true);
  setError(null);

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/v1/quizzes/check_plagiarism/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ quizId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error data:', errorData);
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const results = await response.json();
    console.log('Plagiarism analysis results:', results);
    
    const transformedResults = {
      quizName: results.quiz_name || "Unknown Quiz",
      quizId: results.quiz_id,
      totalStudents: 0,
      averageSimilarity: 0,
      students: []
    };
    
    const studentMap = new Map();
    
    if (results.plagiarism_results && Array.isArray(results.plagiarism_results)) {
      results.plagiarism_results.forEach(result => {
        if (!studentMap.has(result.student1)) {
          studentMap.set(result.student1, {
            id: result.student1.toLowerCase().replace(/\s+/g, '-'),
            name: result.student1,
            similarity: 0,
            matches: [],
            flag: false
          });
        }
        
        if (!studentMap.has(result.student2)) {
          studentMap.set(result.student2, {
            id: result.student2.toLowerCase().replace(/\s+/g, '-'),
            name: result.student2,
            similarity: 0,
            matches: [],
            flag: false
          });
        }
        
        if (result.similarity > 0.1) {
          const student1Data = studentMap.get(result.student1);
          student1Data.matches.push(result.student2);
          student1Data.similarity = Math.max(student1Data.similarity, result.similarity);
          student1Data.flag = student1Data.flag || result.flag || result.similarity > 0.5;
          
          const student2Data = studentMap.get(result.student2);
          student2Data.matches.push(result.student1);
          student2Data.similarity = Math.max(student2Data.similarity, result.similarity);
          student2Data.flag = student2Data.flag || result.flag || result.similarity > 0.5;
        }
      });
    }
    
    transformedResults.students = Array.from(studentMap.values());
    transformedResults.totalStudents = transformedResults.students.length;
    
    if (transformedResults.students.length > 0) {
      const totalSimilarity = transformedResults.students.reduce((sum, student) => sum + student.similarity, 0);
      transformedResults.averageSimilarity = totalSimilarity / transformedResults.students.length;
    }
    
    setIsProcessing(false);
    return transformedResults;

  } catch (err) {
    setError(err.message || 'An error occurred during plagiarism analysis');
    setIsProcessing(false);
    throw err;
  }
}, []);

  const compareSubmissions = useCallback(async (student1, matchName) => {
    setIsProcessing(true);
    setError(null);

    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const comparisonResult = getMockComparisonData(student1, matchName);
          resolve(comparisonResult);
          setIsProcessing(false);
        }, 800);
      });
    } catch (err) {
      setError(err.message || 'An error occurred during comparison');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const extractTextFromImage = useCallback(async (image) => {
    setIsProcessing(true);
    setError(null);

    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          const extractedText = getMockExtractedText();
          resolve(extractedText);
          setIsProcessing(false);
        }, 1000);
      });
    } catch (err) {
      setError(err.message || 'An error occurred during text extraction');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const generateReport = useCallback(async (data, reportType) => {
    setIsProcessing(true);
    setError(null);

    try {
      if (reportType === 'excel') {
        const XLSX = await import('xlsx');
        const workbook = XLSX.utils.book_new();
        
        const summaryData = [
          ['Quiz Name', data.quizName || 'Untitled Quiz'],
          ['Total Students', data.students?.length || 0],
          ['Average Score', data.averageScore || 0],
          ['Total Marks', data.students?.[0]?.total_marks || 0],
          ['Date Generated', new Date().toLocaleString()]
        ];
        
        const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        
        const studentHeaders = [
          'Student Name', 
          'Grade', 
          'Total Marks',
          'Obtained Marks',
          'AST Score', 
          'Final Score', 
          'Levenshtein Score',
          'Similarity Score',
          'Plagiarism Detected',
          'Extracted Text'
        ];
        
        const studentData = [studentHeaders];
        
        if (data.students && data.students.length > 0) {
          data.students.forEach(student => {
            const extractedText = Array.isArray(student.extractedText)
              ? student.extractedText.join('\n')
              : typeof student.extractedText === 'string'
                ? student.extractedText
                : 'No text extracted';
                
            studentData.push([
              student.name,
              student.grade || 'N/A',
              student.total_marks || 0,
              student.obtained_marks || 0,
              student.ast_score || 0,
              student.final_score || 0,
              student.levenshtein_score || 0,
              student.similarity || 0,
              student.plagiarismFlag ? 'Yes' : 'No',
              extractedText
            ]);
          });
        }
        
        const detailWorksheet = XLSX.utils.aoa_to_sheet(studentData);
        detailWorksheet['!cols'] = [
          {wch: 20}, {wch: 5}, {wch: 10}, {wch: 12}, {wch: 10},
          {wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 50}
        ];
        
        XLSX.utils.book_append_sheet(workbook, detailWorksheet, 'Student Details');
        
        if (data.students && data.students.length > 0) {
          data.students.forEach((student, index) => {
            const extractedText = Array.isArray(student.extractedText)
              ? student.extractedText.join('\n')
              : typeof student.extractedText === 'string'
                ? student.extractedText
                : 'No text extracted';
                
            const studentDetailData = [
              ['Student Name', student.name],
              ['Grade', student.grade || 'N/A'],
              ['Total Marks', student.total_marks || 0],
              ['Obtained Marks', student.obtained_marks || 0],
              ['AST Score', student.ast_score || 0],
              ['Final Score', student.final_score || 0],
              ['Levenshtein Score', student.levenshtein_score || 0],
              ['Similarity Score', student.similarity || 0],
              ['Plagiarism Detected', student.plagiarismFlag ? 'Yes' : 'No'],
              [''],
              ['Extracted Text:'],
              [extractedText]
            ];
            
            if (student.feedback && student.feedback.length > 0) {
              studentDetailData.push([''], ['Feedback:']);
              student.feedback.forEach(item => {
                studentDetailData.push([item]);
              });
            }
            
            const studentWorksheet = XLSX.utils.aoa_to_sheet(studentDetailData);
            studentWorksheet['!cols'] = [{wch: 20}, {wch: 50}];
            
            const safeStudentName = student.name
              .replace(/[^\w\s]/gi, '')
              .substring(0, 25);
              
            XLSX.utils.book_append_sheet(
              workbook, 
              studentWorksheet, 
              `Student ${index + 1} - ${safeStudentName}`
            );
          });
        }
        
        const fileName = `${data.quizName || 'quiz'}_report_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        setIsProcessing(false);
        return { success: true, fileName };
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            const reportData = getMockReportData(data, reportType);
            resolve(reportData);
            setIsProcessing(false);
          }, 1500);
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the report');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const getQuizzes = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/v1/quizzes/get_all_quizes/`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const results = await response.json();

      const quizzes = (results.quizes || []).map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        date: quiz.date,
        students: quiz.student_count
      }));

      setIsProcessing(false);
      return quizzes;
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const getStats = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/v1/quizzes/dashboard-stats/`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const apiResponse = await response.json();

      const statsArray = [
        {
          title: "Total Quizzes",
          value: apiResponse.total_quizzes,
          icon: "📊",
          description: "All-time quizzes created"
        }
      ];

      setIsProcessing(false);
      return {
        stats: statsArray,
        recentQuizzes: apiResponse.recent_quizzes || []
      };
    } catch (err) {
      setError(err.message || 'Failed to load stats');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const getActivities = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockRecentActivities);
          setIsProcessing(false);
        }, 800);
      });
    } catch (err) {
      setError(err.message || 'Failed to load activities');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const getQuizDetailsWithGrades = useCallback(async (quizId) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/api/v1/quizzes/quiz_view/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ quiz_id: quizId }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const results = await response.json();
      setIsProcessing(false);
      return results;
    } catch (err) {
      setError(err.message || 'Failed to load quiz details');
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const contextValue = {
    isProcessing,
    error,
    gradeQuiz,
    analyzePlagiarism,
    compareSubmissions,
    extractTextFromImage,
    generateReport,
    getQuizzes,
    getStats,
    getActivities,
    getQuizDetailsWithGrades,
    clearError: () => setError(null)
  };

  return (
    <ProcessingContext.Provider value={contextValue}>
      {children}
    </ProcessingContext.Provider>
  );
};

export default ProcessingProvider;
