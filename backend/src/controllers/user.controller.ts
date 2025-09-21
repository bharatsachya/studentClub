import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

dotenv.config();

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Store OTPs temporarily (in production, use Redis)
const otpStorage = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Generate OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via email
const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'StudentConnect Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">StudentConnect Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #7c3aed; text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 10px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  };

  await emailTransporter.sendMail(mailOptions);
};

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface UserInterface {
  _id: string;
  email: string;
  username: string;
  password: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  refreshToken?: string;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isPasswordCorrect(password: string): Promise<boolean>;
}


// Generate Access and Refresh Token
const generateAccessAndRefreshToken = async (userId: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    console.log(user.refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
};

// Register User Controller
const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { fullName, email, username, password } = req.body;

    // Validate required fields
    if ([email, username, password, fullName].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existedUser) {
      throw new ApiError(409, "User already exists");
    }

    // Check avatar and cover image
    let avatarLocalPath: string = "";
    if (
      req.files &&
      typeof req.files === "object" &&
      "avatar" in req.files &&
      Array.isArray((req.files as { [key: string]: Express.Multer.File[] }).avatar) &&
      (req.files as { [key: string]: Express.Multer.File[] }).avatar.length > 0
    ) {
      avatarLocalPath = (req.files as { [key: string]: Express.Multer.File[] }).avatar[0].path;
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    let coverImageLocalPath: string = "";
    if (
      req.files && 
      typeof req.files === "object" && 
      "coverImage" in req.files && 
      Array.isArray((req.files as { [key: string]: Express.Multer.File[] }).coverImage) && 
      (req.files as { [key: string]: Express.Multer.File[] }).coverImage.length > 0
    ) {
      coverImageLocalPath = (req.files as { [key: string]: Express.Multer.File[] }).coverImage[0].path;
    }

    // Upload to Cloudinary 
    console.log(avatarLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new ApiError(500, "Image upload failed");
    }

    // Create user in DB
    const user = await User.create({
      email,
      username,
      password,
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    // Remove password and refreshToken from response
    const userCreated = await User.findById(user._id).select("-password -refreshToken");
    if (!userCreated) {
      throw new ApiError(500, "User creation failed");
    }

    // Send OTP for verification
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStorage.set(email, { otp, expiresAt, attempts: 0 });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    return res.status(201).json(new ApiResponse(201, {
      user: userCreated,
      message: "User registered successfully. Please check your email for verification."
    }, "Registration successful"));
  }
);

// Login User Controller
const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;

    // Validate username or email
    if (!(username || email)) {
      throw new ApiError(400, "username or email is required");
    }

    // Find the user
    const user: UserInterface | null = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Incorrect password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Send response with cookies
    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: userLoggedIn,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
  }
);

// Logout User Controller
const logoutUser = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    await User.findByIdAndUpdate(req.user?._id, {
      $set: { refreshToken: undefined },
    });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  }
);

// Refresh Access Token Controller
const refreshAcessToken = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is not valid");
    }

    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshTokenSecret) {
        throw new ApiError(500, "REFRESH_TOKEN_SECRET is not set in environment variables");
      }
      const decodedToken = await jwt.verify(incomingRefreshToken, refreshTokenSecret);
      const userId =
        typeof decodedToken === "object" && "_id" in decodedToken
          ? (decodedToken as { _id: string })._id
          : undefined;
      if (!userId) {
        throw new ApiError(401, "Invalid token payload");
      }
      const user: UserInterface | null= await User.findById(userId);

      if (!user) {
        throw new ApiError(401, "User is invalid");
      }
      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(400, "User doesn't exist");
      }

      const options = {
        httpOnly: true,
        secure: true,
      };

      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access token is refreshed successfully"
          )
        );
    } catch (error) {
      throw new ApiError(401, (error as any)?.message || "Something went wrong");
    }
  }
);

// Change Current Password Controller
const changeCurrentPassword = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { newPassword, oldPassword } = req.body;

    if (!(newPassword || oldPassword)) {
      throw new ApiError(400, "Please enter both old and new password");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Your password has been updated"));
  }
);

// Get Current User Controller
const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json(new ApiResponse(200, req.user, "Here is your current user"));
  }
);

