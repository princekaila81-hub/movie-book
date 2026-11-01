import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const email = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = "admin";
      existing.password = await bcrypt.admin123(password, 10);
      await existing.save();
      console.log(`Admin updated: ${email}`);
    } else {
      await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: await bcrypt.admin123(password, 10),
        role: "admin",
      });
      console.log(`Admin created: ${email}`);
    }
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
