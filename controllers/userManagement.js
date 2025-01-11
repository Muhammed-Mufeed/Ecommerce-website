const User = require('../models/userSchema')


// ===============================================CustomerManagement-GET===================================================================//
exports.getuserManagement = async (req,res)=>{
try {
 const users = await User.find({isAdmin:false})        // Fetch all users from the database
 res.render('customers',{users})        // Pass users to the EJS file
} catch (error) {
  console.error("Error during loading customer page",error)
  res.status(500).send("Internal Server Error")
}
}






exports.updateUserStatus = async (req,res)=>{
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if(!user){
      res.status(404).json({success:false,message:"User not found"})
    }

    user.isBlocked =  !user.isBlocked   // The admin can click a button to either block or unblock a user, and this code handles that logic.
                                           //If user.isBlocked is true, !user.isBlocked will evaluate to false.
                                           //If user.isBlocked is false, !user.isBlocked will evaluate to true

    await user.save() 

     // To return success response with a message
     const message = user.isBlocked  ? 'The user has been blocked successfully.' : 'The user has been unblocked successfully.';

    res.status(200).json({success:true,isBlocked:user.isBlocked,message})   // Current blocked status after toggling
  } 
  
  catch (error) {
    res.status(500).json({success:false,message:"Internal server Error"})  // Success message
  }
}
