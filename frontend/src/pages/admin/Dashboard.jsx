import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Users, GraduationCap, BookOpen, Calendar, Award, MessageSquare } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        label: 'Today\'s Attendance',
        data: [
          stats?.todayAttendance?.present || 0,
          stats?.todayAttendance?.absent || 0,
          stats?.todayAttendance?.late || 0,
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      },
    ],
  };

  const statsCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Total Parents', value: stats?.totalParents || 0, icon: Users, color: 'bg-purple-500' },
    { label: 'Total Classes', value: stats?.totalClasses || 0, icon: BookOpen, color: 'bg-yellow-500' },
    { label: 'Total Subjects', value: stats?.totalSubjects || 0, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: MessageSquare, color: 'bg-red-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your academic system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
            <Doughnut data={attendanceData} />
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Attendance Today</span>
                <span className="text-2xl font-bold text-primary-600">
                  {stats?.todayAttendance?.total || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Grades</span>
                <span className="text-2xl font-bold text-primary-600">
                  {stats?.recentGrades || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
