import { Request, Response } from "express";
import { OAuth2Client } from 'google-auth-library';
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";
import dotenv from "dotenv";

dotenv.config();

// Initialize Google OAuth2 client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
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
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
};

// Get Google OAuth URL
const getGoogleAuthUrl = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      prompt: 'consent'
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { authUrl }, "Google Auth URL generated successfully"));
  }
);

// Handle Google OAuth Callback
const handleGoogleCallback = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { code } = req.body;

    if (!code) {
      throw new ApiError(400, "Authorization code is required");
    }

    try {
      // Exchange authorization code for tokens
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      // Get user information from Google
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new ApiError(400, "Invalid Google token");
      }

      const googleUserData: GoogleUserData = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!
      };

      // Check if email is from an educational domain
      const allowedDomains = ['.edu', '@jcboseust.ac.in', '@test.org', '@gmail.com'];
      const isEducationalEmail = allowedDomains.some(domain => 
        googleUserData.email.endsWith(domain) || googleUserData.email.includes(domain)
      );

      if (!isEducationalEmail) {
        throw new ApiError(400, "Please use a valid student email (.edu or institutional domain)");
      }

      // Check if user already exists
      let user = await User.findOne({ email: googleUserData.email });

      if (user) {
        // User exists, update Google info if needed
        if (!user.googleId) {
          user.googleId = googleUserData.id;
          user.avatar = user.avatar || googleUserData.picture;
          await user.save({ validateBeforeSave: false });
        }
      } else {
        // Create new user
        const username = googleUserData.email.split('@')[0].toLowerCase() + '_' + Date.now();
        
        user = await User.create({
          googleId: googleUserData.id,
          email: googleUserData.email,
          fullName: googleUserData.name,
          username: username,
          avatar: googleUserData.picture,
          coverImage: "",
          password: "google_oauth_" + googleUserData.id, // Placeholder password for OAuth users
          isEmailVerified: googleUserData.email_verified,
          authProvider: 'google'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken((user._id as any).toString());

      // Remove sensitive data
      const userResponse = await User.findById(user._id).select("-password -refreshToken");

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: userResponse,
              accessToken,
              refreshToken,
            },
            "Google authentication successful"
          )
        );

    } catch (error: any) {
      console.error("Google OAuth error:", error);
      throw new ApiError(400, error.message || "Google authentication failed");
    }
  }
);

// Verify Google ID Token (for direct frontend integration)
const verifyGoogleToken = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError(400, "Google ID token is required");
    }

    try {
      // Verify the ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new ApiError(400, "Invalid Google token");
      }

      const googleUserData: GoogleUserData = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!
      };

      // Check if email is from an educational domain
      const allowedDomains = ['.edu', '@jcboseust.ac.in', '@test.org', '@gmail.com'];
      const isEducationalEmail = allowedDomains.some(domain => 
        googleUserData.email.endsWith(domain) || googleUserData.email.includes(domain)
      );

      if (!isEducationalEmail) {
        throw new ApiError(400, "Please use a valid student email (.edu or institutional domain)");
      }

      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { email: googleUserData.email },
          { googleId: googleUserData.id }
        ]
      });

      if (user) {
        // User exists, update Google info if needed
        if (!user.googleId) {
          user.googleId = googleUserData.id;
          user.avatar = user.avatar || googleUserData.picture;
          user.isEmailVerified = googleUserData.email_verified;
          await user.save({ validateBeforeSave: false });
        }
      } else {
        // Create new user
        const username = googleUserData.email.split('@')[0].toLowerCase() + '_' + Date.now();
        
        user = await User.create({
          googleId: googleUserData.id,
          email: googleUserData.email,
          fullName: googleUserData.name,
          username: username,
          avatar: googleUserData.picture,
          coverImage: "",
          password: "google_oauth_" + googleUserData.id, // Placeholder password for OAuth users
          isEmailVerified: googleUserData.email_verified,
          authProvider: 'google'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken((user._id as any).toString());

      // Remove sensitive data
      const userResponse = await User.findById(user._id).select("-password -refreshToken");

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: userResponse,
              accessToken,
              refreshToken,
            },
            "Google authentication successful"
          )
        );

    } catch (error: any) {
      console.error("Google token verification error:", error);
      throw new ApiError(400, error.message || "Google token verification failed");
    }
  }
);

// Link Google Account to Existing User
const linkGoogleAccount = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { idToken } = req.body;
    const userId = req.user?._id;

    if (!idToken) {
      throw new ApiError(400, "Google ID token is required");
    }

    if (!userId) {
      throw new ApiError(401, "User must be authenticated");
    }

    try {
      // Verify the ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new ApiError(400, "Invalid Google token");
      }

      const googleUserData: GoogleUserData = {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture!,
        email_verified: payload.email_verified!
      };

      // Check if Google account is already linked to another user
      const existingUser = await User.findOne({ googleId: googleUserData.id });
      if (existingUser && (existingUser._id as any).toString() !== userId?.toString()) {
        throw new ApiError(400, "This Google account is already linked to another user");
      }

      // Update current user with Google info
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            googleId: googleUserData.id,
            isEmailVerified: googleUserData.email_verified
          }
        },
        { new: true }
      ).select("-password -refreshToken");

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, user, "Google account linked successfully"));

    } catch (error: any) {
      console.error("Google account linking error:", error);
      throw new ApiError(400, error.message || "Failed to link Google account");
    }
  }
);

// Unlink Google Account
const unlinkGoogleAccount = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "User must be authenticated");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          googleId: 1
        }
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Google account unlinked successfully"));
  }
);

export {
  getGoogleAuthUrl,
  handleGoogleCallback,
  verifyGoogleToken,
  linkGoogleAccount,
  unlinkGoogleAccount,
};