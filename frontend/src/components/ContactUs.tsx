import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'localhost:3000';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: 'general' | 'club_endorsement' | 'support' | 'feedback';
}

interface ClubEndorsementData {
  clubName: string;
  university: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  clubDescription: string;
  clubType: string;
  establishedYear: string;
  memberCount: string;
  clubWebsite: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  endorsementReason: string;
}

const ContactUs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'endorsement'>('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Contact form state
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    messageType: 'general'
  });

  // Club endorsement form state
  const [endorsementForm, setEndorsementForm] = useState<ClubEndorsementData>({
    clubName: '',
    university: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    clubDescription: '',
    clubType: 'academic',
    establishedYear: '',
    memberCount: '',
    clubWebsite: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    },
    endorsementReason: ''
  });

  const clubTypes = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'professional', label: 'Professional' },
    { value: 'arts', label: 'Arts' },
    { value: 'other', label: 'Other' }
  ];

  const messageTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'club_endorsement', label: 'Club Endorsement' }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `http://${BACKEND_API_URL}/api/v1/club/contact`,
        contactForm
      );

      setSuccess('Message sent successfully! We\'ll get back to you soon.');
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        messageType: 'general'
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndorsementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to submit a club endorsement request.');
        return;
      }

      const formData = {
        ...endorsementForm,
        establishedYear: endorsementForm.establishedYear ? parseInt(endorsementForm.establishedYear) : undefined,
        memberCount: endorsementForm.memberCount ? parseInt(endorsementForm.memberCount) : undefined,
        clubWebsite: endorsementForm.clubWebsite || undefined
      };

      const response = await axios.post(
        `http://${BACKEND_API_URL}/api/v1/club/endorsement`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Club endorsement request submitted successfully! We\'ll review it within 5-7 business days.');
      setEndorsementForm({
        clubName: '',
        university: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        clubDescription: '',
        clubType: 'academic',
        establishedYear: '',
        memberCount: '',
        clubWebsite: '',
        socialMedia: {
          instagram: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        },
        endorsementReason: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit endorsement request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Get in touch with us or submit your club for endorsement
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('endorsement')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'endorsement'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Club Endorsement
            </button>
          </div>
        </div>

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

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="john@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={contactForm.messageType}
                    onChange={(e) => setContactForm({...contactForm, messageType: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {messageTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Club Endorsement Form */}
        {activeTab === 'endorsement' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Club for Endorsement</h2>
            <form onSubmit={handleEndorsementSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={endorsementForm.clubName}
                      onChange={(e) => setEndorsementForm({...endorsementForm, clubName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Computer Science Club"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University *
                    </label>
                    <input
                      type="text"
                      required
                      value={endorsementForm.university}
                      onChange={(e) => setEndorsementForm({...endorsementForm, university: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="University Name"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={endorsementForm.contactPerson}
                      onChange={(e) => setEndorsementForm({...endorsementForm, contactPerson: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="President/Secretary Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={endorsementForm.contactEmail}
                      onChange={(e) => setEndorsementForm({...endorsementForm, contactEmail: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="club@university.edu"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={endorsementForm.contactPhone}
                    onChange={(e) => setEndorsementForm({...endorsementForm, contactPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Club Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club Type *
                    </label>
                    <select
                      required
                      value={endorsementForm.clubType}
                      onChange={(e) => setEndorsementForm({...endorsementForm, clubType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {clubTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={endorsementForm.establishedYear}
                      onChange={(e) => setEndorsementForm({...endorsementForm, establishedYear: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={endorsementForm.memberCount}
                      onChange={(e) => setEndorsementForm({...endorsementForm, memberCount: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={endorsementForm.clubDescription}
                    onChange={(e) => setEndorsementForm({...endorsementForm, clubDescription: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell us about your club, its mission, and activities..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Website
                  </label>
                  <input
                    type="url"
                    value={endorsementForm.clubWebsite}
                    onChange={(e) => setEndorsementForm({...endorsementForm, clubWebsite: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://clubwebsite.com"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={endorsementForm.socialMedia.instagram}
                      onChange={(e) => setEndorsementForm({
                        ...endorsementForm,
                        socialMedia: {...endorsementForm.socialMedia, instagram: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="@clubname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={endorsementForm.socialMedia.facebook}
                      onChange={(e) => setEndorsementForm({
                        ...endorsementForm,
                        socialMedia: {...endorsementForm.socialMedia, facebook: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="facebook.com/clubname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={endorsementForm.socialMedia.twitter}
                      onChange={(e) => setEndorsementForm({
                        ...endorsementForm,
                        socialMedia: {...endorsementForm.socialMedia, twitter: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="@clubname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={endorsementForm.socialMedia.linkedin}
                      onChange={(e) => setEndorsementForm({
                        ...endorsementForm,
                        socialMedia: {...endorsementForm.socialMedia, linkedin: e.target.value}
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="linkedin.com/company/clubname"
                    />
                  </div>
                </div>
              </div>

              {/* Endorsement Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why should your club be endorsed? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={endorsementForm.endorsementReason}
                  onChange={(e) => setEndorsementForm({...endorsementForm, endorsementReason: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Explain why your club would be a valuable addition to StudentConnect..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Submit Endorsement Request'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContactUs;