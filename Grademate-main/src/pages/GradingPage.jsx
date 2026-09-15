import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { useProcessing } from '../context/ProcessingContext';

const GradingSchema = Yup.object().shape({
  quizName: Yup.string().required('Quiz name is required'),
  logicWeight: Yup.number()
    .min(0, 'Weight must be at least 0')
    .max(1, 'Weight must be at most 1')
    .required('Logic weight is required'),
  similarityThreshold: Yup.number()
    .min(0, 'Threshold must be at least 0')
    .max(1, 'Threshold must be at most 1')
    .required('Similarity threshold is required'),
  solutionImage: Yup.mixed().required('Solution image is required'),
  studentSubmissions: Yup.array().of(
    Yup.object().shape({
      studentName: Yup.string().required('Student name is required'),
      image: Yup.mixed().required('Student submission image is required'),
    })
  ).min(1, 'At least one student submission is required'),
});

const GradingPage = () => {
  const [gradingResults, setGradingResults] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { isProcessing, gradeQuiz, generateReport } = useProcessing();

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log( values);
    try {
            const results = await gradeQuiz(values);
      setGradingResults(results);
      setSelectedStudent(results.students[0]);
    } catch (error) {
      console.error('Grading error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!gradingResults) return;
    
    try {
      // Generate Excel report with the grading data
      const report = await generateReport(gradingResults, 'excel');
      
      if (report.success) {
        console.log('Excel report generated successfully:', report.fileName);
      } else {
        console.error('Failed to generate Excel report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }
  };

  const renderGradingResults = () => {
    if (!gradingResults) return null;

    // Ensure solutionImageText is properly formatted
    const formattedSolutionText = Array.isArray(gradingResults.solutionImageText) 
      ? gradingResults.solutionImageText.join('\n') 
      : typeof gradingResults.solutionImageText === 'string' 
        ? gradingResults.solutionImageText 
        : 'No text extracted from the solution image.';

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Grading Results: {gradingResults.quizName}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {gradingResults.totalStudents} submissions graded • Average score: {(gradingResults.averageScore || 0).toFixed(1)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Student Results" className="lg:col-span-1">
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {gradingResults.students.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id 
                      ? 'bg-primary-50 border-l-4 border-primary-500' 
                      : 'hover:bg-neutral-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-800 truncate">{student.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-neutral-500 mr-3">Score: {student.obtained_marks}/{student.total_marks}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800 inline-block">
                          Grade: {student.grade}
                        </span>
                        {student.levenshtein_score > 18 && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-danger-100 text-danger-800 inline-block">
                            Plagiarism
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-2xl flex-shrink-0 ml-2">
                      {student.grade === 'A' ? '🌟' : student.grade === 'B' ? '👍' : student.grade === 'C' ? '👌' : '🔄'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {selectedStudent && (
            <div className="lg:col-span-2 space-y-6">
              <Card title="Grading Preview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-neutral-700 mb-2">Solution</h3>
                    <div className="border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 p-4 h-[300px] flex items-center justify-center">
                      {gradingResults.solutionImage ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={gradingResults.solutionImage} 
                            alt="Solution" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="text-neutral-500">No solution image available</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-primary-700">OCR Extracted Text (Solution)</h4>
                      <div className="p-3 border border-primary-200 rounded-md bg-primary-50">
                        <pre className="text-sm text-neutral-600 break-words whitespace-pre-wrap">
                          {formattedSolutionText}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-700 mb-2">Student Submission</h3>
                    <div className="border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 p-4 h-[300px] flex items-center justify-center">
                      {selectedStudent.image ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={selectedStudent.image} 
                            alt="Student Submission" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="text-neutral-500">No submission image available</p>
                      )}
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-primary-700">OCR Extracted Text (Submission)</h4>
                      <div className="p-3 border border-primary-200 rounded-md bg-primary-50">
                        <pre className="text-sm text-neutral-600 break-words whitespace-pre-wrap">
                          {Array.isArray(selectedStudent.extractedText)
                            ? selectedStudent.extractedText.join('\n')
                            : typeof selectedStudent.extractedText === 'string'
                              ? selectedStudent.extractedText
                              : 'No text extracted from the student submission.'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <h3 className="font-medium text-neutral-700 mb-3">Score Breakdown</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-neutral-100 rounded-md">
                        <p className="text-sm text-neutral-500">AST Score</p>
                        <p className="text-lg font-semibold">{selectedStudent.ast_score}</p>
                      </div>
                      <div className="p-3 border border-neutral-100 rounded-md">
                        <p className="text-sm text-neutral-500">Final Score</p>
                        <p className="text-lg font-semibold">{selectedStudent.final_score.toFixed(2)}</p>
                      </div>
                      <div className="p-3 border border-neutral-100 rounded-md">
                        <p className="text-sm text-neutral-500">Levenshtein Score</p>
                        <p className="text-lg font-semibold">{selectedStudent.levenshtein_score}</p>
                      </div>
                      <div className="p-3 border border-neutral-100 rounded-md">
                        <p className="text-sm text-neutral-500">Grade</p>
                        <p className="text-lg font-semibold">{selectedStudent.grade}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="font-medium text-yellow-800">Analysis Summary</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This submission received {selectedStudent.obtained_marks} out of {selectedStudent.ast_score} marks.
                        {selectedStudent.levenshtein_score > 15 ? 
                          " The code has significant similarities with other submissions." : 
                          " The code appears to be original work."}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="secondary" onClick={() => setGradingResults(null)}>
            Grade Another Quiz
          </Button>
          <Button variant="primary" onClick={handleGenerateReport}>
            Export Results
          </Button>
        </div>
      </div>
    );
  };

  const renderGradingForm = () => (
    <Card title="Grade a New Quiz">
      <Formik
        initialValues={{
          quizName: '',
          logicWeight: 0.7,
          similarityThreshold: 0.3, // Changed initial value to be complementary to logicWeight
          total: 100, // Default question count
          solutionImage: null,
          studentSubmissions: [],
        }}
        validationSchema={GradingSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8">
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-8">
                      <InputField
                        id="quizName"
                        name="quizName"
                        label="Quiz Name"
                        placeholder="Quiz name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.quizName}
                        error={errors.quizName}
                        touched={touched.quizName}
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <InputField
                        id="total"
                        name="total"
                        type="number"
                        label="Total Marks"
                        placeholder="Total Marks"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.total}
                        error={errors.total}
                        touched={touched.total}
                        required
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      id="logicWeight"
                      name="logicWeight"
                      type="slider"
                      label="Logic Weight"
                      helperText="Logic weight (1 - Similarity)"
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setFieldValue('logicWeight', newValue);
                        // Update similarityThreshold to be complementary (sum to 1)
                        setFieldValue('similarityThreshold', parseFloat((1 - newValue).toFixed(1)));
                      }}
                      onBlur={handleBlur}
                      value={values.logicWeight}
                      error={errors.logicWeight}
                      touched={touched.logicWeight}
                      required
                      min="0"
                      max="1"
                      step="0.1"
                    />
                    <InputField
                      id="similarityThreshold"
                      name="similarityThreshold"
                      type="slider"
                      label="Similarity"
                      helperText="Similarity weight (1 - Logic)"
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setFieldValue('similarityThreshold', newValue);
                        // Update logicWeight to be complementary (sum to 1)
                        setFieldValue('logicWeight', parseFloat((1 - newValue).toFixed(1)));
                      }}
                      onBlur={handleBlur}
                      value={values.similarityThreshold}
                      error={errors.similarityThreshold}
                      touched={touched.similarityThreshold}
                      required
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                  <InputField
                    id="solutionImage"
                    name="solutionImage"
                    type="file"
                    label="Solution Image"
                    helperText="Upload solution"
                    accept="image/*"
                    onChange={(event) => {
                      setFieldValue('solutionImage', event.currentTarget.files[0]);
                    }}
                    onBlur={handleBlur}
                    error={errors.solutionImage}
                    touched={touched.solutionImage}
                    value={values.solutionImage}
                    required
                  />
                </div>
              </div>
              
              <div className="col-span-12 md:col-span-4">
                {values.solutionImage ? (
                  <div className="h-[350px] border rounded-lg overflow-hidden bg-neutral-50">
                    <div className="relative w-full h-full group p-2">
                      <img
                        src={URL.createObjectURL(values.solutionImage)}
                        alt="Solution Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFieldValue('solutionImage', null)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-200 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px] border rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center text-neutral-400">
                    <span>Solution preview will appear here</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <h3 className="text-lg font-medium text-neutral-800 mb-4">Student Submissions</h3>

              <div className="space-y-4">
                <InputField
                  id="batchUpload"
                  name="batchUpload"
                  type="file"
                  label="Batch Upload Images"
                  helperText="Upload all student submission images at once"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.currentTarget.files);
                    const submissions = files.map((file) => ({
                      studentName: '',
                      image: file,
                    }));
                    setFieldValue('studentSubmissions', submissions);
                  }}
                />

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {values.studentSubmissions.map((submission, index) => (
                    <div key={index} className="p-4 border border-neutral-200 rounded-md bg-neutral-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          id={`studentSubmissions.${index}.studentName`}
                          name={`studentSubmissions.${index}.studentName`}
                          label="Student Name"
                          placeholder="e.g., John Doe"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.studentSubmissions[index].studentName}
                          error={
                            errors.studentSubmissions &&
                            errors.studentSubmissions[index] &&
                            errors.studentSubmissions[index].studentName
                          }
                          touched={
                            touched.studentSubmissions &&
                            touched.studentSubmissions[index] &&
                            touched.studentSubmissions[index].studentName
                          }
                          required
                        />

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Uploaded Image
                          </label>
                          <div className="border border-neutral-200 rounded-md overflow-hidden bg-neutral-50 p-4 h-[150px] flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(submission.image)}
                              alt={`Student Submission ${index + 1}`}
                              className="max-h-full max-w-full"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2  text-red-400"
                            onClick={() => {
                              const updatedSubmissions = [...values.studentSubmissions];
                              updatedSubmissions.splice(index, 1);
                              setFieldValue('studentSubmissions', updatedSubmissions);
                            }}
                          >
                            Remove Student Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isProcessing}
              >
                {isProcessing ? 'Grading...' : 'Start Grading'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Quiz Grading</h1>
          <p className="mt-1 text-sm text-neutral-500">Upload student submissions and a solution to grade quizzes automatically.</p>
        </div>
        
        {isProcessing && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-300 border-t-primary-500 mb-4" aria-hidden="true"></div>
              <p className="text-neutral-600">Processing your request...</p>
            </div>
          </div>
        )}
        
        {!isProcessing && gradingResults ? renderGradingResults() : renderGradingForm()}
      </div>
    </Layout>
  );
};

export default GradingPage;