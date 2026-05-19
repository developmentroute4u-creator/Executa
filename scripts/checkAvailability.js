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

  const profiles = await db.collection("freelancerprofiles").find({}).toArray();
  profiles.forEach(p => {
    console.log(`Freelancer ID: ${p.userId}, Available: ${p.available}, TestStatus: ${p.testStatus}`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
