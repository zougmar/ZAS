import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  CalendarDays,
  User,
} from 'lucide-react';

const DAYS = [
  { key: 'monday', short: 'Mon', label: 'Monday' },
  { key: 'tuesday', short: 'Tue', label: 'Tuesday' },
  { key: 'wednesday', short: 'Wed', label: 'Wednesday' },
  { key: 'thursday', short: 'Thu', label: 'Thursday' },
  { key: 'friday', short: 'Fri', label: 'Friday' },
  { key: 'saturday', short: 'Sat', label: 'Saturday' },
  { key: 'sunday', short: 'Sun', label: 'Sunday' },
];

const getTodayKey = () => {
  const d = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return d[new Date().getDay()];
};

const StudentTimetable = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState(null);
  const todayKey = getTodayKey();

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
    } finally {
      setLoading(false);
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

  const getTimetableForDay = (dayKey) =>
    timetable.filter((item) => item.dayOfWeek === dayKey);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Timetable
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Your weekly class schedule
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
            <p className="mt-3 text-sm text-gray-500">Loading timetable...</p>
          </div>
        ) : !classId ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">No class assigned</p>
            <p className="mt-1 text-sm text-gray-500">Your timetable will appear here once you are assigned to a class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {DAYS.map(({ key, short, label }) => {
              const daySchedule = getTimetableForDay(key);
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                    isToday
                      ? 'border-primary-300 ring-2 ring-primary-500/20'
                      : 'border-gray-200'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b px-4 py-3 ${
                      isToday ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className={`h-5 w-5 ${isToday ? 'text-primary-600' : 'text-gray-500'}`}
                      />
                      <h2 className="font-semibold text-gray-900">{label}</h2>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    {daySchedule.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Calendar className="h-10 w-10 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">No classes scheduled</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule
                          .sort(
                            (a, b) =>
                              a.startTime.localeCompare(b.startTime) ||
                              (a.endTime || '').localeCompare(b.endTime || '')
                          )
                          .map((item) => (
                            <div
                              key={item._id}
                              className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 transition hover:border-primary-200 hover:bg-primary-50/50"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {item.subject?.name || '—'}
                                  </p>
                                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    {item.teacher?.user?.name || '—'}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 shrink-0" />
                                      {item.startTime} – {item.endTime}
                                    </span>
                                    {item.room && (
                                      <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        {item.room}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentTimetable;
