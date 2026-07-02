const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/executa";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  
  console.log("Collections in DB:");
  for (const col of collections) {
    if (col.options && col.options.validator) {
      console.log(`Collection: ${col.name} has validator!`);
      console.log(JSON.stringify(col.options.validator, null, 2));
    } else {
      console.log(`Collection: ${col.name} has no database-level validator.`);
    }
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
