global.crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local file found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const uriMatch = envContent.match(/MONGODB_URI\s*=\s*(.*)/);
if (!uriMatch) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const mongoUri = uriMatch[1].trim().replace(/['"]/g, "");

async function main() {
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;

  console.log("=== USERS IN DATABASE ===");
  const users = await db.collection("users").find({}).toArray();
  users.forEach(u => {
    console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  });

  console.log("\n=== FREELANCER PROFILES IN DATABASE ===");
  const profiles = await db.collection("freelancerprofiles").find({}).toArray();
  profiles.forEach(p => {
    console.log(`- UserID: ${p.userId}, Field: ${p.field}, Domain: ${p.domain}, testStatus: ${p.testStatus}, Bio: ${p.bio.substring(0, 50)}...`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
