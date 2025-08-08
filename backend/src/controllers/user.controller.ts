import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import dotenv from "dotenv";
import { Interface } from "readline";
dotenv.config();
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
    let avatarLocalPath: any= "";
     if (
      req.files &&
      typeof req.files === "object" &&
      "avatar" in req.files &&
      Array.isArray((req.files as { [key: string]: Express.Multer.File[] }).avatar)
    ) {
      avatarLocalPath = (req.files as { [key: string]: Express.Multer.File[] }).avatar[0].path;
    }

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    let coverImageLocalPath: string = "";
    if (req.files && typeof req.files === "object" && "coverImage" in req.files && Array.isArray(req.files as {[key: string]: Express.Multer.File[]}) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Upload to Cloudinary 
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
    const userCrt: Object | null= await User.findById(user._id).select("-password -refreshToken");
    if (!userCrt) {
      throw new ApiError(500, "User creation failed");
    }
    const userCreated: string | null = userCrt ? "User created successfully" : null;
    if (!userCreated) {
      throw new ApiError(500, "User creation failed");
    }
    return res.status(201).json(new ApiResponse(200, userCreated));
  }
);

// Login User Controller
const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;

    // Validate username or email
    if (!(username || email)) {
      throw new ApiError(400, "Username or email is required");
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

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAcessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarImage,
};
