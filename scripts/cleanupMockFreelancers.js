global.crypto = require("crypto");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Read .env.local to get database URI
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
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  // Identify seeded mock emails
  const mockEmails = ["alex.rivera@executa.io", "sophia.chen@executa.io", "david.kim@executa.io"];
  
  const usersCollection = db.collection("users");
  const profilesCollection = db.collection("freelancerprofiles");
  const testsCollection = db.collection("tests");

  // Find user IDs of mock users
  const mockUsers = await usersCollection.find({ email: { $in: mockEmails } }).toArray();
  const mockUserIds = mockUsers.map(u => u._id);

  if (mockUserIds.length > 0) {
    console.log(`Found ${mockUserIds.length} mock users. Deleting...`);
    const delProfiles = await profilesCollection.deleteMany({ userId: { $in: mockUserIds } });
    console.log(`Deleted ${delProfiles.deletedCount} freelancer profiles.`);

    const delTests = await testsCollection.deleteMany({ freelancerId: { $in: mockUserIds } });
    console.log(`Deleted ${delTests.deletedCount} skill tests.`);

    const delUsers = await usersCollection.deleteMany({ _id: { $in: mockUserIds } });
    console.log(`Deleted ${delUsers.deletedCount} users.`);
  } else {
    console.log("No mock users found in database via email.");
  }

  // Direct cleanup by unique keywords in case of duplicate runs
  const delRemainingProfiles = await profilesCollection.deleteMany({
    bio: { $regex: /Highly reliable fullstack|Detail-oriented frontend|Backend developer focused/i }
  });
  console.log(`Deleted ${delRemainingProfiles.deletedCount} additional mock profiles matching biographies.`);

  console.log("Database clean-up successful!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
