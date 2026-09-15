import React, { useState, useEffect } from 'react';
import { useProcessing } from '../../context/ProcessingContext';

const QuizDetailsModal = ({ quizId, isOpen, onClose }) => {
  const [quizDetails, setQuizDetails] = useState(null);
  const { getQuizDetailsWithGrades, isProcessing } = useProcessing();

  useEffect(() => {
    if (quizId && isOpen) {
      getQuizDetailsWithGrades(quizId).then(setQuizDetails);
    }
  }, [quizId, isOpen, getQuizDetailsWithGrades]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {isProcessing ? (
            <div className="p-6 text-center">Loading quiz details...</div>
          ) : quizDetails ? (
            <>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-neutral-900">{quizDetails.name}</h3>
                  <div className="text-sm text-neutral-500">Date: {quizDetails.date}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-50 p-3 rounded">
                    <div className="text-sm text-neutral-600">Average Score</div>
                    <div className="text-xl font-semibold">{quizDetails.avgScore}%</div>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded">
                    <div className="text-sm text-neutral-600">Passing Rate</div>
                    <div className="text-xl font-semibold">{quizDetails.passingRate}</div>
                  </div>
                  <div className="bg-neutral-50 p-3 rounded">
                    <div className="text-sm text-neutral-600">Total Students</div>
                    <div className="text-xl font-semibold">{quizDetails.totalStudents}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {quizDetails.students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-4 py-3 text-sm">{student.name}</td>
                          <td className="px-4 py-3 text-sm font-medium">{student.grade}%</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              student.status === 'Passed' ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-500">{student.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-neutral-500">No quiz details available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetailsModal;
