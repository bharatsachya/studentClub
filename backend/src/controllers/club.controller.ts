import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Club Endorsement Interface
interface ClubEndorsement {
  clubName: string;
  university: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  clubDescription: string;
  clubType: string;
  establishedYear?: number;
  memberCount?: number;
  clubWebsite?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  endorsementReason: string;
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Message Interface
interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageType: 'general' | 'club_endorsement' | 'support' | 'feedback';
  userId?: mongoose.Types.ObjectId;
  status: 'new' | 'read' | 'responded' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Club Endorsement Schema
const clubEndorsementSchema = new mongoose.Schema<ClubEndorsement>({
  clubName: {
    type: String,
    required: [true, "Club name is required"],
    trim: true,
    maxlength: [100, "Club name cannot exceed 100 characters"]
  },
  university: {
    type: String,
    required: [true, "University is required"],
    trim: true,
    maxlength: [100, "University name cannot exceed 100 characters"]
  },
  contactPerson: {
    type: String,
    required: [true, "Contact person name is required"],
    trim: true,
    maxlength: [100, "Contact person name cannot exceed 100 characters"]
  },
  contactEmail: {
    type: String,
    required: [true, "Contact email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  contactPhone: {
    type: String,
    trim: true,
    maxlength: [20, "Phone number cannot exceed 20 characters"]
  },
  clubDescription: {
    type: String,
    required: [true, "Club description is required"],
    trim: true,
    minlength: [50, "Description must be at least 50 characters"],
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  },
  clubType: {
    type: String,
    required: [true, "Club type is required"],
    enum: {
      values: ['academic', 'sports', 'cultural', 'technical', 'social', 'volunteer', 'professional', 'arts', 'other'],
      message: "Please select a valid club type"
    }
  },
  establishedYear: {
    type: Number,
    min: [1900, "Established year must be after 1900"],
    max: [new Date().getFullYear(), "Established year cannot be in the future"]
  },
  memberCount: {
    type: Number,
    min: [1, "Member count must be at least 1"]
  },
  clubWebsite: {
    type: String,
    trim: true,
    match: [/^https?:\/\//, "Website must be a valid URL starting with http:// or https://"]
  },
  socialMedia: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  endorsementReason: {
    type: String,
    required: [true, "Endorsement reason is required"],
    trim: true,
    minlength: [100, "Endorsement reason must be at least 100 characters"],
    maxlength: [500, "Endorsement reason cannot exceed 500 characters"]
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: Date,
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [500, "Review notes cannot exceed 500 characters"]
  }
}, { timestamps: true });

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema<ContactMessage>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
    maxlength: [200, "Subject cannot exceed 200 characters"]
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [20, "Message must be at least 20 characters"],
    maxlength: [2000, "Message cannot exceed 2000 characters"]
  },
  messageType: {
    type: String,
    enum: ['general', 'club_endorsement', 'support', 'feedback'],
    default: 'general'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded', 'closed'],
    default: 'new'
  }
}, { timestamps: true });

// Create indexes
clubEndorsementSchema.index({ university: 1, clubName: 1 });
clubEndorsementSchema.index({ requestedBy: 1, status: 1 });
clubEndorsementSchema.index({ status: 1, createdAt: -1 });

contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ status: 1, messageType: 1 });

// Create models
const ClubEndorsement = mongoose.model<ClubEndorsement>("ClubEndorsement", clubEndorsementSchema);
const ContactMessage = mongoose.model<ContactMessage>("ContactMessage", contactMessageSchema);

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Submit Club Endorsement Controller
const submitClubEndorsement = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const {
      clubName,
      university,
      contactPerson,
      contactEmail,
      contactPhone,
      clubDescription,
      clubType,
      establishedYear,
      memberCount,
      clubWebsite,
      socialMedia,
      endorsementReason
    } = req.body;

    const userId = req.user?._id;

    // Validation
    if (!clubName?.trim() || !university?.trim() || !contactPerson?.trim() || 
        !contactEmail?.trim() || !clubDescription?.trim() || !clubType?.trim() || !endorsementReason?.trim()) {
      throw new ApiError(400, "All required fields must be provided");
    }

    // Check if club already exists for this university
    const existingEndorsement = await ClubEndorsement.findOne({
      clubName: clubName.trim(),
      university: university.trim(),
      status: { $in: ['pending', 'approved'] }
    });

    if (existingEndorsement) {
      throw new ApiError(409, "A club endorsement request with this name already exists for this university");
    }

    // Create endorsement request
    const endorsementData = {
      clubName: clubName.trim(),
      university: university.trim(),
      contactPerson: contactPerson.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone?.trim(),
      clubDescription: clubDescription.trim(),
      clubType,
      establishedYear,
      memberCount,
      clubWebsite: clubWebsite?.trim(),
      socialMedia,
      endorsementReason: endorsementReason.trim(),
      requestedBy: userId
    };

    const endorsement = await ClubEndorsement.create(endorsementData);

    // Send confirmation email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactEmail,
        subject: 'Club Endorsement Request Submitted - StudentConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Club Endorsement Request Submitted</h2>
            <p>Thank you for submitting your club endorsement request!</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Request Details:</h3>
              <p><strong>Club Name:</strong> ${clubName}</p>
              <p><strong>University:</strong> ${university}</p>
              <p><strong>Request ID:</strong> ${endorsement._id}</p>
            </div>
            <p>We'll review your request and get back to you within 5-7 business days.</p>
            <p>Best regards,<br>StudentConnect Team</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Populate the response
    const populatedEndorsement = await ClubEndorsement.findById(endorsement._id)
      .populate("requestedBy", "fullName username email")
      .lean();

    return res
      .status(201)
      .json(new ApiResponse(201, populatedEndorsement, "Club endorsement request submitted successfully"));
  }
);

