import { Router } from 'express';
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getUserBlogPosts,
  getBlogStats,
} from '../controllers/blog.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.route('/').get(getAllBlogPosts); // Get all published blog posts
router.route('/:id').get(getBlogPost); // Get single blog post
router.route('/user/:userId').get(getUserBlogPosts); // Get user's published blog posts

// Protected routes (require authentication)
router.route('/create').post(verifyJWT, createBlogPost); // Create new blog post
router.route('/:id').put(verifyJWT, updateBlogPost); // Update blog post
router.route('/:id').delete(verifyJWT, deleteBlogPost); // Delete blog post
router.route('/stats/my').get(verifyJWT, getBlogStats); // Get user's blog statistics

export default router;