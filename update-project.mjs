import { MongoClient, ObjectId } from 'mongodb';

async function run() {
  const uri = "mongodb+srv://developmentroute4u_db_user:kJv2aHrJcH8Rzxna@cluster0.9c7jhgd.mongodb.net/executa?appName=Cluster0";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('executa');
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId("6a200cf597956210749189d1") },
      { $set: { title: "Route4U Creator App" } }
    );
    console.log(result);
  } finally {
    await client.close();
  }
}
run();
