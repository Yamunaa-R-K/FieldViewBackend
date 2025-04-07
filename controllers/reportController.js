const { get } = require("http");
const pool = require("../config/db");
const crypto = require("crypto");


const submitReport = async (req, res) => {
  const userId = req.user.id;
  const { canSubmit } = req.user; 
  const { report_title, report_details, location_lat, location_long } = req.body; 
  const photo = req.file?.filename; 
  const files = req.files?.map(file => file.filename); 

  if (!canSubmit) {
    return res.status(403).json({ message: "Permission denied to submit reports." });
  }

  if (!report_title || !report_details || (!photo && !files?.length)) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    await pool.execute(
      `INSERT INTO reports 
       (user_id, report_title, report_details, location_lat, location_long, photo, files) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, report_title, report_details, location_lat, location_long, photo, JSON.stringify(files)]
    );

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


const getMyReports = async (req, res) => {
  const userId = req.user.id;
  const { canSubmit } = req.user;

  if (!canSubmit) {
    return res.status(403).json({ message: "Access denied to view submitted reports." });
  }

  try {
    const [reports] = await pool.execute(
      `SELECT id, user_id, report_title, report_details, location_lat, location_long, photo, files, created_at 
       FROM reports WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const enrichedReports = reports.map(report => ({
      ...report,
      photoUrl: report.photo ? `/uploads/${report.photo}` : null, // Generate photo URL
      fileUrls: report.files ? JSON.parse(report.files).map(file => `/uploads/${file}`) : [], // Generate file URLs
    }));

    res.json({ reports: enrichedReports });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


const getPendingReports = async (req, res) => {
  const { canSign } = req.user;

  if (!canSign) {
    return res.status(403).json({ message: "Access denied to view pending reports." });
  }

  const [reports] = await pool.execute(
    `SELECT r.*, u.full_name 
     FROM reports r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.status = 'Pending' 
     ORDER BY r.created_at DESC`
  );

  res.json({ reports });
};

// 4. Sign Report (Only if canSign === true)
const signReport = async (req, res) => {
  const reportId = req.params.id;
  const signerId = req.user.id;
  const { role, canSign } = req.user;

  if (!canSign) {
    return res.status(403).json({ message: "Permission denied to sign reports." });
  }

  const signature = crypto
    .createHash("sha256")
    .update(`${reportId}:${signerId}:${role}:${Date.now()}`)
    .digest("hex");

  await pool.execute(
    `UPDATE reports SET status = 'Signed', signed_by = ?, signed_at = NOW(), signature = ? WHERE id = ?`,
    [signerId, signature, reportId]
  );

  res.json({ message: "Report signed successfully", signature });
};

// 5. Get Signed Reports (Only if canSign === true)
const getSignedReports = async (req, res) => {
  const { canSign } = req.user;

  if (!canSign) {
    return res.status(403).json({ message: "Access denied to view signed reports." });
  }

  const [reports] = await pool.execute(
    `SELECT r.*, u.full_name 
     FROM reports r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.status = 'Signed' 
     ORDER BY r.signed_at DESC`
  );

  res.json({ reports });
};

// 6. View Submitted Reports (Only if canSubmit === true)
const getReportStatuses = async (req, res) => {
  const userId = req.user.id;
  const { canSubmit } = req.user;

  if (!canSubmit) {
    return res.status(403).json({ message: "Access denied to view reports." });
  }

  const [reports] = await pool.execute(
    `SELECT id, report_title, status FROM reports WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  res.json({ reports });
};

module.exports = {
  submitReport,
  getMyReports,
  getPendingReports,
  signReport,
  getSignedReports,
  getReportStatuses
};
