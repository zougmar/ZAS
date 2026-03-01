import { useEffect, useState, useMemo } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Users,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import StudentAvatar from '../../components/StudentAvatar';

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
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

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/attendance/class/${selectedClass}?date=${selectedDate}`);
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const present = attendance.filter((r) => r.status === 'present').length;
    const absent = attendance.filter((r) => r.status === 'absent').length;
    const late = attendance.filter((r) => r.status === 'late').length;
    return { present, absent, late, total: attendance.length };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    if (!searchTerm.trim()) return attendance;
    const term = searchTerm.toLowerCase();
    return attendance.filter(
      (r) =>
        (r.student?.user?.name || '').toLowerCase().includes(term) ||
        (r.markedBy?.user?.name || '').toLowerCase().includes(term)
    );
  }, [attendance, searchTerm]);

  const getStatusConfig = (status) => {
    const configs = {
      present: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: UserCheck,
        label: 'Present',
      },
      absent: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: UserX,
        label: 'Absent',
      },
      late: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Late',
      },
    };
    return configs[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: ClipboardList,
      label: status ? String(status) : '—',
    };
  };

  const selectedClassName = classes.find((c) => c._id === selectedClass)?.name || 'Class';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Attendance Reports
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              View and analyze daily attendance by class and date
            </p>
          </div>
        </div>

        {/* Filters card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Class
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="min-w-[180px]">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={fetchAttendance}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats summary */}
        {selectedClass && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Records</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {loading ? '—' : stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Present</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {loading ? '—' : stats.present}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Absent</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {loading ? '—' : stats.absent}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Late</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {loading ? '—' : stats.late}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {selectedClassName} — {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              {attendance.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <p className="mt-3 text-sm text-gray-500">Loading attendance...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pl-6"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pr-6"
                    >
                      Marked by
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Users className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-900">
                            No attendance records
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {attendance.length === 0
                              ? 'No records found for this class and date. Try another date or class.'
                              : 'No results match your search.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((record) => {
                      const statusConfig = getStatusConfig(record.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <tr
                          key={record._id}
                          className="transition hover:bg-gray-50/80"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                            <div className="flex items-center gap-3">
                              <StudentAvatar
                                student={record.student}
                                size={36}
                              />
                              <span className="font-medium text-gray-900">
                                {record.student?.user?.name || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 sm:pr-6">
                            {record.markedBy?.user?.name || '—'}
                          </td>
                        </tr>
                      );
                    })
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

export default AdminAttendance;
