import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import DragDropUpload from './DragDropUpload';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'localhost:3000';

interface VerificationData {
  studentId: string;
  university: string;
  graduationYear: string;
}

interface CollegeVerificationStatus {
  studentId?: string;
  university?: string;
  graduationYear?: number;
  collegeIdImage?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewNotes?: string;
}

const CollegeVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CollegeVerificationStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const [formData, setFormData] = useState<VerificationData>({
    studentId: '',
    university: '',
    graduationYear: ''
  });

  // Check current verification status on component mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(
        `http://${BACKEND_API_URL}/api/v1/user/current-user`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.data.collegeVerification) {
        setCurrentStatus(response.data.data.collegeVerification);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to submit verification.');
        return;
      }

      if (!selectedFile) {
        setError('Please select your college ID image.');
        return;
      }

      // Validation
      if (!formData.studentId.trim() || !formData.university.trim() || !formData.graduationYear.trim()) {
        setError('All fields are required.');
        return;
      }

      const currentYear = new Date().getFullYear();
      const gradYear = parseInt(formData.graduationYear);
      if (gradYear < 1900 || gradYear > currentYear + 10) {
        setError('Please enter a valid graduation year.');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('studentId', formData.studentId.trim());
      submitData.append('university', formData.university.trim());
      submitData.append('graduationYear', formData.graduationYear);
      submitData.append('collegeId', selectedFile);

      const response = await axios.post(
        `http://${BACKEND_API_URL}/api/v1/user/college-verification`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('College ID verification submitted successfully! We\'ll review it within 3-5 business days.');
      
      // Update current status
      setCurrentStatus(response.data.data);
      
      // Reset form
      setFormData({
        studentId: '',
        university: '',
        graduationYear: ''
      });
      setSelectedFile(null);

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Checking verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">College ID Verification</h1>
          <p className="text-xl text-gray-600">
            Verify your student identity to access exclusive features
          </p>
        </motion.div>

        {/* Current Status Display */}
        {currentStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Verification Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{getStatusIcon(currentStatus.verificationStatus || '')}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus.verificationStatus || '')}`}>
                    {currentStatus.verificationStatus?.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Student ID:</strong> {currentStatus.studentId}</p>
                  <p><strong>University:</strong> {currentStatus.university}</p>
                  <p><strong>Graduation Year:</strong> {currentStatus.graduationYear}</p>
                  <p><strong>Submitted:</strong> {new Date(currentStatus.submittedAt || '').toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                {currentStatus.collegeIdImage && (
                  <div>
                    <p className="font-medium mb-2">Submitted College ID:</p>
                    <img
                      src={currentStatus.collegeIdImage}
                      alt="College ID"
                      className="w-full max-w-sm h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {currentStatus.reviewNotes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-2">Review Notes:</p>
                <p className="text-gray-600">{currentStatus.reviewNotes}</p>
              </div>
            )}

            {currentStatus.verificationStatus === 'approved' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-3">🎉</span>
                  <p className="text-green-700 font-medium">
                    Congratulations! Your college identity has been verified. You now have access to verified student features.
                  </p>
                </div>
              </div>
            )}

            {currentStatus.verificationStatus === 'rejected' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">
                  Your verification was not approved. You can submit a new request with corrected information below.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Verification Form */}
        {(!currentStatus || currentStatus.verificationStatus === 'rejected') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentStatus?.verificationStatus === 'rejected' ? 'Submit New Verification' : 'Submit Verification'}
            </h2>

            {/* Status Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your University Name"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Graduation Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 10}
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="2025"
                  />
                </div>
              </div>

              {/* College ID Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">College ID Document</h3>
                <DragDropUpload
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['image/*']}
                  maxSize={10}
                  className="mb-4"
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Requirements:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Clear photo of your official student ID card</li>
                    <li>• Student ID number must be visible</li>
                    <li>• University name must be clearly shown</li>
                    <li>• File should be in JPG, PNG, or PDF format</li>
                    <li>• Maximum file size: 10MB</li>
                  </ul>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔒 Privacy & Security</h4>
                <p className="text-sm text-gray-600">
                  Your college ID information is used solely for verification purposes and will be stored securely. 
                  We will not share your personal information with third parties. Once verified, your document 
                  will be archived and only accessible to authorized administrators.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Submitting Verification...' : 'Submit for Verification'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Verify Your College ID?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Student-Only Features</h3>
              <p className="text-gray-600 text-sm">
                Access exclusive features designed specifically for verified students
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enhanced Security</h3>
              <p className="text-gray-600 text-sm">
                Connect with verified students in a safer, more trusted environment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Special Benefits</h3>
              <p className="text-gray-600 text-sm">
                Get priority access to events, clubs, and networking opportunities
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollegeVerification;