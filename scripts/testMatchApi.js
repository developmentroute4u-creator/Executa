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

  const rawFreelancers = await db.collection("freelancerprofiles").find({
    testStatus: "approved"
  }).toArray();

  console.log(`Found ${rawFreelancers.length} approved freelancers in MongoDB:`);
  for (const f of rawFreelancers) {
    const user = await db.collection("users").findOne({ _id: f.userId });
    console.log(`- Name: ${user?.name}, Email: ${user?.email}, Domain: ${f.domain}, Bio: ${f.bio}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
