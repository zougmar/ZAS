import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const StudentTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState(null);

  useEffect(() => {
    fetchClassId();
  }, []);

  useEffect(() => {
    if (classId) {
      fetchTimetable();
    }
  }, [classId]);

  const fetchClassId = async () => {
    try {
      const response = await api.get('/students');
      const student = response.data.find((s) => s.user._id === user.id);
      if (student && student.class) {
        setClassId(student.class._id);
      }
    } catch (error) {
      toast.error('Failed to fetch student data');
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/timetable/class/${classId}`);
      setTimetable(response.data);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getTimetableForDay = (day) => {
    return timetable.filter((item) => item.dayOfWeek === day);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-600 mt-2">View your class schedule</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOfWeek.map((day) => {
                const daySchedule = getTimetableForDay(day);
                return (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 capitalize">{day}</h3>
                    {daySchedule.length === 0 ? (
                      <p className="text-gray-500 text-sm">No classes scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule.map((item) => (
                          <div key={item._id} className="bg-gray-50 p-3 rounded">
                            <p className="font-medium text-sm">{item.subject?.name}</p>
                            <p className="text-xs text-gray-600">
                              {item.startTime} - {item.endTime}
                            </p>
                            <p className="text-xs text-gray-500">Teacher: {item.teacher?.user?.name}</p>
                            {item.room && <p className="text-xs text-gray-500">Room: {item.room}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentTimetable;
