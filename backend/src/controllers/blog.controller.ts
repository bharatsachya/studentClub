import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiHandler";
import { asyncHandler } from "../utils/asynchandler";

// Blog Interface
interface BlogPost {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  excerpt?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Blog Schema (we'll create the model later)
const blogSchema = new mongoose.Schema<BlogPost>({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"]
  },
  content: {
    type: String,
    required: [true, "Content is required"],
    minlength: [50, "Content must be at least 50 characters"]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  excerpt: {
    type: String,
    maxlength: [300, "Excerpt cannot exceed 300 characters"]
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create indexes for better performance
blogSchema.index({ title: "text", content: "text", tags: "text" });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isPublished: 1, createdAt: -1 });

// Create Blog model
const Blog = mongoose.model<BlogPost>("Blog", blogSchema);

// Create Blog Post Controller
const createBlogPost = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { title, content, tags, excerpt } = req.body;
    const authorId = req.user?._id;

    // Validation
    if (!title?.trim() || !content?.trim()) {
      throw new ApiError(400, "Title and content are required");
    }

    if (content.length < 50) {
      throw new ApiError(400, "Content must be at least 50 characters long");
    }

    // Generate excerpt if not provided
    let finalExcerpt = excerpt;
    if (!finalExcerpt && content.length > 150) {
      finalExcerpt = content.substring(0, 150).trim() + "...";
    }

    // Process tags
    let processedTags: string[] = [];
    if (tags && Array.isArray(tags)) {
      processedTags = tags
        .map((tag: string) => tag.trim().toLowerCase())
        .filter((tag: string) => tag.length > 0)
        .slice(0, 10); // Limit to 10 tags
    }

    // Create blog post
    const blogPost = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      author: authorId,
      tags: processedTags,
      excerpt: finalExcerpt,
      isPublished: true
    });

    // Populate author information
    const populatedPost = await Blog.findById(blogPost._id)
      .populate("author", "fullName username avatar")
      .lean();

    return res
      .status(201)
      .json(new ApiResponse(201, populatedPost, "Blog post created successfully"));
  }
);

// Get All Blog Posts Controller
const getAllBlogPosts = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || "";
    const tags = req.query.tags as string || "";
    const author = req.query.author as string || "";
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string === "asc" ? 1 : -1;

    // Build query
    const query: any = { isPublished: true };

    // Search in title, content, and tags
    if (search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Filter by tags
    if (tags.trim()) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Filter by author
    if (author.trim()) {
      query.author = author;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Execute query with aggregation for better performance
    const [posts, totalCount] = await Promise.all([
      Blog.find(query)
        .populate("author", "fullName username avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalPosts: totalCount,
      postsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { posts, pagination: paginationInfo }, "Blog posts fetched successfully"));
  }
);

// Get Single Blog Post Controller
const getBlogPost = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid blog post ID");
    }

    const blogPost = await Blog.findById(id)
      .populate("author", "fullName username avatar")
      .lean();

    if (!blogPost) {
      throw new ApiError(404, "Blog post not found");
    }

    if (!blogPost.isPublished) {
      throw new ApiError(403, "Blog post is not published");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blogPost, "Blog post fetched successfully"));
  }
);

// Update Blog Post Controller
const updateBlogPost = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { title, content, tags, excerpt, isPublished } = req.body;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid blog post ID");
    }

    const blogPost = await Blog.findById(id);

    if (!blogPost) {
      throw new ApiError(404, "Blog post not found");
    }

    // Check if user is the author
    if (blogPost.author.toString() !== userId?.toString()) {
      throw new ApiError(403, "You can only edit your own blog posts");
    }

    // Prepare update data
    const updateData: any = {};

    if (title !== undefined) {
      if (!title.trim()) {
        throw new ApiError(400, "Title cannot be empty");
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      if (!content.trim() || content.length < 50) {
        throw new ApiError(400, "Content must be at least 50 characters long");
      }
      updateData.content = content.trim();
      
      // Auto-generate excerpt if content is updated and no excerpt provided
      if (!excerpt && content.length > 150) {
        updateData.excerpt = content.substring(0, 150).trim() + "...";
      }
    }

    if (excerpt !== undefined) {
      updateData.excerpt = excerpt.trim();
    }

    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags
        .map((tag: string) => tag.trim().toLowerCase())
        .filter((tag: string) => tag.length > 0)
        .slice(0, 10);
    }

    if (isPublished !== undefined) {
      updateData.isPublished = Boolean(isPublished);
    }

    const updatedPost = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "fullName username avatar");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Blog post updated successfully"));
  }
);

// Delete Blog Post Controller
const deleteBlogPost = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid blog post ID");
    }

    const blogPost = await Blog.findById(id);

    if (!blogPost) {
      throw new ApiError(404, "Blog post not found");
    }

    // Check if user is the author
    if (blogPost.author.toString() !== userId?.toString()) {
      throw new ApiError(403, "You can only delete your own blog posts");
    }

    await Blog.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Blog post deleted successfully"));
  }
);

// Get User's Blog Posts Controller
const getUserBlogPosts = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const includeUnpublished = req.query.includeUnpublished === "true";

    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    // Build query
    const query: any = { author: userId };
    
    // Only include unpublished posts if requested and user is viewing their own posts
    if (!includeUnpublished || userId !== req.user?._id?.toString()) {
      query.isPublished = true;
    }

    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      Blog.find(query)
        .populate("author", "fullName username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalPosts: totalCount,
      postsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res
      .status(200)
      .json(new ApiResponse(200, { posts, pagination: paginationInfo }, "User blog posts fetched successfully"));
  }
);

// Get Blog Statistics Controller
const getBlogStats = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?._id;

    const stats = await Blog.aggregate([
      {
        $facet: {
          totalPosts: [
            { $match: { author: userId, isPublished: true } },
            { $count: "count" }
          ],
          draftPosts: [
            { $match: { author: userId, isPublished: false } },
            { $count: "count" }
          ],
          totalViews: [
            { $match: { author: userId } },
            { $group: { _id: null, total: { $sum: "$views" } } }
          ],
          popularTags: [
            { $match: { author: userId, isPublished: true } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const result = {
      totalPublished: stats[0].totalPosts[0]?.count || 0,
      totalDrafts: stats[0].draftPosts[0]?.count || 0,
      totalViews: stats[0].totalViews[0]?.total || 0,
      popularTags: stats[0].popularTags || []
    };

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Blog statistics fetched successfully"));
  }
);

export {
  createBlogPost,
  getAllBlogPosts,
  getBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getUserBlogPosts,
  getBlogStats,
};