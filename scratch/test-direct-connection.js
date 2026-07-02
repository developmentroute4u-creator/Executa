const mongoose = require("mongoose");

async function run() {
  // Let's use the direct connection string to connect to the replica set nodes
  const uri = "mongodb://developmentroute4u_db_user:kJv2aHrJcH8Rzxna@ac-gfq8tjk-shard-00-00.9c7jhgd.mongodb.net:27017,ac-gfq8tjk-shard-00-01.9c7jhgd.mongodb.net:27017,ac-gfq8tjk-shard-00-02.9c7jhgd.mongodb.net:27017/executa?replicaSet=atlas-13jjwj-shard-0&ssl=true&authSource=admin";
  
  console.log("Connecting directly to replica set nodes...");
  await mongoose.connect(uri);
  console.log("Successfully connected directly!");
  
  await mongoose.disconnect();
}

run().catch(console.error);
