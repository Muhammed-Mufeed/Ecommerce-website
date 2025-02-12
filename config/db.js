const mongoose=require("mongoose")
const env=require("dotenv").config()

const connectDB= async()=>{
  try{
    await mongoose.connect(process.env.MONGOOSE_URI)
  }
  catch(error){
    console.log("MongoDB connection error:" ,error.message);
    process.exit(1)
    
  }
}

module.exports=connectDB