import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
  excerpt?: string;
}

interface BlogListProps {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
  onNewPost: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onPostClick, onNewPost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Get all unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Generate excerpt from content
  const generateExcerpt = (content: string, length: number = 150) => {
    if (content.length <= length) return content;
    return content.substring(0, length).trim() + '...';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Blogs</h1>
          <p className="text-gray-600 mt-1">Share your thoughts and experiences</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewPost}
          className="flex items-center space-x-2 bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <span>✏️</span>
          <span>Write New Post</span>
        </motion.button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Search blogs..."
              />
              <div className="absolute left-3 top-2.5">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tag filter */}
          <div className="md:w-64">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(searchTerm || selectedTag) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full">
                Tag: {selectedTag}
                <button
                  onClick={() => setSelectedTag('')}
                  className="ml-2 text-violet-500 hover:text-violet-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
        </p>
      </div>

      {/* Blog posts */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {posts.length === 0 ? 'No blog posts yet' : 'No posts match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {posts.length === 0 
                ? 'Be the first to share your thoughts!'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {posts.length === 0 && (
              <button
                onClick={onNewPost}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Write Your First Post
              </button>
            )}
          </motion.div>
        ) : (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPostClick(post)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.excerpt || generateExcerpt(post.content)}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-violet-100 hover:text-violet-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read more */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {Math.ceil(post.content.split(' ').length / 200)} min read
                  </div>
                  <div className="flex items-center text-violet-600 group-hover:text-violet-700 transition-colors">
                    <span className="text-sm font-medium">Read more</span>
                    <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogList;