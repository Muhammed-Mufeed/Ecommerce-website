
const nodemailer=require('nodemailer')
const bcrypt=require('bcrypt')
const env =require('dotenv').config()
const User=require('../models/userSchema')
const Otp = require('../models/otpSchema')
const Category = require('../models/categorySchema')
// =======================================UserErrorPage-GET===========================================================================//
const getpageNotFound=async(req,res)=>{
  try{
   return res.render('page-404')
  }
  catch(error){
   res.redirect('/pageNotFound')
  }
}

// ==========================================UserSignup-GET=========================================================================//
const getSignupPage=async(req,res)=>{
  try{
    return res.render('signup',{errorMessage:null})
  }
  catch(error){
    console.log("signup page is not found",error)
    res.status(500).send("server error")
  }
}


// ===============================================UserSignup-POST===================================================================//

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


 //Calculate expiration time
 const expiresAt = new Date(Date.now() + 30 * 1000) //OTP expires in 30 seconds

 // Save OTP to MongoDB along with userId and expiration time
 const saveOtp = new Otp({
   otp:otp,
   userId:email,
   expiresAt:expiresAt
 })

  await saveOtp.save()      // Save OTP to the database

  //to send generated otp to user registered mail
  const emailSent = await sendVerificationEmail(email,otp);

  if (!emailSent) {
    return res.json('email-error');
  }
  
   req.session.userData = {name,phone,email,password}

   res.render('verify-otp')
   console.log("OTP send successfully",otp);
   
  }

  catch(error){
   console.error("Error during OTP verification",error)
   res.redirect('/pageNotFound')
  }
}

// ====================================================UserVerifyOTP-POST==============================================================//

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
   const {email} = req.session.userData

  // Finding OTP in the database for the given email/userId
   const otpRecord = await Otp.findOne({userId:email, otp:otp})

   if(!otpRecord){
    //OTP not found in the database,invalid OTP
    return res.status(400).json({ success: false, message: "Invalid OTP, Please try again."})
   }

   //Check if OTP has expired
   if(otpRecord.expiresAt < new Date()){
    return res.status(400).json({ succes: false, message: "OTP has expired.Please request a new one."})
   }
    //OTP is valid, now proceed to hash the password
    const user = req.session.userData
    const passwordHash = await securePassword(user.password);

    const saveUserData = new User({
      name:user.name,
      email:user.email,
      phone:user.phone,
      password:passwordHash  //saving as hashed password
    })

    await saveUserData.save()  // Save the user data to the database
    
    req.session.userOTP= null      // Clear OTP from session
    req.session.User = saveUserData._id;  // Store user ID in session
    
    // Respond with success
    res.json({success:true,redirectUrl:"/login"})  //If the process is successful, a response with { success: true, redirectUrl: "/" } is sent back, indicating the user is successfully registered and will be redirected to the home page ("/").
  
  }
  catch(error){
   console.error("Error verifying OTP",error)
   res.status(500).json({success:false,message:"An error occured"})
  }
}

// =============================================UserResendOTP-POST=====================================================================//
const postResendOtp = async (req,res)=>{
  try{
   const{email} = req.session.userData  // Get email from session data
   console.log("Resending Otp to:",email) //debugging
  
   // Check if the user already has an OTP stored (whether expired or not)
   const existingOtp = await Otp.findOne({userId:email}) 

   // If an OTP already exists, remove it (expired OTPs or previously used OTPs)
   if(existingOtp){
    await Otp.deleteOne({_id:existingOtp._id});
   }

    // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP(resend): ${otp}`); // Debugging

   // Set expiration time for the new OTP
   const expiresAt = new Date(Date.now() + 30 * 1000)  // OTP expires in 30 seconds
   
   //Save the new OTP to the database
   const newOtp = new Otp({
    otp:otp,
    userId:email,
    expiresAt:expiresAt
   })
  
   await newOtp.save()  // Save new OTP to the database



   // Send the OTP to the user's email
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

// =============================================UserLogin-GET=====================================================================//

const getLoginPage = async (req, res) => {
  try {
    const message = req.query.message || null;
    res.render('login',{errorMessage:message});
  } catch (error) {
    res.redirect('/pageNotFound');
  }
};


// ===============================================UserLogin-POST===================================================================//
const postLoginPage = async (req,res)=>{
  try{
    const{email,password}=req.body
  
    const findUser = await User.findOne({isAdmin:false,email:email})
  
    if(!findUser){
      return res.render('login',{errorMessage:"User is not found"})
    }

    if(findUser.isBlocked){
      return res.render("login",{errorMessage:"Your account has been blocked. Please contact support."})
    }

   //comparing password
    const passwordMatch = await bcrypt.compare(password,findUser.password)

    if(!passwordMatch){
      return res.render('login',{errorMessage:" Incorrect Email or password"})
    }

    //Now, store the user information in the session
    req.session.user={
      id: findUser._id,
      isBlocked:findUser.isBlocked  //to check user is blocked or not while in the session
    }
    
    res.redirect('/')
  }

  catch(error){
    console.error("Login error",error)
    res.render('login',{errorMessage:"Login failed.Please try again later"})
  }
}

// ===============================================GoogleLogin Callback Fn===================================================================//

const googleLogin = async(req,res) => {
  try{
    const user = await User.findById(req.user._id);      // req.user: The authenticated user object from Passport.  // here,~ Access the logged-in user’s Id
    req.session.user = {id:user._id};
    res.redirect('/');
  }
  catch(error){
   console.error("Erro during Google Login",error)
   res.status(500).send("Internal Server Error")
  }
  
}


// ==================================================UserLogout-POST================================================================//

const postLogoutPage = async (req,res)=>{
try {

  req.session.destroy((err)=>{

   if(err){
    console.log("Session Logout error",err.message);
    return res.redirect('/pageNotFound') 
   }

   else{
     res.redirect('/login')
   }
  }) 

} catch (error) {
  console.error("Error during Logout",error)
  res.redirect('/pageNotFound')
}

}

// ===============================================UserHome-GET===================================================================//

const getHomepage = async (req, res) => {
  try { 
    const user = req.session.user;
    const categories = await Category.find({isListed:true})

    if (user) {
      // If the user is logged in, fetch their data from the database
      const userData = await User.findOne({_id: user.id}); // we store the user_id from db to "id" variable in session. so that's why we use user.id.
      return res.render('home', { userData, error: null }); // Pass userData to EJS
    } 
    else {
      // If the user is not logged in, pass null or undefined for userData
      return res.render('home', { userData: null, error: null,categories });
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
   getSignupPage,
   postSignupPage,
   postverifyOtp,
   postResendOtp,
   getLoginPage,
   postLoginPage,
   postLogoutPage,
   googleLogin
  }