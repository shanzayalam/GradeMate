/**
 * Centralized mock data for the Teacher Assistant application
 */

// Mock quizzes for the dashboard and plagiarism pages
export const mockQuizzes = [
  { id: 1, name: 'Math Quiz 101', date: 'Apr 10, 2025', students: 24, graded: 24, plagiarism: 0 },
  { id: 2, name: 'History Essay', date: 'Apr 5, 2025', students: 22, graded: 22, plagiarism: 2 },
  { id: 3, name: 'Physics Midterm', date: 'Mar 28, 2025', students: 26, graded: 26, plagiarism: 1 },
];

// Mock students for plagiarism analysis
export const mockPlagiarismStudents = [
  { id: 1, name: 'Alice Johnson', similarity: 0.85, flag: true, matches: ['Bob Smith', 'Charlie Brown'] },
  { id: 2, name: 'Bob Smith', similarity: 0.78, flag: true, matches: ['Alice Johnson'] },
  { id: 3, name: 'Charlie Brown', similarity: 0.75, flag: true, matches: ['Alice Johnson'] },
  { id: 4, name: 'David Lee', similarity: 0.62, flag: true, matches: ['Emma Davis'] },
  { id: 5, name: 'Emma Davis', similarity: 0.58, flag: true, matches: ['David Lee'] },
  { id: 6, name: 'Frank Wilson', similarity: 0.42, flag: false, matches: [] },
  { id: 7, name: 'Grace Miller', similarity: 0.38, flag: false, matches: [] },
  { id: 8, name: 'Henry Moore', similarity: 0.32, flag: false, matches: [] },
  { id: 9, name: 'Isabella Taylor', similarity: 0.28, flag: false, matches: [] },
  { id: 10, name: 'Jack Anderson', similarity: 0.25, flag: false, matches: [] },
  { id: 11, name: 'Karen Thomas', similarity: 0.21, flag: false, matches: [] },
  { id: 12, name: 'Liam Robinson', similarity: 0.18, flag: false, matches: [] },
];

// Mock plagiarism data for a specific quiz
export const getMockPlagiarismData = (quizId) => {
  // Get the specific quiz data
  const quiz = mockQuizzes.find(q => q.id === quizId) || mockQuizzes[1];
  
  return {
    quizName: quiz.name,
    date: quiz.date,
    totalStudents: quiz.students,
    averageSimilarity: 0.32,
    highSimilarityCount: 5,
    students: mockPlagiarismStudents,
  };
};

// Mock comparison data for plagiarism checking
export const getMockComparisonData = (student1, matchName) => {
  return {
    student1,
    student2: { name: matchName, similarity: student1.similarity },
    overallSimilarity: student1.similarity,
    comparisonDetails: [
      { section: 'Introduction', similarity: 0.92, text1: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...', text2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...' },
      { section: 'Main Argument', similarity: 0.75, text1: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...', text2: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...' },
      { section: 'Conclusion', similarity: 0.83, text1: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...', text2: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...' },
    ]
  };
};

// Mock grading data for a submitted quiz
export const getMockGradingResults = (values) => {
  return {
    quizName: values.quizName,
    totalStudents: values.studentSubmissions.length,
    averageScore: 82.5,
    solutionImage: values.solutionImage,
    solutionImageText: 'Mock extracted text from solution image',
    students: values.studentSubmissions.map((submission, index) => ({
      id: index + 1,
      name: submission.studentName,
      image: submission.image,
      score: Math.floor(Math.random() * 31) + 70, // Random score between 70-100
      similarity: parseFloat((Math.random() * 0.6 + 0.2).toFixed(2)), // Random similarity between 0.2-0.8
      plagiarismFlag: Math.random() > 0.8,
      extractedText: 'Mock extracted text from student submission',
      feedback: [
        { question: 1, correct: true, points: 10, feedback: 'Correct solution' },
        { question: 2, correct: Math.random() > 0.5, points: Math.random() > 0.5 ? 10 : 5, feedback: 'Partial credit given' },
        { question: 3, correct: Math.random() > 0.5, points: Math.random() > 0.5 ? 10 : 0, feedback: 'Incorrect approach' },
      ]
    })),
  };
};

