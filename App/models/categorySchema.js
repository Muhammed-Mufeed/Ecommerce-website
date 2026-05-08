const mongoose=require("mongoose")
const{Schema}=mongoose

const categorySchema=new Schema({
   
   name:{
    type:String,
    required:true,
   },

   description:{
    type:String,
    required:true
   },
   image: {
      type: String,
      required: true
   },
   isListed:{
    type:Boolean,
    default:true
   },

   
},{timestamps:true})

module.exports = mongoose.model("Category",categorySchema)