// Update Account Details Controller
const updateAccountDetails = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, fullName } = req.body;

    if (!(email || fullName)) {
      throw new ApiError(400, "Email and full name are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { email, fullName } },
      { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, {}, "User updated successfully"));
  }
);

// Update Avatar Image Controller
const updateAvatarImage = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const avatarImageLocalPath = req.file?.path;
    if (!avatarImageLocalPath) {
      throw new ApiError(400, "Avatar image is missing");
    }

    const avatar = await uploadOnCloudinary(avatarImageLocalPath);
    if (!avatar || !avatar.url) {
      throw new ApiError(400, "Error while uploading avatar image");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: { avatar: avatar.url } },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar image updated successfully"));
  }
);

// Send OTP Controller
const sendOTP = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStorage.set(email, { otp, expiresAt, attempts: 0 });

    try {
      await sendOTPEmail(email, otp);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "OTP sent successfully"));
    } catch (error) {
      otpStorage.delete(email);
      throw new ApiError(500, "Failed to send OTP email");
    }
  }
);

// Verify OTP Controller
const verifyOTP = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ApiError(400, "Email and OTP are required");
    }

    const storedOTPData = otpStorage.get(email);
    if (!storedOTPData) {
      throw new ApiError(400, "OTP not found or expired");
    }

    // Check if OTP is expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStorage.delete(email);
      throw new ApiError(400, "OTP has expired");
    }

    // Check attempts
    if (storedOTPData.attempts >= 3) {
      otpStorage.delete(email);
      throw new ApiError(400, "Too many failed attempts");
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts++;
      throw new ApiError(400, "Invalid OTP");
    }

    // OTP verified successfully
    otpStorage.delete(email);
    
    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP verified successfully"));
  }
);

// Resend OTP Controller
const resendOTP = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStorage.set(email, { otp, expiresAt, attempts: 0 });

    try {
      await sendOTPEmail(email, otp);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "OTP resent successfully"));
    } catch (error) {
      otpStorage.delete(email);
      throw new ApiError(500, "Failed to resend OTP email");
    }
  }
);

