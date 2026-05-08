const User = require('../models/userSchema')

const  setUserData = async (req,res,next)=>{
  try {
    if(req.session.user){
      res.locals.userData = await User.findById({_id:req.session.user.id})
     }
     else{
      res.locals.userData = null
     }
  } catch (error) {
    console.log("Error fetching User data",error)
    res.locals.userData = null
  }

  next();  // Move to the next middleware or route

}


module.exports = setUserData