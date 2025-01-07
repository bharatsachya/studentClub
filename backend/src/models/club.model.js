import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true,
        trim: true,
    },
    ClubId:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    Description:{
        type: String,
        required: true,
        trim: true,
    },
    avatar:{
        type: String,
    },
    coverImage:{
        type: String,
    },
    Mentor:{
        type: String,
        required: true,
        trim: true,
    }    
})

export default mongoose.model('Club', clubSchema);