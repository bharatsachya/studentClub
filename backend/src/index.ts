import dotenv from 'dotenv';
import http from 'http';
import connectDB from './db/index.js'
import {app} from './App';
import { initializeWebRTC } from './socket/webrtc';

dotenv.config(
    {
        path: '../env'
    }
)

connectDB()
.then(()=>{
   app.get('/',(req: import('express').Request, res: import('express').Response)=>{
       res.send("Server is running");
   })

    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket/WebRTC
    initializeWebRTC(server);

    server.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
        console.log(`WebSocket server initialized for WebRTC signaling`);
    })
})
.catch((error)=>{
    console.log(error);
});
