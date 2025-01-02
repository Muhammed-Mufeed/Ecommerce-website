const Admin=require('../models/userSchema')
const bcrypt = require('bcrypt')


exports. getAdminpageNotFound=async(req,res)=>{
  try{
   return res.render('error-page.ejs')
  }
  catch(error){
   res.redirect('/admin/errorPage')
  }
}
// ==================================================================================================================//

 exports.getAdminLogin = async (req,res)=>{
  try {
    if(req.session.admin){
      return res.redirect('/admin/dashboard')
    }
    else{
      res.render('admin-login',{errorMessage:null})
    }
    
  } 
  catch (error) {
    console.error('Login page is not found',error)
    res.status(500).send("Internal server error")
  }
}


// ==================================================================================================================//
exports.postAdminLogin = async (req,res)=>{

try {
  const {email,password} = req.body
  const findAdmin =  await Admin.findOne({email,isAdmin:true})

  if(!findAdmin){
    return res.render('admin-login',{errorMessage:"You are not authorized to access this page"})
  }

  const passwordMatch = await bcrypt.compare(password,findAdmin.password)
  if(!passwordMatch){
     return res.render('admin-login',{errorMessage:"Invalid Email or Password"})
  }

  //store admin information in the session
  req.session.admin = {
    id: findAdmin._id
  }
   res.redirect('/admin/dashboard')
  }
  
  catch (error) {
  console.log("Login error",error)
  res.status(500).send("Internal server error")
  }

}

// ==================================================================================================================//
exports.getAdminDashboard = async (req,res)=>{
  try{
    const admin = req.session.admin
    if(admin){
      return res.render('dashboard',{errorMessage : null})
    }
    else{
      res.redirect('/admin/login')
    }  
  }

catch(error){
  console.log("Error during loading dashboard",error)
  res.status(500).send("Internal server error")
 }
}

// ==================================================================================================================//
exports.postAdminLogout = async (req,res)=>{
   try{
    req.session.destroy((err)=>{
        
     if(err){
      console.error("Session Logout Error",err)
      return res.redirect('/admin/errorPage')
     }
     else{
       return res.redirect('/')
      }
    })
  }
  catch(error){
    console.error("Error during Logout",error)
    res.redirect('/admin/errorPage')
   }

}


