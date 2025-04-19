require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Initialize Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve Uploaded Files Dynamically
app.use("/uploads", express.static("uploads", {
    setHeaders: (res, path) => {
        const mime = require("mime");
        const mimeType = mime.getType(path); // Detect file MIME type dynamically
        res.setHeader("Content-Type", mimeType || "application/octet-stream"); // Ensure files render inline
    }
}));

// Routes Integration
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Error Handling for Invalid Routes
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found!" });
});

// Start Server
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});