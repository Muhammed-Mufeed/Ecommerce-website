const nodemailer=require('nodemailer')
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
  const {email,password,confirmPassword}= req.body
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
  console.log(`Generated OTP: ${otp}`); // Log OTP to console

  //to send generated otp to user registered mail
  const emailSend = await sendVerificationEmail(email,otp);

  if (!emailSend) {
    return res.render('signup', { errorMessage: "Error sending verification email. Please try again." });
  }

   req.session.userOTP = otp
   req.session.userData = {email,password}

  //  res.render('verify-otp')
   console.log("OTP send successfully",otp);
   
  }

  catch(error){
   console.error("Error during OTP verification",error)
   res.redirect('/pageNotFound')
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


module.exports={getHomepage,getpageNotFound, getSingupPage,postSignupPage}