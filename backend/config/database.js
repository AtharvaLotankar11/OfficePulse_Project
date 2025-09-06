const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB');
    console.error(`🔍 Error: ${err.message}`);
    console.error('💡 HINT: Make sure MongoDB is running locally or your connection string is correct.');
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
