import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/appointy`);
    console.log("Database Connected");
  } catch (error) {
    console.error("Database connection warning: Local MongoDB appears offline. Operations depending on DB will fail, but server remains online. Error detail:", error.message);
  }
};

export default connectDB;
