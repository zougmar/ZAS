import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api.get('/ping')
      .then((res) => {
        if (!cancelled && res.data?.ok) setApiStatus(true);
        else if (!cancelled) setApiStatus(false);
      })
      .catch(() => {
        if (!cancelled) setApiStatus(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-100 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Zouglah Academic System</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
            {/* API connection status */}
            {apiStatus !== null && (
              <p className={`mt-2 text-xs flex items-center justify-center gap-1 ${apiStatus ? 'text-green-600' : 'text-amber-600'}`}>
                {apiStatus ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {apiStatus ? 'API connected' : 'API not reachable – check backend and Vercel rewrites'}
              </p>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            {loginError && (
              <p className="text-sm text-red-600 mt-2 text-center" role="alert">
                {loginError}
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </a>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Admin: admin@zas.com / admin123</p>
              <p>Teacher: teacher1@zas.com / teacher123</p>
              <p>Student: student1@zas.com / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
