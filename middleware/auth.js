const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log

    const [rows] = await pool.execute(
      "SELECT can_submit, can_sign FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(403).json({ message: "User not found." });
    }

    const { can_submit, can_sign } = rows[0];

    req.user = {
      ...decoded,
      canSubmit: can_submit,
      canSign: can_sign,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
