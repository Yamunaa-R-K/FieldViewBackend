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
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true); // Accept images and PDFs
  } else {
    cb(new Error("Only image and PDF files are allowed!"), false); // Reject unsupported file types
  }
};

// Configure Multer with File Size Limit and Updated Filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit files to 10MB
});

module.exports = upload;