import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  university: string;
  major: string;
  year: number;
  bio?: string;
  interests: string[];
  isOnline: boolean;
}

interface StudentSearchProps {
  onStudentSelect: (student: Student) => void;
}

const StudentSearch: React.FC<StudentSearchProps> = ({ onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    university: '',
    major: '',
    year: '',
    interests: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'university' | 'year' | 'online'>('name');

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        fullName: 'Alice Johnson',
        username: 'alicej',
        email: 'alice@university.edu',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9ab2ba7?w=150&h=150&fit=crop&crop=face',
        university: 'Stanford University',
        major: 'Computer Science',
        year: 3,
        bio: 'Passionate about AI and machine learning. Looking to connect with fellow CS students.',
        interests: ['AI', 'Programming', 'Research', 'Gaming'],
        isOnline: true
      },
      {
        id: '2',
        fullName: 'Bob Smith',
        username: 'bobsmith',
        email: 'bob@mit.edu',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        university: 'MIT',
        major: 'Electrical Engineering',
        year: 2,
        bio: 'Robotics enthusiast and maker. Always working on new projects!',
        interests: ['Robotics', 'Electronics', '3D Printing', 'IoT'],
        isOnline: false
      },
      {
        id: '3',
        fullName: 'Carol Davis',
        username: 'carold',
        email: 'carol@berkeley.edu',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        university: 'UC Berkeley',
        major: 'Business Administration',
        year: 4,
        bio: 'Future entrepreneur interested in tech startups and innovation.',
        interests: ['Entrepreneurship', 'Finance', 'Technology', 'Networking'],
        isOnline: true
      },
      {
        id: '4',
        fullName: 'David Wilson',
        username: 'davidw',
        email: 'david@caltech.edu',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        university: 'Caltech',
        major: 'Physics',
        year: 1,
        bio: 'Exploring the mysteries of quantum mechanics and space.',
        interests: ['Physics', 'Astronomy', 'Mathematics', 'Research'],
        isOnline: true
      }
    ];
    setStudents(mockStudents);
  }, []);

  // Get unique values for filters
  const universities = Array.from(new Set(students.map(s => s.university)));
  const majors = Array.from(new Set(students.map(s => s.major)));
  const years = Array.from(new Set(students.map(s => s.year.toString())));
  const allInterests = Array.from(new Set(students.flatMap(s => s.interests)));

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesUniversity = !filters.university || student.university === filters.university;
      const matchesMajor = !filters.major || student.major === filters.major;
      const matchesYear = !filters.year || student.year.toString() === filters.year;
      const matchesInterests = !filters.interests || 
        student.interests.some(interest => interest.toLowerCase().includes(filters.interests.toLowerCase()));

      return matchesSearch && matchesUniversity && matchesMajor && matchesYear && matchesInterests;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'university':
          return a.university.localeCompare(b.university);
        case 'year':
          return b.year - a.year;
        case 'online':
          return Number(b.isOnline) - Number(a.isOnline);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      university: '',
      major: '',
      year: '',
      interests: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Students</h1>
        <p className="text-gray-600">Connect with fellow students from universities worldwide</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Search students by name, university, major, or interests..."
            />
            <div className="absolute left-4 top-3.5">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <select
            value={filters.university}
            onChange={(e) => setFilters({...filters, university: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Universities</option>
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>

          <select
            value={filters.major}
            onChange={(e) => setFilters({...filters, major: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Majors</option>
            {majors.map(major => (
              <option key={major} value={major}>{major}</option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>

          <input
            type="text"
            value={filters.interests}
            onChange={(e) => setFilters({...filters, interests: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Filter by interests..."
          />
        </div>

        {/* Sort and clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="name">Name</option>
              <option value="university">University</option>
              <option value="year">Year (newest first)</option>
              <option value="online">Online status</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
        </p>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onStudentSelect(student)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {/* Card header with avatar and online status */}
            <div className="p-6 pb-4">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {student.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {student.fullName}
                  </h3>
                  <p className="text-gray-600 text-sm">@{student.username}</p>
                  <p className="text-gray-500 text-sm">{student.university}</p>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 pb-4">
              <div className="mb-3">
                <p className="text-gray-700 font-medium">{student.major}</p>
                <p className="text-gray-500 text-sm">Year {student.year}</p>
              </div>

              {student.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {student.bio}
                </p>
              )}

              {/* Interests */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {student.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {student.interests.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                      +{student.interests.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${student.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs ${student.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {student.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center text-violet-600 group-hover:text-violet-700 transition-colors">
                  <span className="text-sm">View Profile</span>
                  <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
          <button
            onClick={clearFilters}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default StudentSearch;