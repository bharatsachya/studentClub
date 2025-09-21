import { Router } from 'express';
import {
  createOrUpdateProfile,
  getStudentProfile,
  searchStudents,
  getUniversities,
  getMajors,
  getPopularInterests,
  updateLastActive,
} from '../controllers/student.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.route('/search').get(searchStudents); // Search students
router.route('/profile/:userId').get(getStudentProfile); // Get student profile
router.route('/universities').get(getUniversities); // Get universities list
router.route('/majors').get(getMajors); // Get majors list
router.route('/interests').get(getPopularInterests); // Get popular interests

// Protected routes (require authentication)
router.route('/profile').post(verifyJWT, createOrUpdateProfile); // Create/update own profile
router.route('/last-active').patch(verifyJWT, updateLastActive); // Update last active time

export default router;