const User = require('../models/userSchema')


exports.checkLogin = async (req,res,next)=>{
  try {
    if(!req.session.user){
      return  res.redirect('/login')   // Redirect to login if user session doesn't exist
     }
     else{
       next()
     }
  } catch (error) {
    console.log("Error during user Login Auth",error)
    res.status(500).send("Internal Server Error")
  }
  
}


exports.checkLogout = async (req,res,next)=>{
  try {
    if(req.session.user){
       return res.redirect('/')   // Redirect to home if user is already logged in
    }
     else{
       next()
     }
  } catch (error) {
    console.log("Error during user Logout Auth",error)
    res.status(500).send("Internal Server Error")
  }
  
}

exports.checkBlocked = async (req,res,next)=>{
  try {
    if(!req.session.user){
    return next()  // If no user in session, continue (will be handled by the route),(get route)
    }

    // Get fresh user data from database to check current blocked status
    const currentUser = await User.findById(req.session.user.id)

    // If user is now blocked, destroy session and redirect
    if (currentUser && currentUser.isBlocked) {
      req.session.destroy((err) => {
          if (err) {
            console.log("Error destroying session:", err);
          }
          return res.redirect('/login?message=Your account has been blocked. Please contact support.');// Redirect to login with message,message is shown in getLogin from req.params
        });
      } 
      else {
        next();
      }
    }
    catch (error) {
    console.log("Error during block check:", error);
    res.status(500).send("Internal Server Error");
    }
 }