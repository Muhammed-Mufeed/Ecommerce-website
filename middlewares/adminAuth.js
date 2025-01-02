
exports.checkLogin = async (req,res,next)=>{
  try {
    if(!req.session.admin){
      return  res.redirect('/admin/login')  // Redirect to admin login if admin  session doesn't exist
     }
     else{
       next()
     }
  } catch (error) {
    console.log("Error during admin Login Auth",error)
    res.status(500).send("Internal Server Error")
  }
  
}

exports.checkLogout = async (req,res,next)=>{
  try {
    if(req.session.admin){
       return res.redirect('/admin/dashboard')   // Redirect to admin dashboard if already logged in
    }
     else{
       next()
     }
  } catch (error) {
    console.log("Error during admin Logout Auth",error)
    res.status(500).send("Internal Server Error")
  }
  
}