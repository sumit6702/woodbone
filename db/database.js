import mongoose from "mongoose";

const connectDB = async(DATABASE_URL)=>{
    try {
        const DB_OPTION = {
            dbName: 'Woodbone',
        }
        await mongoose.connect(DATABASE_URL,DB_OPTION);
        console.log("woodbone is connected to MongoDB")
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;