// Filename: utils/dbConnection.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Get the URI from environment variables
    const dbURI = process.env.MONGO_URI;

    if (!dbURI) {
      console.error("❌ MONGO_URI not found in .env file.");
      process.exit(1);
    }

    // Connect without the deprecated options
    await mongoose.connect(dbURI);

    console.log("✅ MongoDB Connected Successfully!");

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;