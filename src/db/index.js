import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


dotenv.config({path:"./env"})

const connectDB=async()=>{
    console.log(process.env.PASSWORD);
    try{
        const connectionInstance = await mongoose.connect(
          `${process.env.CONNNECTION_URI}/${DB_NAME}`
        );
         console.log( `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}` );
    }catch(error){
        console.log("DB connection failed--- " , error)
        process.exit(1)
    }
}
export default connectDB;