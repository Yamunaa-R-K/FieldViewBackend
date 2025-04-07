const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");

// Helper: Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.designation },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// Helper: Determine Role Type
function assignPermissions(designation) {
    switch (designation.toLowerCase()) {
      case "staff":
        return { roleType: "LOWER_OFFICIAL", canSubmit: true, canSign: false };
      case "district officials":
        return { roleType: "HIGHER_OFFICIAL", canSubmit: true, canSign: true };
      case "hod":
        return { roleType: "HIGHER_OFFICIAL", canSubmit: true, canSign: true };
      case "collector":
        return { roleType: "HIGHER_OFFICIAL", canSubmit: false, canSign: true };
      default:
        return { roleType: "UNKNOWN", canSubmit: false, canSign: false };
    }
  }
  
module.exports = { generateToken, assignPermissions };