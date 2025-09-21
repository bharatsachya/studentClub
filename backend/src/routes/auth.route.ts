import { Router } from "express";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  verifyGoogleToken,
  linkGoogleAccount,
  unlinkGoogleAccount,
} from "../controllers/auth.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

// Google OAuth routes
router.route("/google/url").get(getGoogleAuthUrl);
router.route("/google/callback").post(handleGoogleCallback);
router.route("/google/verify").post(verifyGoogleToken);

// Protected routes for linking/unlinking Google account
router.route("/google/link").post(verifyJWT, linkGoogleAccount);
router.route("/google/unlink").post(verifyJWT, unlinkGoogleAccount);

export default router;