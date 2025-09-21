import {Router} from 'express';
import {loginUser, registerUser,logoutUser,refreshAcessToken, sendOTP, verifyOTP, resendOTP, getDashboardData, getCurrentUser, uploadCollegeIdVerification, updateCollegeVerificationStatus, getCollegeVerificationRequests} from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware';
import { verifyJWT } from '../middleware/auth.middleware';
const router = Router();

router.post("/register",
  upload.fields([
      {
        name:'avatar',
        maxCount:1
      },
      {
         name:'coverImage',
         maxCount:1
      }
  ]),
  registerUser
);



router.route("/hello").get((req, res)=>{
  res.send("Hello from user route");
})

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refresh-token').post(refreshAcessToken)

// OTP routes
router.route('/send-otp').post(sendOTP)
router.route('/verify-otp').post(verifyOTP)
router.route('/resend-otp').post(resendOTP)

// Dashboard route
router.route('/dashboard').get(verifyJWT, getDashboardData)

// Current user route
router.route('/current-user').get(verifyJWT, getCurrentUser)

// College verification routes
router.post('/college-verification',
  verifyJWT,
  upload.fields([
    {
      name: 'collegeId',
      maxCount: 1
    }
  ]),
  uploadCollegeIdVerification
);

// Admin routes for college verification
router.route('/college-verification/requests').get(verifyJWT, getCollegeVerificationRequests)
router.route('/college-verification/:userId/status').patch(verifyJWT, updateCollegeVerificationStatus)

export default router;