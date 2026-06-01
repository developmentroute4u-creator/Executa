import mongoose from "mongoose";
import fs from "fs";

const envStr = fs.readFileSync(".env.local", "utf8");
const uriMatch = envStr.match(/MONGODB_URI=(.*)/);
const uri = uriMatch ? uriMatch[1].trim() : null;

async function clearDB() {
  if (!uri) throw new Error("No MONGODB_URI found");
  console.log("Connecting...");
  await mongoose.connect(uri);
  
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    if (collection.collectionName !== "users") {
      console.log("Dropping collection", collection.collectionName);
      await collection.drop();
    }
  }
  
  console.log("Database cleared successfully!");
  process.exit(0);
}

clearDB().catch(console.error);
