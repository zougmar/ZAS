import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const AdminGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades');
      setGrades(response.data);
    } catch (error) {
      toast.error('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(
    (grade) =>
      grade.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.examName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Reports</h1>
          <p className="text-gray-600 mt-2">View all student grades</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by student, subject, or exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Max Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No grades found
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade) => (
                    <tr key={grade._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{grade.student?.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{grade.subject?.name || 'N/A'}</td>
                      <td className="py-3 px-4">{grade.examName}</td>
                      <td className="py-3 px-4 font-semibold">{grade.grade}</td>
                      <td className="py-3 px-4">{grade.maxGrade}</td>
                      <td className="py-3 px-4">{grade.teacher?.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {new Date(grade.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminGrades;
