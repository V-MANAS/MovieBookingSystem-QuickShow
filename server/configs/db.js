import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);

        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;