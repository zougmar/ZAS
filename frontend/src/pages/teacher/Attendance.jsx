import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

const TeacherAttendance = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      const classStudents = response.data.filter((s) => s.class?._id === selectedClass);
      setStudents(classStudents);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/class/${selectedClass}?date=${selectedDate}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await api.post('/attendance', {
        student: studentId,
        date: selectedDate,
        status,
      });
      toast.success('Attendance marked successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const getStudentStatus = (studentId) => {
    const record = attendance.find((a) => a.student?._id === studentId);
    return record?.status || null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Mark student attendance for your classes</p>
        </div>

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const status = getStudentStatus(student._id);
                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{student.user?.name}</p>
                      <p className="text-sm text-gray-500">{student.user?.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => markAttendance(student._id, 'present')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(student._id, 'absent')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          status === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(student._id, 'late')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          status === 'late'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherAttendance;
