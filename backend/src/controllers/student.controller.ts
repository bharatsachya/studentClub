import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";

// Enhanced User Profile Interface
interface StudentProfile {
  university: string;
  major: string;
  year: number;
  bio?: string;
  interests: string[];
  location?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  isProfilePublic: boolean;
  lastActive: Date;
}

// Create Student Profile Schema
const studentProfileSchema = new mongoose.Schema<StudentProfile>({
  university: {
    type: String,
    required: [true, "University is required"],
    trim: true
  },
  major: {
    type: String,
    required: [true, "Major is required"],
    trim: true
  },
  year: {
    type: Number,
    required: [true, "Academic year is required"],
    min: 1,
    max: 8
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"],
    trim: true
  },
  interests: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  location: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/, 'Please enter a valid LinkedIn URL']
    },
    github: {
      type: String,
      trim: true,
      match: [/^https:\/\/github\.com\/.*$/, 'Please enter a valid GitHub URL']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https:\/\/twitter\.com\/.*$/, 'Please enter a valid Twitter URL']
    }
  },
  isProfilePublic: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for better search performance
studentProfileSchema.index({ university: 1, major: 1 });
studentProfileSchema.index({ interests: 1 });
studentProfileSchema.index({ year: 1 });
studentProfileSchema.index({ isProfilePublic: 1 });
studentProfileSchema.index({ lastActive: -1 });

// Create StudentProfile model
const StudentProfile = mongoose.model<StudentProfile>("StudentProfile", studentProfileSchema);

// Create or Update Student Profile Controller
const createOrUpdateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;
    const {
      university,
      major,
      year,
      bio,
      interests,
      location,
      socialLinks,
      isProfilePublic
    } = req.body;

    // Validation
    if (!university?.trim() || !major?.trim() || !year) {
      throw new ApiError(400, "University, major, and academic year are required");
    }

    if (year < 1 || year > 8) {
      throw new ApiError(400, "Academic year must be between 1 and 8");
    }

    // Process interests
    let processedInterests: string[] = [];
    if (interests && Array.isArray(interests)) {
      processedInterests = interests
        .map((interest: string) => interest.trim().toLowerCase())
        .filter((interest: string) => interest.length > 0)
        .slice(0, 20); // Limit to 20 interests
    }

    // Prepare profile data
    const profileData = {
      university: university.trim(),
      major: major.trim(),
      year: Number(year),
      bio: bio?.trim() || "",
      interests: processedInterests,
      location: location?.trim() || "",
      socialLinks: socialLinks || {},
      isProfilePublic: Boolean(isProfilePublic ?? true),
      lastActive: new Date()
    };

    // Update or create profile
    const profile = await StudentProfile.findOneAndUpdate(
      { _id: userId },
      profileData,
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, profile, "Student profile updated successfully"));
  }
);

// Get Student Profile Controller
const getStudentProfile = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const requestingUserId = req.user?._id;

    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    // Get user basic info
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get student profile
    const profile = await StudentProfile.findById(userId);

    // Check if profile is public or if user is viewing their own profile
    if (profile && !profile.isProfilePublic && userId !== requestingUserId?.toString()) {
      throw new ApiError(403, "This profile is private");
    }

    // Combine user and profile data
    const fullProfile = {
      ...user.toObject(),
      studentProfile: profile || null,
      isOnline: profile ? (Date.now() - profile.lastActive.getTime()) < 5 * 60 * 1000 : false // Online if active within 5 minutes
    };

    return res
      .status(200)
      .json(new ApiResponse(200, fullProfile, "Student profile fetched successfully"));
  }
);

