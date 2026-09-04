import mongoose from 'mongoose';

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medindia_ehr';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Connected to MongoDB successfully at ${mongoUri}`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}). Running in mock/standby mode.`);
    return false;
  }
}
