// import multer from 'multer';
// import path from 'path';
// import { v2 as cloudinary } from 'cloudinary';
// import db from '../db_config/db.js'; 

// //cloudinary configuration
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // specify the upload directory
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
//       return cb(new Error('File type is not supported'), false);
//     }
//     cb(null, `${Date.now()}${ext}`); // generate a unique filename
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname);
//   if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
//     return cb(new Error('File type is not supported'), false);
//   }
//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 10, // 10MB file size limit
//   },
// });

// // Cleanup function
// function cleanupTempFiles() {
//   const fs = require('fs');
//   fs.readdir('uploads/', (err, files) => {
//     if (err) {
//       console.error('Error reading temporary files:', err);
//       return;
//     }

//     files.forEach(file => {
//       fs.unlink(`uploads/${file}`, (err) => {
//         if (err) {
//           console.error('Error deleting temporary file:', err);
//         } else {
//           console.log(`Deleted temporary file: ${file}`);
//         }
//       });
//     });
//   });
// }

// // Middleware to upload image to Cloudinary and save the URL to the database
// const uploadToCloudinary = async (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'pictures',
//     });

//     // Save the image URL to the database
//     await db.query('INSERT INTO image_path (url) VALUES (?)', [result.secure_url]);

//     // Clean up the temporary file
//     cleanupTempFiles();

//     req.cloudinaryUrl = result.secure_url;
//     next();
//   } catch (error) {
//     console.error('Error uploading image to Cloudinary:', error);
//     res.status(500).json({ error: 'Error uploading image' });
//   }
// };

// // Schedule cleanup every hour
// setInterval(cleanupTempFiles, 3600000);

// export { upload, uploadToCloudinary };