// Mock Quiz Details with Student Grades
export const mockQuizDetailsWithGrades = [
  {
    id: 1,
    name: 'Math Quiz 101',
    date: 'Apr 10, 2025',
    totalStudents: 24,
    avgScore: 85.5,
    highestScore: 98,
    lowestScore: 72,
    passingRate: '92%',
    students: [
      { id: 1, name: 'John Doe', grade: 98, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Excellent work' },
      { id: 2, name: 'Jane Smith', grade: 85, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good effort' },
      { id: 3, name: 'Mike Johnson', grade: 72, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Needs improvement' },
      { id: 4, name: 'Emily Wilson', grade: 91, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Very good work' },
      { id: 5, name: 'Alex Brown', grade: 88, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good understanding shown' },
      { id: 6, name: 'Olivia Garcia', grade: 76, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Review chapter 3' },
      { id: 7, name: 'Ethan Martinez', grade: 94, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Excellent problem solving' },
      { id: 8, name: 'Sofia Lopez', grade: 82, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good work overall' },
      { id: 9, name: 'Daniel Lee', grade: 78, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'More practice needed' },
      { id: 10, name: 'Ava Williams', grade: 89, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Strong performance' },
      { id: 11, name: 'Noah Clark', grade: 84, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good work' },
      { id: 12, name: 'Isabella Taylor', grade: 93, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Excellent analysis' },
      { id: 13, name: 'William Turner', grade: 79, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Review formulas' },
      { id: 14, name: 'Sophia Adams', grade: 86, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good approach' },
      { id: 15, name: 'Mason Rodriguez', grade: 81, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good effort' },
      { id: 16, name: 'Mia Hernandez', grade: 95, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Excellent work' },
      { id: 17, name: 'James King', grade: 77, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Continue practicing' },
      { id: 18, name: 'Charlotte Scott', grade: 83, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good progress' },
      { id: 19, name: 'Benjamin Green', grade: 90, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Very good work' },
      { id: 20, name: 'Amelia Baker', grade: 87, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Good understanding' },
      { id: 21, name: 'Lucas Hill', grade: 74, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'More practice needed' },
      { id: 22, name: 'Evelyn Carter', grade: 92, status: 'Passed', submissionDate: 'Apr 10, 2025', feedback: 'Excellent reasoning' },
      { id: 23, name: 'Henry Watson', grade: 68, status: 'Failed', submissionDate: 'Apr 10, 2025', feedback: 'Please see me after class' },
      { id: 24, name: 'Abigail Reed', grade: 65, status: 'Failed', submissionDate: 'Apr 10, 2025', feedback: 'Requires additional help' }
    ],
    gradeDistribution: {
      'A (90-100)': 5,
      'B (80-89)': 10,
      'C (70-79)': 7,
      'D (60-69)': 2,
      'F (0-59)': 0
    }
  }
];

export const getMockQuizDetailsWithGrades = (quizId) => {
  const quiz = mockQuizDetailsWithGrades.find(q => q.id === quizId);
  if (!quiz) return null;
  return {
    ...quiz,
    loading: false,
    error: null
  };
};

// Mock data for recent activities on dashboard
export const mockRecentActivities = [
  {
    icon: '📝',
    title: 'Math Quiz 101 - Grade Updated',
    description: 'You updated grades for 12 students.',
    time: '2 hours ago'
  },
  {
    icon: '🔍',
    title: 'Plagiarism Check Complete',
    description: 'History Quiz: 2 instances of plagiarism detected',
    time: '1 day ago'
  },
  {
    icon: '🔄',
    title: 'Solution Updated',
    description: 'Physics Quiz: Updated solution key for question #5',
    time: '2 days ago'
  },
];

// Mock dashboard statistics
export const mockDashboardStats = [
  { 
    title: 'Total Quizzes', 
    value: '24', 
    icon: '📚', 
    description: '6 this month', 
    trend: 'up', 
    trendValue: '15% from last month'
  },
  { 
    title: 'Graded', 
    value: '18', 
    icon: '✅', 
    description: '75% completion',
    trend: 'up', 
    trendValue: '12% from last month'
  },
  { 
    title: 'Pending', 
    value: '6', 
    icon: '⏱️', 
    description: 'Need attention',
    trend: 'down', 
    trendValue: '3 less than last month'
  },
  { 
    title: 'Plagiarism Detected', 
    value: '3', 
    icon: '🔍', 
    description: 'Across 2 quizzes',
    trend: 'down', 
    trendValue: '2 less than last month'
  },
];

// Mock report generation data
export const getMockReportData = (data, reportType) => {
  return {
    type: reportType,
    timestamp: new Date().toISOString(),
    downloadUrl: 'https://example.com/reports/mock-report.pdf',
    summary: `Mock ${reportType} report for ${data.quizName || 'quiz'}`,
  };
};

// Mock extracted text from OCR
export const getMockExtractedText = () => {
  return 'This is mock extracted text from an image. In a real application, this would use OCR technology to extract the actual text content from the image.';
};
