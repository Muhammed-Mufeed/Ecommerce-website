const mongoose=require("mongoose")

const productSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      
  },
  description: {
      type: String,
      required: true
  },
  actualPrice: {
      type: Number,
      required: true,
      
  },
  sellingPrice: {
    type: Number,
    required: true,
    
},
  stock: {
    type:String,
    required:true
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