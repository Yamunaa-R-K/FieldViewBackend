const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");

const {
  submitReport,
  getMyReports,
  getPendingReports,
  signReport,
  getSignedReports,
  getReportStatuses,
} = require("../controllers/reportController");

console.log("Multer Upload Type:", typeof upload);
console.log("Submit Report Function:", typeof submitReport);


router.post(
  "/",
  (req, res, next) => {
    console.log("Incoming request to /reports/");
    next();
  },
  verifyToken,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "files", maxCount: 5 },
  ]),
  submitReport
);

router.get("/mine", verifyToken, getMyReports);
router.get("/pending", verifyToken, getPendingReports);
router.patch("/:id/sign", verifyToken, signReport);
router.get("/signed", verifyToken, getSignedReports);
router.get("/my-statuses", verifyToken, getReportStatuses);

module.exports = router;