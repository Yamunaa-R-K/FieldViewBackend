const axios = require("axios");
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
console.log("FAST2SMS_API_KEY:", FAST2SMS_API_KEY); // Debugging line to check if the API key is loaded
const sendSMS = async (phone, message) => {
  try {
    const res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        numbers: phone,
      },
      {
        headers: {
          "authorization": FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("SMS sending failed:", error.response?.data || error.message);
    throw new Error("Failed to send SMS");
  }
};

module.exports = sendSMS;
