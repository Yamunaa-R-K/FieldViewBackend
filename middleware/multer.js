const multer = require("multer");
const path = require("path");

// Define Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory for storing uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9); // Generate unique filename
    cb(null, uniqueName + path.extname(file.originalname)); // Preserve original file extension
  },
});

// Updated File Filter to Allow Images and PDFs
// const fileFilter = (req, file, cb) => {
//   // List of allowed MIME types
//   const allowedTypes = [
//     "image/jpeg", 
//     "image/png", 
//     "image/gif", 
//     "application/pdf"
//   ];

//   // Check if the file's MIME type is in the list of allowed types
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Only JPEG, PNG, GIF images and PDF files are allowed!"), false); // Reject the file
//   }
// };
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  cb(null, true);
};
// Configure Multer with File Size Limit and Updated Filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 10MB
});

module.exports = upload;