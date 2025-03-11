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

  productDiscount: {
    type:Number,
    default:0
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



// Pre-save middleware to calculate sellingPrice
productSchema.pre('save',function (next){

  // Check if either offerPercentage or actualPrice has been modified
   if(this.isModified ("productDiscount") || this.isModified("actualPrice"))
   {
    const discountAmount = (this.actualPrice * this.productDiscount) / 100 ;
    this.sellingPrice = Math.round(this.actualPrice - discountAmount)
   }  
   next()
})


const Product= mongoose.model("Product",productSchema)
module.exports=Product