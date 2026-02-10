import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  MessageSquare,
  LogOut,
  UserCircle,
  School,
  BookMarked,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/teachers', label: 'Teachers', icon: UserCircle },
    { path: '/admin/parents', label: 'Parents', icon: Users },
    { path: '/admin/classes', label: 'Classes', icon: School },
    { path: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { path: '/admin/grades', label: 'Grades', icon: Award },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const teacherMenu = [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teacher/attendance', label: 'Attendance', icon: Calendar },
    { path: '/teacher/grades', label: 'Grades', icon: Award },
    { path: '/teacher/timetable', label: 'Timetable', icon: BookMarked },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const studentMenu = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/grades', label: 'My Grades', icon: Award },
    { path: '/student/attendance', label: 'My Attendance', icon: Calendar },
    { path: '/student/timetable', label: 'My Timetable', icon: BookMarked },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const parentMenu = [
    { path: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/parent/progress', label: 'Child Progress', icon: GraduationCap },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  const getMenu = () => {
    switch (user?.role) {
      case 'admin':
        return adminMenu;
      case 'teacher':
        return teacherMenu;
      case 'student':
        return studentMenu;
      case 'parent':
        return parentMenu;
      default:
        return [];
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-primary-600">ZAS</h1>
            <p className="text-xs text-gray-500">Academic System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {getMenu().map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3 px-4 py-2">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
