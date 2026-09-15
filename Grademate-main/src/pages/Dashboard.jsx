import React, { useEffect, useState } from 'react';
import Layout from '../components/ui/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { useProcessing } from '../context/ProcessingContext';
import QuizDetailsModal from '../components/dashboard/QuizDetailsModal';

const StatCard = ({ title, value, icon, description, trend, trendValue }) => (
  <Card className="h-full hover:shadow-medium transition-shadow duration-200" hoverable>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-neutral-900">{value}</p>
      </div>
      <div className="text-3xl text-neutral-400">{icon}</div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getQuizzes, getStats, isProcessing } = useProcessing();

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await getStats();
        setStats(dashboardData.stats);
        setQuizzes(dashboardData.recentQuizzes);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, [getStats]);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Welcome back! Here's what's happening with your classes.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="w-[100%]">
          {/* Recent Quizzes */}
          <div className="lg:col-span-2">
            <Card title="Recent Quizzes" className="h-full">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-neutral-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quiz</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {quizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-neutral-50 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-800">{quiz.name}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-500">{quiz.date}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{quiz.student_count}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={async () => {
                              try {
                                setSelectedQuiz(quiz);
                                setIsModalOpen(true);
                                // Call the API to get quiz details
                                const quizDetails = await getQuizDetailsWithGrades(quiz.id);
                                // You may want to set these details in state if needed
                                setSelectedQuiz({ ...quiz, ...quizDetails });
                              } catch (error) {
                                console.error('Failed to load quiz details:', error);
                              }
                            }}
                            className="text-primary-600 hover:text-primary-700 mr-3"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-medium transition-shadow duration-200" hoverable>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Grade New Quiz</h3>
                <p className="mt-1 text-sm text-neutral-500">Upload student submissions and a solution key to grade a new quiz.</p>
              </div>
              <Link to="/grading">
                <Button variant="primary">Grade Now</Button>
              </Link>
            </div>
          </Card>

          <Card className="hover:shadow-medium transition-shadow duration-200" hoverable>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-800">Plagiarism Check</h3>
                <p className="mt-1 text-sm text-neutral-500">Check for similarities between student submissions.</p>
              </div>
              <Link to="/plagiarism">
                <Button variant="primary">Check Now</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
      <QuizDetailsModal
        quizId={selectedQuiz?.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default Dashboard;