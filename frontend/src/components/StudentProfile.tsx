import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  university: string;
  major: string;
  year: number;
  bio?: string;
  interests: string[];
  isOnline: boolean;
  joinDate: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  stats: {
    connections: number;
    posts: number;
    projects: number;
  };
}

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  onConnect: () => void;
  onMessage: () => void;
  isConnected?: boolean;
  isOwnProfile?: boolean;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onBack,
  onConnect,
  onMessage,
  isConnected = false,
  isOwnProfile = false
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'projects'>('about');

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Search</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cover photo and basic info */}
        <div className="relative">
          {/* Cover image */}
          <div className="h-48 bg-gradient-to-r from-violet-500 to-purple-600">
            {student.coverImage && (
              <img
                src={student.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile picture and basic info */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.fullName}
                className="w-32 h-32 rounded-full border-4 border-white object-cover"
              />
              {student.isOnline && (
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="pt-20 pb-8 px-8">
          {/* Header section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{student.fullName}</h1>
              <p className="text-gray-600 text-lg">@{student.username}</p>
              <p className="text-gray-500">{student.major} • Year {student.year}</p>
              <p className="text-gray-500">{student.university}</p>
              {student.location && (
                <p className="text-gray-500 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {student.location}
                </p>
              )}
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${student.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`text-sm ${student.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {student.isOnline ? 'Online now' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMessage}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  💬 Message
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConnect}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isConnected
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {isConnected ? '✓ Connected' : '🤝 Connect'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{student.stats.connections}</div>
              <div className="text-gray-600 text-sm">Connections</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{student.stats.posts}</div>
              <div className="text-gray-600 text-sm">Posts</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{student.stats.projects}</div>
              <div className="text-gray-600 text-sm">Projects</div>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {student.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Tab navigation */}
          <div className="border-b mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'about', label: 'About', icon: '👤' },
                { id: 'posts', label: 'Posts', icon: '📝' },
                { id: 'projects', label: 'Projects', icon: '💼' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                {student.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Bio</h4>
                    <p className="text-gray-700 leading-relaxed">{student.bio}</p>
                  </div>
                )}

                {/* Academic info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">University</div>
                      <div className="font-medium text-gray-900">{student.university}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Major</div>
                      <div className="font-medium text-gray-900">{student.major}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Year</div>
                      <div className="font-medium text-gray-900">Year {student.year}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Joined</div>
                      <div className="font-medium text-gray-900">{formatJoinDate(student.joinDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                {student.socialLinks && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Connect</h4>
                    <div className="flex space-x-4">
                      {student.socialLinks.linkedin && (
                        <a
                          href={student.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <span>🔗</span>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {student.socialLinks.github && (
                        <a
                          href={student.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <span>💻</span>
                          <span>GitHub</span>
                        </a>
                      )}
                      {student.socialLinks.twitter && (
                        <a
                          href={student.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                        >
                          <span>🐦</span>
                          <span>Twitter</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile 
                    ? "You haven't published any posts yet." 
                    : `${student.fullName} hasn't published any posts yet.`
                  }
                </p>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600">
                  {isOwnProfile 
                    ? "You haven't added any projects yet." 
                    : `${student.fullName} hasn't shared any projects yet.`
                  }
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;