const mongoose=require("mongoose")

const variantSchema = new mongoose.Schema({

  color: {
    type:String,
    required:true
  },
  colorName: {
    type:String,
    required:true
  },

  images: [{
    type:String,
    required:true
  }],

  stock: {
    type:Number,
    required:true
  },

  isListed: {
    type:Boolean,
    default:true
  }
},{ _id: true ,timestamps:true})  // each variant gets its own _id


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

  variants:[variantSchema]
},{timestamps:true})


const Product= mongoose.model("Product",productSchema)
module.exports=Product