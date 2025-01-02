import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    CollegeId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    collegeName:{
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
    },
    coverImage:{
        type: String,
    },
    isVerified:{
        type: Boolean,
        default: false
    }
})

const User = mongoose.model('User', userSchema);

export default User;