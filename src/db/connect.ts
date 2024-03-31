import { connect } from "mongoose";

export default async function connectDB ()  {
    await connect(String(process.env.MONGO_URI))

    console.log(`MongoDB connected successfully!!`)
}