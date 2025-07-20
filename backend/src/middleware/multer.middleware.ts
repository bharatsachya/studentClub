import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
// Define the upload directory
const uploadDirectory = path.join(process.cwd(), 'public', 'temp');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
      cb(null, uploadDirectory)
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,`${file.originalname}`)
    }
  })
export const upload = multer({
     storage
 })