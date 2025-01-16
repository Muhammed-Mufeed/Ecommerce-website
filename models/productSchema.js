const mongoose=require("mongoose")
const {Schema}=mongoose

const productSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      
  },
  description: {
      type: String,
      required: true
  },
  price: {
      type: Number,
      required: true,
      
  },
  images: [{
      type: String,
      required: true
  }],
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
  },
  brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true
  },
  isListed: {
      type: Boolean,
      default: true
  },

  status:{
  type:String,
  enum:["Available","Out of Stock"],
  required:true,
  default:'Available'
  },

},{timestamps:true})


const Product= mongoose.model("Product",productSchema)
module.exports=Product