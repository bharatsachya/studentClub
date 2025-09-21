import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'localhost:3000';

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`http://${BACKEND_API_URL}/api/v1/user/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`http://${BACKEND_API_URL}/api/v1/user/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">User not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-violet-700">StudentConnect</h1>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </div>
              <span className="text-gray-700 font-medium">{user.fullName}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Profile section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-20 w-20 rounded-full object-cover mx-auto"
                  />
                  {user.coverImage && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 opacity-20"></div>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-600">@{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', name: 'Overview', icon: '📊' },
                  { id: 'profile', name: 'Profile', icon: '👤' },
                  { id: 'connect', name: 'Connect', icon: '🎥' },
                  { id: 'marketplace', name: 'Marketplace', icon: '🛍️' },
                  { id: 'blogs', name: 'Blogs', icon: '📝' },
                  { id: 'clubs', name: 'Clubs', icon: '🏛️' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-violet-100 text-violet-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user.fullName}!</h3>
                  
                  {/* Quick actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer"
                      onClick={() => navigate('/video-call')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">🎥</div>
                        <div>
                          <h4 className="font-semibold">Start Video Chat</h4>
                          <p className="text-sm opacity-90">Connect with students</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white cursor-pointer"
                      onClick={() => setActiveTab('marketplace')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">🛍️</div>
                        <div>
                          <h4 className="font-semibold">Marketplace</h4>
                          <p className="text-sm opacity-90">Buy & sell items</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white cursor-pointer"
                      onClick={() => setActiveTab('blogs')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">📝</div>
                        <div>
                          <h4 className="font-semibold">Write Blog</h4>
                          <p className="text-sm opacity-90">Share your thoughts</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent activity */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl">🎉</div>
                        <div>
                          <p className="font-medium text-gray-900">Welcome to StudentConnect!</p>
                          <p className="text-sm text-gray-600">You successfully created your account</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user.fullName}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={user.username}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        readOnly
                      />
                    </div>

                    <div className="pt-4">
                      <button className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'connect' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Video Chat</h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎥</div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to connect?</h4>
                    <p className="text-gray-600 mb-6">Start a video chat with fellow students</p>
                    <button
                      onClick={() => navigate('/video-call')}
                      className="bg-violet-600 text-white px-8 py-3 rounded-lg hover:bg-violet-700 transition-colors text-lg"
                    >
                      Start Video Chat
                    </button>
                  </div>
                </div>
              )}

              {['marketplace', 'blogs', 'clubs'].includes(activeTab) && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h3>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">
                      {activeTab === 'marketplace' ? '🛍️' : activeTab === 'blogs' ? '📝' : '🏛️'}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h4>
                    <p className="text-gray-600">This feature is under development</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;