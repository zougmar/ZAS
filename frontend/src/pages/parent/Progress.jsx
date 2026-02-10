import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const ParentProgress = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/students');
      const parent = await api.get('/parents');
      const parentId = parent.data.find((p) => p.user._id === user.id)?._id;
      if (parentId) {
        const myChildren = response.data.filter((s) => s.parent?._id === parentId);
        setChildren(myChildren);
        if (myChildren.length > 0) {
          setSelectedChild(myChildren[0]._id);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch children data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async () => {
    try {
      const [gradesRes, attendanceRes] = await Promise.all([
        api.get(`/grades/student/${selectedChild}`),
        api.get(`/attendance/student/${selectedChild}`),
      ]);
      setGrades(gradesRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      toast.error('Failed to fetch child data');
    }
  };

  const selectedChildData = children.find((c) => c._id === selectedChild);

  const attendanceStats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    late: attendance.filter((a) => a.status === 'late').length,
    total: attendance.length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Child Progress</h1>
          <p className="text-gray-600 mt-2">Monitor your child's academic progress</p>
        </div>

        {children.length > 0 && (
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="input"
            >
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedChildData && (
          <>
            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{attendanceStats.total}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{attendanceStats.present}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{attendanceStats.absent}</p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{attendanceStats.late}</p>
              </div>
            </div>

            {/* Grades */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
              {grades.length === 0 ? (
                <p className="text-gray-500">No grades available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Exam</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Max</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{grade.subject?.name || 'N/A'}</td>
                          <td className="py-3 px-4">{grade.examName}</td>
                          <td className="py-3 px-4 font-semibold">{grade.grade}</td>
                          <td className="py-3 px-4">{grade.maxGrade}</td>
                          <td className="py-3 px-4">
                            {new Date(grade.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ParentProgress;
