const express = require("express");
const { registerUser, loginUser, verifyOtp,viewProfile,updateProfile } = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/profile", verifyToken, viewProfile);
router.patch("/profile", verifyToken, updateProfile);


module.exports = router;
