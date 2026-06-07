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

  // Let's find the freelancer profile for "newfreelancer@gmail.com"
  const user = await db.collection("users").findOne({ email: "newfreelancer@gmail.com" });
  if (!user) {
    console.error("User not found");
    process.exit(1);
  }
  const userId = user._id;

  console.log("Before update:", await db.collection("freelancerprofiles").findOne({ userId }));

  // Try importing the model and doing findOneAndUpdate
  // Force delete from mongoose cache to test model rebuilding
  if (mongoose.models.FreelancerProfile) {
    delete mongoose.models.FreelancerProfile;
  }
  
  // Since we are in scripts, we can require the TS compiled model or define a schema
  // Let's see if we can use mongoose model
  const FreelancerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bankDetails: {
      payoutMethod: { type: String, default: "bank_transfer" },
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" },
      upiMobile: { type: String, default: "" },
      upiNumber: { type: String, default: "" },
    }
  });

  const FreelancerProfile = mongoose.models.FreelancerProfile || mongoose.model("FreelancerProfile", FreelancerProfileSchema);

  const body = {
    bankDetails: {
      payoutMethod: "upi_number",
      accountHolderName: "John Doe",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      upiMobile: "",
      upiNumber: "98765432"
    }
  };

  const { name, email, avatar, ...profileData } = body;

  try {
    const updated = await FreelancerProfile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { new: true }
    );
    console.log("After update model:", updated);
    console.log("After update raw DB:", await db.collection("freelancerprofiles").findOne({ userId }));
  } catch (err) {
    console.error("Update error:", err);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