// Search Students Controller
const searchStudents = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || "";
    const university = req.query.university as string || "";
    const major = req.query.major as string || "";
    const year = req.query.year as string || "";
    const interests = req.query.interests as string || "";
    const sortBy = req.query.sortBy as string || "lastActive";
    const sortOrder = req.query.sortOrder as string === "asc" ? 1 : -1;

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match only public profiles
    pipeline.push({
      $match: { isProfilePublic: true }
    });

    // Lookup user data
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              email: 1,
              avatar: 1,
              coverImage: 1
            }
          }
        ]
      }
    });

    // Unwind user info
    pipeline.push({
      $unwind: "$userInfo"
    });

    // Build match conditions
    const matchConditions: any = {};

    // Search in name, university, major, and interests
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      matchConditions.$or = [
        { "userInfo.fullName": searchRegex },
        { "userInfo.username": searchRegex },
        { university: searchRegex },
        { major: searchRegex },
        { interests: { $in: [searchRegex] } }
      ];
    }

    // Filter by university
    if (university.trim()) {
      matchConditions.university = new RegExp(university.trim(), 'i');
    }

    // Filter by major
    if (major.trim()) {
      matchConditions.major = new RegExp(major.trim(), 'i');
    }

    // Filter by year
    if (year.trim()) {
      matchConditions.year = parseInt(year);
    }

    // Filter by interests
    if (interests.trim()) {
      const interestArray = interests.split(',').map(interest => 
        new RegExp(interest.trim(), 'i')
      );
      matchConditions.interests = { $in: interestArray };
    }

    // Apply filters
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add online status
    pipeline.push({
      $addFields: {
        isOnline: {
          $lt: [
            { $subtract: [new Date(), "$lastActive"] },
            5 * 60 * 1000 // 5 minutes in milliseconds
          ]
        }
      }
    });

    // Sort
    const sortObj: any = {};
    if (sortBy === "name") {
      sortObj["userInfo.fullName"] = sortOrder;
    } else if (sortBy === "university") {
      sortObj.university = sortOrder;
    } else if (sortBy === "year") {
      sortObj.year = sortOrder;
    } else if (sortBy === "online") {
      sortObj.isOnline = -1; // Online users first
      sortObj.lastActive = -1;
    } else {
      sortObj.lastActive = sortOrder;
    }

    pipeline.push({ $sort: sortObj });

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    
    // Add pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Project final shape
    pipeline.push({
      $project: {
        _id: 1,
        university: 1,
        major: 1,
        year: 1,
        bio: 1,
        interests: 1,
        location: 1,
        socialLinks: 1,
        lastActive: 1,
        isOnline: 1,
        userInfo: 1,
        createdAt: 1
      }
    });

    // Execute queries
    const [students, totalCount] = await Promise.all([
      StudentProfile.aggregate(pipeline),
      StudentProfile.aggregate(countPipeline)
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalStudents: total,
      studentsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { 
        students, 
        pagination: paginationInfo,
        filters: {
          search: search || null,
          university: university || null,
          major: major || null,
          year: year || null,
          interests: interests || null
        }
      }, "Students fetched successfully"));
  }
);

// Get Universities List Controller
const getUniversities = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const universities = await StudentProfile.aggregate([
      { $match: { isProfilePublic: true } },
      { $group: { _id: "$university", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, universities, "Universities list fetched successfully"));
  }
);

// Get Majors List Controller
const getMajors = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const university = req.query.university as string;
    
    const matchStage: any = { isProfilePublic: true };
    if (university) {
      matchStage.university = university;
    }

    const majors = await StudentProfile.aggregate([
      { $match: matchStage },
      { $group: { _id: "$major", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, majors, "Majors list fetched successfully"));
  }
);

// Get Popular Interests Controller
const getPopularInterests = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const interests = await StudentProfile.aggregate([
      { $match: { isProfilePublic: true } },
      { $unwind: "$interests" },
      { $group: { _id: "$interests", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, interests, "Popular interests fetched successfully"));
  }
);

// Update Last Active Controller
const updateLastActive = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;

    await StudentProfile.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { upsert: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Last active updated successfully"));
  }
);

export {
  createOrUpdateProfile,
  getStudentProfile,
  searchStudents,
  getUniversities,
  getMajors,
  getPopularInterests,
  updateLastActive,
};