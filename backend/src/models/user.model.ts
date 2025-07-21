import mongoose, { Schema, Document, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// 1. Define the interface for the user document
interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  coverImage: string;
  refreshToken: string | null;
  fullName: string;
  watchHistory: mongoose.Types.ObjectId[];

  // Instance methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// 2. Define the interface for the user model
interface UserModel extends Model<UserDocument> {
  // Static methods can be added here if needed
}

// 3. Define the schema
const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  avatar: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: false
  },
  refreshToken: {
    type: String,
    required: false
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: "Video"
  }],
}, { timestamps: true });

// 4. Add instance methods
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

// 5. Create and export the model with correct types
export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
