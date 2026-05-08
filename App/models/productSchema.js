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



// Pre-save middleware to synchronize sellingPrice and productDiscount

productSchema.pre("save", function (next) {
  // If actualPrice or productDiscount is modified, update sellingPrice
  if (this.isModified("actualPrice") || this.isModified("productDiscount")) {
    this.sellingPrice = Math.round(
      this.actualPrice - (this.actualPrice * this.productDiscount) / 100
    );
  }
  // If actualPrice or sellingPrice is modified, update productDiscount
  else if (this.isModified("actualPrice") || this.isModified("sellingPrice")) {
    if (this.actualPrice > 0) {
      this.productDiscount = Math.round(
        ((this.actualPrice - this.sellingPrice) * 100) / this.actualPrice
      );
      if (this.productDiscount < 0) this.productDiscount = 0; // Prevent negative discount
    }
  }
  next();
});


const Product= mongoose.model("Product",productSchema)
module.exports=Product