// Submit Contact Message Controller
const submitContactMessage = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, email, subject, message, messageType } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      throw new ApiError(400, "All fields are required");
    }

    // Create contact message
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      messageType: messageType || 'general',
      userId
    };

    const contactMessage = await ContactMessage.create(contactData);

    // Send acknowledgment email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Message Received - StudentConnect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Thank You for Contacting Us</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will get back to you as soon as possible.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Your Message:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Reference ID:</strong> ${contactMessage._id}</p>
            </div>
            <p>Best regards,<br>StudentConnect Team</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send acknowledgment email:", emailError);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, contactMessage, "Message submitted successfully"));
  }
);

// Get Club Endorsements Controller (for admin)
const getClubEndorsements = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const university = req.query.university as string;

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (university) query.university = university;

    const skip = (page - 1) * limit;

    const [endorsements, totalCount] = await Promise.all([
      ClubEndorsement.find(query)
        .populate("requestedBy", "fullName username email")
        .populate("reviewedBy", "fullName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClubEndorsement.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalEndorsements: totalCount,
      endorsementsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { endorsements, pagination: paginationInfo }, "Club endorsements fetched successfully"));
  }
);

// Get User's Club Endorsements Controller
const getUserClubEndorsements = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const [endorsements, totalCount] = await Promise.all([
      ClubEndorsement.find({ requestedBy: userId })
        .populate("reviewedBy", "fullName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClubEndorsement.countDocuments({ requestedBy: userId })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalEndorsements: totalCount,
      endorsementsPerPage: limit
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { endorsements, pagination: paginationInfo }, "User club endorsements fetched successfully"));
  }
);

// Update Club Endorsement Status Controller (for admin)
const updateClubEndorsementStatus = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.user?._id;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid endorsement ID");
    }

    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError(400, "Status must be either 'approved' or 'rejected'");
    }

    const endorsement = await ClubEndorsement.findById(id).populate("requestedBy", "fullName email");

    if (!endorsement) {
      throw new ApiError(404, "Club endorsement not found");
    }

    if (endorsement.status !== 'pending') {
      throw new ApiError(400, "Can only update pending endorsements");
    }

    // Update endorsement
    endorsement.status = status;
    endorsement.reviewedBy = reviewerId;
    endorsement.reviewedAt = new Date();
    endorsement.reviewNotes = reviewNotes?.trim();

    await endorsement.save();

    // Send notification email
    try {
      const statusText = status === 'approved' ? 'Approved' : 'Rejected';
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: endorsement.contactEmail,
        subject: `Club Endorsement ${statusText} - StudentConnect`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">
              Club Endorsement ${statusText}
            </h2>
            <p>Your club endorsement request has been ${status}.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Request Details:</h3>
              <p><strong>Club Name:</strong> ${endorsement.clubName}</p>
              <p><strong>University:</strong> ${endorsement.university}</p>
              <p><strong>Status:</strong> ${statusText}</p>
              ${reviewNotes ? `<p><strong>Review Notes:</strong> ${reviewNotes}</p>` : ''}
            </div>
            ${status === 'approved' ? 
              '<p>Congratulations! Your club is now endorsed on StudentConnect.</p>' : 
              '<p>You can submit a new request with additional information if needed.</p>'
            }
            <p>Best regards,<br>StudentConnect Team</p>
          </div>
        `
      };

      await emailTransporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send status notification email:", emailError);
    }

    const updatedEndorsement = await ClubEndorsement.findById(id)
      .populate("requestedBy", "fullName username email")
      .populate("reviewedBy", "fullName username")
      .lean();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedEndorsement, `Club endorsement ${status} successfully`));
  }
);

export {
  submitClubEndorsement,
  submitContactMessage,
  getClubEndorsements,
  getUserClubEndorsements,
  updateClubEndorsementStatus,
};