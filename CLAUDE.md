# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack student networking application ("Omegle for university students") with WebRTC-based real-time communication capabilities.

**Backend (`/backend`)**
- Express.js server with TypeScript
- MongoDB with Mongoose ODM
- Socket.io for real-time communication
- JWT authentication with refresh tokens
- Cloudinary for image uploads
- WebRTC signaling server for peer-to-peer connections

**Frontend (`/frontend`)**
- React 18 with TypeScript
- Vite as build tool
- TailwindCSS for styling
- React Router for navigation
- Redux Toolkit for state management (partially implemented)
- Socket.io client for real-time features
- React Three Fiber for 3D components

## Key Components

### Backend Core Architecture
- **UserManager** (`src/managers/UserManager.ts`): Handles user connections, queuing system for matchmaking
- **RoomManager** (`src/managers/roomManager.ts`): Manages WebRTC rooms and signaling for peer-to-peer connections
- **User Model** (`src/models/user.model.ts`): Mongoose schema with authentication methods and JWT token generation
- **Database** (`src/db/index.ts`): MongoDB connection setup

### Frontend Architecture
- **Routing** (`src/main.tsx`): React Router setup with routes for landing, login, register, verify pages
- **State Management**: Redux store configured but incomplete (`src/app/store.js`)
- **Components**: Modular component structure for reusable UI elements

### WebRTC Flow
1. Users connect via Socket.io
2. UserManager queues users for matchmaking
3. When 2+ users available, RoomManager creates WebRTC room
4. Signaling handled through Socket.io events (offer, answer, ICE candidates)

## Development Commands

### Backend
```bash
cd backend
npm run dev    # Compile TypeScript and start server
```

### Frontend
```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production (TypeScript compile + Vite build)
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Environment Setup

Backend requires `.env` file with:
- `MONGODB_URL`: MongoDB connection string
- `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET`: JWT secrets
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Image upload config
- `PORT`: Server port (default 3000)

## Project Context

This project aims to create a university student networking platform with features planned for:
- Student authentication and verification
- Real-time chat and video calling
- Club endorsements and activities
- Student marketplace
- Blog posting capabilities

Current implementation focuses on the core WebRTC infrastructure and basic authentication system.