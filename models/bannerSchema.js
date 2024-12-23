const mongoose=require('mongoose')
const {Schema}=mongoose

const bannerSchema=new Schema({    //banner means home page sliding image
  image:{
    type:String,
    required:true
  },

  title:{
    type:String,
    required:true
  },

  description:{
    type:String,
    required:true
  },

  link:{
    type:String
  },

  startDate:{
    type:Date,
    required:true
  },

  endDate:{
    type:Date,
    required:true
  }
})

const Banner= mongoose.model("Banner",bannerSchema)
module.exports=Banner