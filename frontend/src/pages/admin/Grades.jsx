import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Search, Award } from 'lucide-react';
import StudentAvatar from '../../components/StudentAvatar';

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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Grade Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            View and search all student grades
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, subject, or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <p className="mt-3 text-sm text-gray-500">Loading grades...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pl-6">Student</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Subject</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Exam</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Grade</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Max</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Teacher</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pr-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Award className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-900">No grades found</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {grades.length === 0
                              ? 'Grades will appear here once teachers add them.'
                              : 'Try a different search term.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map((grade) => (
                      <tr key={grade._id} className="transition hover:bg-gray-50/80">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <StudentAvatar student={grade.student} size={36} />
                            <span className="font-medium text-gray-900">
                              {grade.student?.user?.name || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{grade.subject?.name || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{grade.examName || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 font-semibold text-gray-900">{grade.grade}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{grade.maxGrade}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{grade.teacher?.user?.name || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 sm:pr-6">
                          {new Date(grade.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminGrades;
