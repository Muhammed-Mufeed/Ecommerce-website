
const nodemailer=require('nodemailer')
const bcrypt=require('bcrypt')
const env =require('dotenv').config()
const User=require('../models/userSchema')

// ==================================================================================================================//
const getpageNotFound=async(req,res)=>{
  try{
   return res.render('page-404')
  }
  catch(error){
   res.redirect('/pageNotFound')
  }
}

// ==================================================================================================================//
const getSingupPage=async(req,res)=>{
  try{
    res.render('signup',{errorMessage:null})
  }
  catch(error){
    console.log("signup page is not found",error)
    res.status(500).send("server error")
  }
}


// ==================================================================================================================//

async function sendVerificationEmail(email,otp){
  try{
    console.log("Sending OTP to:", email);  // Log email to check
// Configure nodemailer
    const transporter = nodemailer.createTransport({
      service:'gmail',   // Use your email service (e.g., Gmail, Outlook, etc.)
      port:587,
      secure:false,
      auth:{
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    })

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to:email,    //user email
      subject: "verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`
    })

   return  info.accepted.length > 0 ? true : false; //This explicitly returns true if the email was accepted, otherwise false


  }
  catch(error){
   console.error("Error sending email",error)
   return false
  }
}




const postSignupPage=async(req,res)=>{
  try{
  
  //check if password mathch:
  const {name,phone,email,password,confirmPassword}= req.body
  
  if(password!==confirmPassword){
   return res.render('signup',{errorMessage:"Password do not match."})
  }

  //check if user already exists:
  const existingUser= await User.findOne({email})
  if(existingUser){
    return res.render('signup', { errorMessage: 'User with this email already exists.' });

  }
  
  // To generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP: ${otp}`); // Log OTP to console for debugging

  //to send generated otp to user registered mail
  const emailSent = await sendVerificationEmail(email,otp);

  if (!emailSent) {
    return res.json('email-error');
  }
  
   req.session.userOTP = otp
   req.session.userData = {name,phone,email,password}

   res.render('verify-otp',{errorMessage:null})
   console.log("OTP send successfully",otp);
   
  }

  catch(error){
   console.error("Error during OTP verification",error)
   res.redirect('/pageNotFound')
  }
}

// ==================================================================================================================//

//hashing password using bcrypt
const securePassword=async (password)=>{
 try {
  const passwordHash = await bcrypt.hash(password,10)
  return passwordHash
 }
 catch (error){
  console.log("Error password Hashing",error);
  
 }
}


const postverifyOtp = async (req,res)=>{
  try{
   const {otp} = req.body;

   if(otp===req.session.userOTP){
    const user = req.session.userData
    const passwordHash = await securePassword(user.password);

    const saveUserData = new User({
      name:user.name,
      email:user.email,
      phone:user.phone,
      password:passwordHash
    })

    await saveUserData.save()  // Save the user data to the database
    req.session.User = saveUserData._id; // Store user ID in session
    res.json({success:true,redirectUrl:"/"})  //If the process is successful, a response with { success: true, redirectUrl: "/" } is sent back, indicating the user is successfully registered and will be redirected to the home page ("/").
   }
   else{
    res.status(400).json({success:false,message:"Invalid OTP, Please try again"})
   }
  }
  catch(error){
   console.error("Error verifying OTP",error)
   res.status(500).json({success:false,message:"An error occured"})
  }
}

// ==================================================================================================================//
const postResendOtp = async (req,res)=>{
  try{
    
    // Ensure session data exists
    const { userData } = req.session;
    if (!userData || !userData.email) {
      return res.status(400).json({ success: false, message: "Email not found in session" });
    }
  
   const{email} = userData
   console.log("Resending Otp to:",email) //debugging
 
  
   // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
   req.session.userOTP = otp;     //Update session with new OTP
   console.log(`Generated OTP(resend): ${otp}`); // Debugging


     // Send the OTP via email
   const emailSent = await sendVerificationEmail(email,otp);
   if(emailSent){
    console.log(`OTP sent(resend) successfully ${otp}`); //debugging
    return res.status(200).json({success:true,message:"OTP Resend Successfully"})
    
   }
   else{
    res.status(500).json({success:false,message:"Failed to resend OTP. Please try again"})
  
    }
  }
  catch(error){
    console.error("Error resending OTP",error)
    res.status(500).json({success:false,message:"Internal Server Error.Please try again"})
  }
}

// ==================================================================================================================//

const getLoginPage = async (req,res)=>{
  try  {
    if(!req.session.user)
    {
      return res.render('login',{errorMessage:null})
    }
    else{
      res.redirect('/')
    }
    
  }
  catch (error) {
    res.redirect('/pageNotFound')
  }
}

// ==================================================================================================================//
const postLoginPage = async (req,res)=>{
  try{
    const{email,password}=req.body
  
    const findUser = await User.findOne({isAdmin:false,email:email})
  
    if(!findUser){
      return res.render('login',{errorMessage:"User is not found"})
    }

    if(findUser.isBlocked){
      return res.render("login",{errorMessage:"User is blocked by the Admin"})
    }

   //comparing password
    const passwordMatch = await bcrypt.compare(password,findUser.password)

    if(!passwordMatch){
      return res.render('login',{errorMessage:" Incorrect password"})
    }

    //Now, store the user information in the session
    req.session.user={
      id: findUser._id
    }
    
    res.redirect('/')
  }

  catch(error){
    console.error("Login error",error)
    res.render('login',{errorMessage:"Login failed.Please try again later"})
  }
}


// ==================================================================================================================//

const postLogoutPage = async (req,res)=>{
try {

  req.session.destroy((err)=>{

   if(err){
    console.log("Session Logout error",err.message);
    return res.redirect('/pageNotFound') 
   }

   else{
   return  res.redirect('/login')
   }
  }) 

} catch (error) {
  console.error("Error during Logout",error)
  res.redirect('/pageNotFound')
}

}

// ==================================================================================================================//

const getHomepage = async (req, res) => {
  try {
    const user = req.session.user; 

    if (user) {
      // If the user is logged in, fetch their data from the database
      const userData = await User.findOne({_id: user.id}); // we store the user_id from db to "id" variable in session. so that's why we use user.id.
      return res.render('home', { userData, error: null }); // Pass userData to EJS
    } 
    else {
      // If the user is not logged in, pass null or undefined for userData
      return res.render('home', { userData: null, error: null });
    }
  } catch (error) {
    console.log("Error in getHomepage:", error);
    res.status(500).send("Server Error");
  }
};


// ==================================================================================================================//












// ==================================================================================================================//

module.exports={
   getHomepage,
   getpageNotFound,
   getSingupPage,
   postSignupPage,
   postverifyOtp,
   postResendOtp,
   getLoginPage,
   postLoginPage,
   postLogoutPage
  }