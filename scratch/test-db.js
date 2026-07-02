const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/executa";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  
  const TestSchema = new mongoose.Schema({}, { strict: false });
  const Test = mongoose.models.Test || mongoose.model("Test", TestSchema, "tests");
  
  const tests = await Test.find({}).sort({ createdAt: -1 }).limit(5).lean();
  console.log("Latest 5 Test documents:");
  for (const t of tests) {
    console.log({
      id: t._id,
      freelancerId: t.freelancerId,
      status: t.status,
      taskPrompt: t.taskPrompt,
      assignmentTitle: t.assignmentTitle,
      hasProjectOverview: !!t.projectOverview,
      createdAt: t.createdAt
    });
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
