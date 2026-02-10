import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    fetchStudentId();
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchGrades();
    }
  }, [studentId]);

  const fetchStudentId = async () => {
    try {
      const response = await api.get('/students');
      const student = response.data.find((s) => s.user._id === user.id);
      if (student) {
        setStudentId(student._id);
      }
    } catch (error) {
      toast.error('Failed to fetch student data');
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get(`/grades/student/${studentId}`);
      setGrades(response.data);
    } catch (error) {
      toast.error('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-2">View your academic performance</p>
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Max Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No grades found
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => {
                    const percentage = ((grade.grade / grade.maxGrade) * 100).toFixed(1);
                    return (
                      <tr key={grade._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{grade.subject?.name || 'N/A'}</td>
                        <td className="py-3 px-4">{grade.examName}</td>
                        <td className="py-3 px-4 font-semibold">{grade.grade}</td>
                        <td className="py-3 px-4">{grade.maxGrade}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${
                              percentage >= 80
                                ? 'text-green-600'
                                : percentage >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(grade.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentGrades;
