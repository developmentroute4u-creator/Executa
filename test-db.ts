require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Since we use TypeScript models, it's easier to just use the raw connection 
  // or compile it. Actually, I can just write a quick tsx script.
};

run();

export {};
