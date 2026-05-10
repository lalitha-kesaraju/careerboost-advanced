import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: { id: string; name: string; email: string }) => void;
}

const DUMMY_USERS = [
  { id: 'user1', name: 'Rohith', email: 'rohith@careerboost.com', password: 'rohith123' },
  { id: 'user2', name: 'Sravan', email: 'sravan@careerboost.com', password: 'sravan123' },
  { id: 'user3', name: 'Sreekar', email: 'sreekar@careerboost.com', password: 'sreekar123' },
  { id: 'user4', name: 'Demo User', email: 'demo@careerboost.com', password: 'demo123' }
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = DUMMY_USERS.find(u => u.email === email && u.password === password);
      
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));

      onLogin({
        id: user.id,
        name: user.name,
        email: user.email
      });
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: typeof DUMMY_USERS[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));
    onLogin({
      id: user.id,
      name: user.name,
      email: user.email
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <LogIn className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">CareerBoost</h1>
          </motion.div>
          <p className="text-gray-600">AI-Powered Career Development</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohith@careerboost.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">Quick Login</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Quick Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {DUMMY_USERS.map((user, index) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickLogin(user)}
              disabled={loading}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This is a demo login. Use any of the quick login buttons above.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
