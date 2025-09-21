import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
//router 
import userRouter from './routes/user.route';
import blogRouter from './routes/blog.route';
import studentRouter from './routes/student.route';
import webrtcRouter from './routes/webrtc.route';
import clubRouter from './routes/club.route';
import authRouter from './routes/auth.route';

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

app.use("/api/v1/user",userRouter);
app.use("/api/v1/blog",blogRouter);
app.use("/api/v1/student",studentRouter);
app.use("/api/v1/webrtc",webrtcRouter);
app.use("/api/v1/club",clubRouter);
app.use("/api/v1/auth",authRouter);

export {app};