const mongoose=require("mongoose")
const{Schema}=mongoose

const userSchema= new Schema({
  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },
  
  phone:{
    type:String,
    required:false,
  },

  googleId:{
   type:String,
   unique:true,
   sparse:true,
   index:true,
  },

  password:{
    type:String,
    required:false
  },

  isBlocked:{
    type:Boolean,
    default:false
  },

  isAdmin:{
    type:Boolean,
    default:false
  }

},{timestamps:true})

const User=mongoose.model("User",userSchema);
module.exports=User