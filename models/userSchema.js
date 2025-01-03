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
    unique:true,
    sparse:true,
    default:null
  },


  password:{
    type:String,
    required:true
  },

  isBlocked:{
    type:Boolean,
    default:false
  },

  isAdmin:{
    type:Boolean,
    default:false
  },

  cart:[{
    type:Schema.Types.ObjectId,
    ref:"Cart"
  }],

  wallet:{
    type:Number,
    default:0
  },

  wishlist:[{
   type:Schema.Types.ObjectId,
   ref:"Wishlist"
  }],

  orderHistory:[{
    type:Schema.Types.ObjectId,
    ref:"Order"
  }],

  createdOn:{
    type:Date,
    default:Date.now
  },

  referalCode:{         //for new created users
    type:String
  },

  redeemed:{           //to check for it is redeemed or not.
    type:Boolean
  },

  redeemedUsers:[{      
     type: Schema.Types.ObjectId,
     ref:"User"
  }],

  searchHistory: [{    //to sort their 
    category: {
        type: Schema.Types.ObjectId,
        ref:"Category"
    },
    brand: {
      type: String
    },
    searchOn: {
      type:Date,
      default: Date.now
    }
  }]


})

const User=mongoose.model("User",userSchema);
module.exports=User