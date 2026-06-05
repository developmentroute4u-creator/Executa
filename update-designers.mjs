import { MongoClient } from 'mongodb';

async function run() {
  const uri = 'mongodb+srv://developmentroute4u_db_user:kJv2aHrJcH8Rzxna@cluster0.9c7jhgd.mongodb.net/executa?appName=Cluster0';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('executa');
    const result = await db.collection('freelancerprofiles').updateMany(
      { field: 'design' },
      { $set: { testStatus: 'approved', testScore: 92, level: 3, ratePerPoint: 250, available: true } }
    );
    console.log(`Updated ${result.modifiedCount} design freelancers to approved.`);
  } finally {
    await client.close();
  }
}
run();
