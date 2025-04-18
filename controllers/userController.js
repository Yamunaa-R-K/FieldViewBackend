const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const assignPermissions = require("../helpers/utils").assignPermissions
const generateToken = require("../helpers/utils").generateToken;
//const sendSMS = require("../helpers/sendSMS");


// User Registration
const registerUser = async (req, res) => {
  const { fullName, idProofType, idProofNumber, designation, workplace, mobileNumber, password } = req.body;

  if (!fullName || !idProofType || !idProofNumber || !designation || !workplace || !mobileNumber || !password) {
      return res.status(400).json({ error: "All fields are required" });
  }

  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { roleType, canSubmit, canSign } = assignPermissions(designation);

      await pool.execute(
        `INSERT INTO users 
         (full_name, id_proof_type, id_proof_number, designation, workplace, mobile_number, password_hash, role_type, can_submit, can_sign) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fullName, idProofType, idProofNumber, designation, workplace, mobileNumber, hashedPassword, roleType, canSubmit, canSign]
      );

      res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ error: error.message });
  }
};

// User Login


// OTP Verification
const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [userId]);
      const user = rows[0];

      if (!user || user.otp !== otp) return res.status(401).json({ message: "Invalid OTP" });

      await pool.execute("UPDATE users SET otp = NULL WHERE id = ?", [userId]);
      const token = generateToken(user);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          role: user.designation,
          roleType: user.role_type,
          canSubmit: user.can_submit,
          canSign: user.can_sign,
        }
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
const otpStore = new Map();



const loginUser = async (req, res) => {
  const { idProofNumber, password } = req.body;

  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE id_proof_number = ?",
      [idProofNumber]
    );

    if (users.length === 0) return res.status(401).json({ message: "User not found" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate OTP and store it temporarily (in DB, or for now, attach to user object)
    const otp = Math.floor(100000 + Math.random() * 900000);
    await pool.execute("UPDATE users SET otp = ? WHERE id = ?", [otp, user.id]);

    // For testing, just return it in the response (in real, send via SMS API)
    const message = `Your OTP for login is ${otp}. Do not share this with anyone.`;
    //await sendSMS(user.mobile_number, message);
    res.json({
      message: message,
      userId: user.id,
      otp: otp 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const viewProfile = async (req, res) => {
  console.log("Inside viewProfile Route");
  console.log("User ID from token:", req.user.id); // Debug log
  
  const userId = req.user.id; // Extract user ID from token (verifyToken middleware)

  try {
      // Fetch user data from the database
      const [rows] = await pool.execute(
          `SELECT full_name AS fullName, id_proof_type AS idProofType, 
                  id_proof_number AS idProofNumber, designation, workplace, 
                  mobile_number AS mobileNumber 
           FROM users WHERE id = ?`,
          [userId]
      );

      if (rows.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      // Return user profile details
      res.status(200).json(rows[0]);
  } catch (error) {
      res.status(500).json({ error: "Internal server error", message: error.message });
  }
};

const updateProfile = async (req, res) => {
  console.log("Inside updateProfile Route");
  const userId = req.user.id; // Extract user ID from token
  console.log("User ID from token:", userId);
  // Fields users can update
  const { fullName, designation, workplace, mobileNumber } = req.body;
  const { roleType, canSubmit, canSign } = assignPermissions(designation);

  if (!fullName || !designation || !workplace || !mobileNumber) {
      return res.status(400).json({ error: "All fields are required for update" });
  }

  try {
      const [result] = await pool.execute(
          `UPDATE users SET full_name = ?, designation = ?, workplace = ?, mobile_number = ?, role_type = ?, can_submit = ?, can_sign = ? WHERE id = ?`,
          [fullName, designation, workplace, mobileNumber,roleType,canSign,canSubmit, userId]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found or no changes made" });
      }

      res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, verifyOtp, viewProfile, updateProfile };
