const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User"); // adjust path if needed

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const dbURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
    if (!dbURI) {
      throw new Error("❌ No MongoDB URI found in environment variables");
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Admin credentials
    const username = "8446348461";
    const password = "Prarambh@0001"; // ⚠️ change this in production
    const role = "admin";

    // Check if admin already exists
    let admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log("⚠️ Admin already exists:");
      console.log(`➡️ Username: ${admin.username}`);
    } else {
      console.log("➡️ No admin found. Creating one...");

      const hashedPassword = await bcrypt.hash(password, 10);

      admin = new User({
        username,
        password: hashedPassword,
        role,
      });

      await admin.save();

      console.log("🎉 Admin created successfully!");
      console.log("   Login credentials:");
      console.log(`   ➡️ Username: ${username}`);
      console.log(`   ➡️ Password: ${password}`);
    }
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