// Upload College ID for Verification Controller
const uploadCollegeIdVerification = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { studentId, university, graduationYear } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!studentId?.trim() || !university?.trim() || !graduationYear) {
      throw new ApiError(400, "Student ID, university, and graduation year are required");
    }

    // Check if college ID file is uploaded
    let collegeIdLocalPath: string = "";
    if (
      req.files &&
      typeof req.files === "object" &&
      "collegeId" in req.files &&
      Array.isArray((req.files as { [key: string]: Express.Multer.File[] }).collegeId) &&
      (req.files as { [key: string]: Express.Multer.File[] }).collegeId.length > 0
    ) {
      collegeIdLocalPath = (req.files as { [key: string]: Express.Multer.File[] }).collegeId[0].path;
    }

    if (!collegeIdLocalPath) {
      throw new ApiError(400, "College ID image is required");
    }

    // Upload to Cloudinary
    const collegeIdImage = await uploadOnCloudinary(collegeIdLocalPath);

    if (!collegeIdImage) {
      throw new ApiError(500, "Failed to upload college ID image");
    }

    // Update user with college ID verification info
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          collegeVerification: {
            studentId: studentId.trim(),
            university: university.trim(),
            graduationYear: parseInt(graduationYear),
            collegeIdImage: collegeIdImage.url,
            verificationStatus: 'pending',
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Send notification email to admin (you can customize this)
    try {
      const adminMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: 'New College ID Verification Request - StudentConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">New College ID Verification Request</h2>
            <p>A new college ID verification request has been submitted:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>User:</strong> ${user.fullName} (${user.email})</p>
              <p><strong>Student ID:</strong> ${studentId}</p>
              <p><strong>University:</strong> ${university}</p>
              <p><strong>Graduation Year:</strong> ${graduationYear}</p>
              <p><strong>College ID Image:</strong> <a href="${collegeIdImage.url}">View Image</a></p>
            </div>
            <p>Please review and approve/reject the request in the admin panel.</p>
          </div>
        `
      };

      await emailTransporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user.collegeVerification, "College ID verification submitted successfully"));
  }
);

// Update College Verification Status Controller (for admin)
const updateCollegeVerificationStatus = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.collegeVerification || user.collegeVerification.verificationStatus !== 'pending') {
      throw new ApiError(400, "No pending college verification found for this user");
    }

    // Update verification status
    user.collegeVerification.verificationStatus = status;
    user.collegeVerification.reviewedBy = reviewerId;
    user.collegeVerification.reviewedAt = new Date();
    user.collegeVerification.reviewNotes = reviewNotes?.trim();

    await user.save({ validateBeforeSave: false });

    // Send notification email to user
    try {
      const statusText = status === 'approved' ? 'Approved' : 'Rejected';
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `College ID Verification ${statusText} - StudentConnect`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">
              College ID Verification ${statusText}
            </h2>
            <p>Hi ${user.fullName},</p>
            <p>Your college ID verification has been ${status}.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>University:</strong> ${user.collegeVerification.university}</p>
              <p><strong>Student ID:</strong> ${user.collegeVerification.studentId}</p>
              <p><strong>Status:</strong> ${statusText}</p>
              ${reviewNotes ? `<p><strong>Review Notes:</strong> ${reviewNotes}</p>` : ''}
            </div>
            ${status === 'approved' ? 
              '<p>Congratulations! Your college identity has been verified. You now have access to verified student features.</p>' : 
              '<p>You can submit a new verification request with corrected information if needed.</p>'
            }
            <p>Best regards,<br>StudentConnect Team</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send verification status email:", emailError);
    }

    const updatedUser = await User.findById(userId).select("-password -refreshToken");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser?.collegeVerification, `College verification ${status} successfully`));
  }
);

// Get College Verification Requests Controller (for admin)
const getCollegeVerificationRequests = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    // Build query
    const query: any = { "collegeVerification.verificationStatus": { $exists: true } };
    if (status) {
      query["collegeVerification.verificationStatus"] = status;
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("fullName email username collegeVerification")
        .sort({ "collegeVerification.submittedAt": -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalRequests: totalCount,
      requestsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { requests: users, pagination: paginationInfo }, "College verification requests fetched successfully"));
  }
);

// Get Dashboard Data Controller
const getDashboardData = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;

    // Get user basic info
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get user stats in parallel
    const blogStats = await mongoose.connection.db?.collection('blogs')?.aggregate([
      {
        $facet: {
          totalPosts: [
            { $match: { author: new mongoose.Types.ObjectId(userId), isPublished: true } },
            { $count: "count" }
          ],
          draftPosts: [
            { $match: { author: new mongoose.Types.ObjectId(userId), isPublished: false } },
            { $count: "count" }
          ],
          recentPosts: [
            { $match: { author: new mongoose.Types.ObjectId(userId) } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                createdAt: 1,
                isPublished: 1,
                excerpt: 1
              }
            }
          ]
        }
      }
    ]).toArray();

    const profileStats = await mongoose.connection.db?.collection('studentprofiles')?.findOne({ 
      _id: new mongoose.Types.ObjectId(userId) 
    });

    // Format the response
    const dashboardData = {
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        coverImage: user.coverImage
      },
      stats: {
        posts: (blogStats && blogStats[0] && blogStats[0].totalPosts && blogStats[0].totalPosts[0]) ? blogStats[0].totalPosts[0].count : 0,
        drafts: (blogStats && blogStats[0] && blogStats[0].draftPosts && blogStats[0].draftPosts[0]) ? blogStats[0].draftPosts[0].count : 0,
        connections: 0, // Placeholder for future connections feature
        projects: 0 // Placeholder for future projects feature
      },
      profile: profileStats || null,
      recentPosts: (blogStats && blogStats[0] && blogStats[0].recentPosts) ? blogStats[0].recentPosts : [],
      recentActivity: [
        {
          id: '1',
          type: 'welcome',
          message: 'Welcome to StudentConnect!',
          timestamp: (user as any).createdAt,
          icon: '🎉'
        }
      ]
    };

    return res
      .status(200)
      .json(new ApiResponse(200, dashboardData, "Dashboard data fetched successfully"));
  }
);

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
  sendOTP,
  verifyOTP,
  resendOTP,
  uploadCollegeIdVerification,
  updateCollegeVerificationStatus,
  getCollegeVerificationRequests,
  getDashboardData,
};
