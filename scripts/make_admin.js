const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/executa');
  const db = mongoose.connection.db;
  await db.collection('users').updateOne(
    { email: 'jaythaker42@gmail.com' },
    { $set: { role: 'admin' } }
  );
  console.log('Successfully upgraded SAM 2.0 to admin!');
  process.exit(0);
}

run().catch(console.error);
