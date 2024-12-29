const nodemailer=require('nodemailer')
const bcrypt=require('bcrypt')
const env =require('dotenv').config()
const User=require('../models/userSchema')


const getpageNotFound=async(req,res)=>{
  try{
   return res.render('page-404')
  }
  catch(error){
   res.redirect('/pageNotFound')
  }
}

const getSingupPage=async(req,res)=>{
  try{
    res.render('signup')
  }
  catch(error){
    console.log("signup pae is not found",error)
    res.status(500).send("server error")
  }
}




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

   res.render('verify-otp')
   console.log("OTP send successfully",otp);
   
  }

  catch(error){
   console.error("Error during OTP verification",error)
   res.redirect('/pageNotFound')
  }
}


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




const getHomepage= async (req,res)=>{
  try{
    res.render('home')
  }
  catch(error){
    console.log("Home page is not found",error)
    res.status(500).send("server error")
    
  }
}


module.exports={getHomepage,getpageNotFound, getSingupPage,postSignupPage,postverifyOtp,}