import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
}

interface BlogEditorProps {
  onSave: (post: Omit<BlogPost, 'id' | 'author' | 'createdAt'>) => void;
  onCancel: () => void;
  initialPost?: BlogPost;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ onSave, onCancel, initialPost }) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialPost ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {isPreview ? '✏️ Edit' : '👁️ Preview'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
            >
              {initialPost ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isPreview ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter your blog title..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-transparent">
                  {tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-violet-500 hover:text-violet-700"
                      >
                        ×
                      </button>
                    </motion.span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 min-w-32 outline-none text-sm"
                    placeholder="Add tags (press Enter)..."
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Writing tips */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">✍️ Writing Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use clear, engaging headlines</li>
                  <li>• Break up text with short paragraphs</li>
                  <li>• Add relevant tags to help others find your post</li>
                  <li>• Preview your post before publishing</li>
                </ul>
              </div>
            </div>
          ) : (
            // Preview mode
            <div className="prose max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Preview header */}
                <div className="border-b pb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {title || 'Untitled Post'}
                  </h1>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    By You • {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Preview content */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {content || 'Start writing your blog content...'}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;