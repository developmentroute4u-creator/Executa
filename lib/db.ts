import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  uri?: string;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, uri: "" };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI as string;
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cached.conn && cached.uri === MONGODB_URI) return cached.conn;

  if (!cached.promise || cached.uri !== MONGODB_URI) {
    cached.uri = MONGODB_URI;
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;

  // Gracefully seed default admin users if they do not exist
  try {
    const { User } = await import("../models/User");
    
    // 1. Seed admin@executa.com admin
    const emailAdminExists = await User.findOne({ email: "admin@executa.com" });
    if (!emailAdminExists) {
      await User.create({
        name: "Admin System",
        email: "admin@executa.com",
        password: "admin123", // Automatically hashed by the User model pre-save hook
        role: "admin",
        onboardingComplete: true,
      });
      console.log("Seeded default admin account: admin@executa.com / admin123");
    }

    // 2. Seed 'admin' admin (in case the user enters just 'admin' as the username/email)
    const usernameAdminExists = await User.findOne({ email: "admin" });
    if (!usernameAdminExists) {
      await User.create({
        name: "Admin",
        email: "admin",
        password: "admin123", // Automatically hashed by the User model pre-save hook
        role: "admin",
        onboardingComplete: true,
      });
      console.log("Seeded default admin account: admin / admin123");
    }
  } catch (error) {
    console.error("Error seeding default admin users:", error);
  }

  return cached.conn;
}
