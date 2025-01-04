
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