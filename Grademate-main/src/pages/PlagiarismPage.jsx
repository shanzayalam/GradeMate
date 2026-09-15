import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import { useProcessing } from '../context/ProcessingContext';

const PlagiarismPage = () => {
  // State for the page
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [plagiarismData, setPlagiarismData] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [similarityFilter, setSimilarityFilter] = useState(0);
  const [viewType, setViewType] = useState('table');
  const [selectedPair, setSelectedPair] = useState(null);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0);

  // Get processing functions from context
  const { 
    isProcessing, 
    getQuizzes, 
    analyzePlagiarism, 
    compareSubmissions,
    generateReport 
  } = useProcessing();

  // Load quizzes on component mount
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const fetchedQuizzes = await getQuizzes();
        setQuizzes(fetchedQuizzes);
      } catch (error) {
        console.error('Failed to load quizzes:', error);
      }
    };

    loadQuizzes();
  }, [getQuizzes]);

  const handleQuizSelect = async (quizId) => {
    setSelectedQuiz(quizId);
    
    try {
      const result = await analyzePlagiarism(quizId);
      setPlagiarismData(result);
    } catch (error) {
      console.error('Plagiarism analysis error:', error);
    }
  };

  const handleCompareClick = async (student1, matchName, matchIndex = 0) => {
    setSelectedMatchIndex(matchIndex);
    
    try {
      const comparisonResult = await compareSubmissions(student1, matchName);
      setSelectedPair(comparisonResult);
    } catch (error) {
      console.error('Comparison error:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!plagiarismData) return;
    
    try {
      const report = await generateReport(plagiarismData, 'plagiarism');
      // In a real app, you would handle the report (download, display, etc.)
      console.log('Generated report:', report);
      alert(`Report generated! Download URL: ${report.downloadUrl}`);
    } catch (error) {
      console.error('Report generation error:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSimilarityFilterChange = (e) => {
    setSimilarityFilter(parseFloat(e.target.value));
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Optimize with useMemo to avoid recalculating on every render
  const filteredStudents = useMemo(() => {
    if (!plagiarismData) return [];
    
    return plagiarismData.students
      .filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        student.similarity >= similarityFilter
      )
      .sort((a, b) => {
        const comparison = a.similarity - b.similarity;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [plagiarismData, searchTerm, similarityFilter, sortOrder]);

  const renderQuizList = () => (
    <Card title="Select a Quiz" className="h-full">
      <div className="space-y-4">
        <p className="text-sm text-neutral-500">Select a quiz to view plagiarism analysis:</p>
        
        <div className="space-y-2">
          {quizzes.map(quiz => (
            <div 
              key={quiz.id}
              onClick={() => handleQuizSelect(quiz.id)}
              className="p-4 border border-neutral-200 rounded-md cursor-pointer hover:bg-neutral-50 transition-colors duration-150"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium text-neutral-800">{quiz.name}</h3>
                  <p className="text-sm text-neutral-500">{quiz.date} • {quiz.students} students</p>
                </div>
                <Button variant="outline" size="sm">Analyze</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderPlagiarismResults = () => {
    if (!plagiarismData) return null;

    const renderComparisonView = () => {
      if (!selectedPair) return null;
      
      return (
        <Card title="Detailed Comparison" className="mt-6">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">
                  Comparing: <span className="text-primary-600">{selectedPair.student1.name}</span> & <span className="text-primary-600">{selectedPair.student2.name}</span>
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Overall similarity: <span className="font-medium text-danger-600">{(selectedPair.student1.similarity * 100).toFixed(0)}%</span>
                </p>
              </div>
              
              <div className="mt-2 sm:mt-0 flex space-x-2">
                {selectedPair.student1.matches.length > 1 && (
                  <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden mr-2">
                    {selectedPair.student1.matches.map((match, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCompareClick(selectedPair.student1, match, idx)}
                        className={`text-xs py-1 px-2 ${
                          selectedMatchIndex === idx 
                            ? 'bg-primary-50 text-primary-600 font-medium' 
                            : 'bg-white text-neutral-600'
                        }`}
                      >
                        {match}
                      </button>
                    ))}
                  </div>
                )}
                
                <Button variant="outline" size="sm" onClick={() => setSelectedPair(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedPair.comparisonDetails.map((detail, idx) => (
              <div key={idx} className="border border-neutral-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-neutral-700">{detail.section}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    detail.similarity > 0.8 
                      ? 'bg-danger-100 text-danger-800' 
                      : detail.similarity > 0.5 
                        ? 'bg-warning-100 text-warning-800' 
                        : 'bg-success-100 text-success-800'
                  }`}>
                    {(detail.similarity * 100).toFixed(0)}% Similar
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="p-3 bg-neutral-50 rounded-md">
                    <p className="text-xs text-neutral-500 mb-1">{selectedPair.student1.name}</p>
                    <p className="text-sm text-neutral-800">{detail.text1}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-md">
                    <p className="text-xs text-neutral-500 mb-1">{selectedPair.student2.name}</p>
                    <p className="text-sm text-neutral-800">{detail.text2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => {}}>
                Generate Report for This Pair
              </Button>
            </div>
          </div>
        </Card>
      );
    };
    
    const highSimilarityCount = filteredStudents.filter(s => s.similarity >= 0.5).length;
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-800">Plagiarism Analysis: {plagiarismData.quizName}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {plagiarismData.totalStudents} student submissions • Average similarity: {(plagiarismData.averageSimilarity * 100).toFixed(0)}% • 
            <span className={highSimilarityCount > 0 ? "text-danger-600" : "text-success-600"}>
              {highSimilarityCount} high similarity {highSimilarityCount === 1 ? 'submission' : 'submissions'}
            </span>
          </p>
        </div>
        
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="w-full md:w-1/3">
                <InputField
                  id="search"
                  name="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-neutral-600">Min similarity:</span>
                  <select
                    value={similarityFilter}
                    onChange={handleSimilarityFilterChange}
                    className="form-select rounded-md border border-neutral-200 text-sm py-1 px-2"
                  >
                    <option value={0}>All</option>
                    <option value={0.3}>≥ 30%</option>
                    <option value={0.5}>≥ 50%</option>
                    <option value={0.7}>≥ 70%</option>
                  </select>
                </div>
                
                <button
                  onClick={handleSortToggle}
                  className="flex items-center text-sm text-neutral-600 hover:text-neutral-900"
                  aria-label={`Sort by similarity ${sortOrder === 'desc' ? 'descending' : 'ascending'}`}
                >
                  <span>Similarity</span>
                  <span className="ml-1">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                </button>
                
                <div className="flex border border-neutral-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewType('table')}
                    className={`p-1.5 ${viewType === 'table' ? 'bg-primary-50 text-primary-600' : 'bg-white text-neutral-500'}`}
                    aria-label="Table view"
                    title="Table view"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => setViewType('grid')}
                    className={`p-1.5 ${viewType === 'grid' ? 'bg-primary-50 text-primary-600' : 'bg-white text-neutral-500'}`}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    📊
                  </button>
                </div>
              </div>
            </div>
            
            {viewType === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Similarity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Matched With</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-800">{student.name}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className={`mr-2 h-2 rounded-full ${
                                student.similarity >= 0.7 
                                  ? 'bg-danger-500' 
                                  : student.similarity >= 0.5 
                                    ? 'bg-warning-500' 
                                    : 'bg-success-500'
                              }`}
                              style={{ width: `${Math.max(student.similarity * 100, 8)}px` }}
                              aria-hidden="true"
                            ></div>
                            <span className="text-sm text-neutral-800">{(student.similarity * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">
                            {student.matches.length > 0 
                              ? student.matches.join(', ') 
                              : <span className="text-neutral-400">None</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {student.flag ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-danger-100 text-danger-800">
                              Flagged
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                              No Issues
                            </span>
                          )}
                        </td>
                        {/* <td className="px-4 py-4 whitespace-nowrap">
                          {student.matches.length > 0 ? (
                            <div className="flex space-x-2">
                              <select 
                                className="text-xs border border-neutral-200 rounded py-1 px-1.5"
                                onChange={(e) => handleCompareClick(student, e.target.value)}
                                aria-label="Select student to compare with"
                              >
                                <option value="">Compare with...</option>
                                {student.matches.map((match, idx) => (
                                  <option key={idx} value={match}>
                                    {match}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-xs">No matches</span>
                          )}
                        </td> */}
                      </tr>
                    ))}
                    
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-sm text-neutral-500">
                          No students match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map(student => (
                  <Card key={student.id} className="h-full" hoverable>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-neutral-800">{student.name}</h3>
                        <div className="mt-2 flex items-center">
                          <div 
                            className={`mr-2 h-3 rounded-full ${
                              student.similarity >= 0.7 
                                ? 'bg-danger-500' 
                                : student.similarity >= 0.5 
                                  ? 'bg-warning-500' 
                                  : 'bg-success-500'
                            }`}
                            style={{ width: `${Math.max(student.similarity * 100 / 2, 8)}px` }}
                            aria-hidden="true"
                          ></div>
                          <span className="text-sm font-medium">{(student.similarity * 100).toFixed(0)}% Similarity</span>
                        </div>
                      </div>
                      {student.flag && (
                        <span className="px-2 py-1 text-xs rounded-full bg-danger-100 text-danger-800">
                          Flagged
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 text-sm text-neutral-600">
                      <p className="font-medium mb-1">Matched with:</p>
                      {student.matches.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {student.matches.map((match, idx) => (
                            <li key={idx} className="ml-1">
                              <button 
                                className="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none"
                                onClick={() => handleCompareClick(student, match, idx)}
                              >
                                {match}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-400">None</p>
                      )}
                    </div>
                    
                    {/* {student.matches.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-neutral-100">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => handleCompareClick(student, student.matches[0], 0)}
                        >
                          Compare Submissions
                        </Button>
                      </div>
                    )} */}
                  </Card>
                ))}
                
                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-6 text-neutral-500">
                    No students match your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
        
        {renderComparisonView()}
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setPlagiarismData(null)}>
            Back to Quiz List
          </Button>
          
          <Button variant="primary" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {isProcessing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-neutral-300 border-t-primary-500 mb-4" aria-hidden="true"></div>
              <p className="text-neutral-600">Processing your request...</p>
            </div>
          </div>
        ) : plagiarismData ? (
          renderPlagiarismResults()
        ) : (
          renderQuizList()
        )}
      </div>
    </Layout>
  );
};

export default PlagiarismPage;