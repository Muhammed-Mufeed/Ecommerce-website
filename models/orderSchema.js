const mongoose=require("mongoose")
const {Schema}=mongoose
const {v4:uuidv4}=require("uuid") //to give random uuid number to user

const orderSchema=new Schema({
   orderId:{
    type:String,
    default:()=>uuidv4(),
    unique:true
   },

   orderItems:[{
      product:{
        type:Schema.Types.ObjectId,
        ref:"Product",
        required:true
      },

      quantity:{
        type:Number,
        required:true
      },

      price:{
        type:Number,
        default:0
      }
   }],

   totalPrice:{
    type:Number,
    required:true
   },

   discount:{
    type:Number,
    default:0
   },

   finalAmount:{
    type:Number,
    required:true
   },

   address:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
   
   invoiceDate:{
    type:Date
   },

   status:{
    type:String,
    required:true,
    enum:['pending','processing','shipped','Delivered','Cancelled','Return request','Returned']
   },

   createdOn :{
    type:Date,
    default:Date.now,
    required:true
   },

   couponApplied:{          //to know coupon applied or not
    type:Boolean,
    default:false
   }
})

const Order=mongoose.model("Order",orderSchema)
module.exports=Order