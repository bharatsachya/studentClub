import { Router } from "express";
import {
  submitClubEndorsement,
  submitContactMessage,
  getClubEndorsements,
  getUserClubEndorsements,
  updateClubEndorsementStatus,
} from "../controllers/club.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.route("/contact").post(submitContactMessage);

// Protected routes (require authentication)
router.route("/endorsement").post(verifyJWT, submitClubEndorsement);
router.route("/endorsements/user").get(verifyJWT, getUserClubEndorsements);

// Admin routes (for now, same as protected - you can add admin middleware later)
router.route("/endorsements").get(verifyJWT, getClubEndorsements);
router.route("/endorsements/:id/status").patch(verifyJWT, updateClubEndorsementStatus);

export default router;