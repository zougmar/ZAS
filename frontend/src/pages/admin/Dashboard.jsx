import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import { Users, GraduationCap, School, UserCircle, Calendar, Award, BookOpen, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear - 1} - ${currentYear}`;

  useEffect(() => {
    fetchStats();
    fetchTopStudents();
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

  const fetchTopStudents = async () => {
    try {
      const response = await api.get('/grades');
      // Calculate average grades per student
      const studentGrades = {};
      response.data.forEach((grade) => {
        const studentId = grade.student?._id || grade.student;
        if (!studentGrades[studentId]) {
          studentGrades[studentId] = {
            student: grade.student,
            grades: [],
            total: 0,
            count: 0,
          };
        }
        const percentage = (grade.grade / grade.maxGrade) * 100;
        studentGrades[studentId].grades.push(percentage);
        studentGrades[studentId].total += percentage;
        studentGrades[studentId].count += 1;
      });

      // Calculate averages and sort
      const studentsWithAvg = Object.values(studentGrades)
        .map((sg) => ({
          student: sg.student,
          average: sg.count > 0 ? sg.total / sg.count : 0,
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 3);

      setTopStudents(studentsWithAvg);
    } catch (error) {
      console.error('Failed to fetch top students:', error);
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

  // Bar chart data for educational stages
  const barChartData = {
    labels: ['Primary', 'Secondary', 'High'],
    datasets: [
      {
        label: 'Students',
        data: [
          stats?.totalStudents ? Math.floor(stats.totalStudents * 0.4) : 0,
          stats?.totalStudents ? Math.floor(stats.totalStudents * 0.35) : 0,
          stats?.totalStudents ? Math.floor(stats.totalStudents * 0.25) : 0,
        ],
        backgroundColor: ['#a855f7', '#f59e0b', '#10b981'],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  const months = [
    'January', 'February', 'March',
    'April', 'May', 'June',
    'July', 'August', 'September',
    'October', 'November', 'December'
  ];

  const currentMonth = new Date().getMonth();
  const selectedMonths = [3, 8]; // April and September

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Zouglah Academic System
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span className="font-semibold text-gray-700">School Year {schoolYear}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Classes</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalClasses || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <School className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Teachers</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Students</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalStudents || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Parents</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalParents || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg">
                <UserCircle className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Attendance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Calendar Attendance</h3>
            
            {/* Year Timeline */}
            <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
              {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                <button
                  key={year}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    year === currentYear
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-3">
              {months.map((month, index) => {
                const isSelected = selectedMonths.includes(index);
                return (
                  <div
                    key={month}
                    className={`p-4 rounded-lg text-center font-medium transition-colors ${
                      isSelected
                        ? index === 3
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Stage & Bar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Educational Stage</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-medium text-gray-700">Primary School</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats?.totalStudents ? Math.floor(stats.totalStudents * 0.4) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium text-gray-700">Secondary School</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats?.totalStudents ? Math.floor(stats.totalStudents * 0.35) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-gray-700">High School</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats?.totalStudents ? Math.floor(stats.totalStudents * 0.25) : 0}
                </span>
              </div>
            </div>

            <div className="h-48">
              <Bar data={barChartData} options={chartOptions} />
            </div>
            <p className="text-sm text-gray-500 text-center mt-2">
              All data in {schoolYear}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activities & Events */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Activities & Events</h3>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                View All
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-medium text-gray-900">Elimination Game</p>
                <p className="text-sm text-gray-500 mt-1">Sports competition event</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-medium text-gray-900">Freshman Orientation</p>
                <p className="text-sm text-gray-500 mt-1">Welcome new students</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <p className="font-medium text-gray-900">Spring Sports Rally</p>
                <p className="text-sm text-gray-500 mt-1">Annual sports event</p>
              </div>
            </div>
          </div>

          {/* Student Rankings */}
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Student Rankings</h3>
            <div className="grid grid-cols-3 gap-4">
              {topStudents.map((item, index) => {
                const colors = [
                  { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500' },
                  { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500' },
                  { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-500' },
                ];
                const color = colors[index] || colors[0];
                const studentName = item.student?.user?.name || 'Unknown Student';
                const initials = studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                const gradientClasses = [
                  'bg-gradient-to-br from-green-500 to-green-600',
                  'bg-gradient-to-br from-purple-500 to-purple-600',
                  'bg-gradient-to-br from-yellow-500 to-yellow-600',
                ];
                
                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-xl p-4 border-2 ${color.border} ${gradientClasses[index] || gradientClasses[0]} text-white`}
                  >
                    <div className="absolute top-2 right-2 bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {index + 1}st
                    </div>
                    <div className="flex flex-col items-center mt-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 text-2xl font-bold">
                        {initials}
                      </div>
                      <p className="font-bold text-center mb-1">{studentName}</p>
                      <p className="text-2xl font-bold">{item.average.toFixed(2)}%</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
                  </div>
                );
              })}
              {topStudents.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No student rankings available yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
