
const nodemailer=require('nodemailer')
const bcrypt=require('bcrypt')
const env =require('dotenv').config()
const User=require('../../models/userSchema')
const Otp = require('../../models/otpSchema')

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


// ===============================================Nodemailer for sending Otp===================================================================//

async function sendVerificationEmail(email,otp){
  try{
    console.log("Sending OTP to:", email);  
// Configuring nodemailer
    const transporter = nodemailer.createTransport({
      service:'gmail',   // Use your email service 
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

   return  info.accepted.length > 0 ? true : false; //This explicitly returns true if the email was accepted, otherwise false.


  }
  catch(error){
   console.error("Error sending email",error)
   return false
  }
}

// ===============================================UserSignup-POST===================================================================//

const postSignupPage=async(req,res)=>{
  try{
  
  const {name,phone,email,password,confirmPassword}= req.body
  
  if(password!==confirmPassword){
   return res.render('signup',{errorMessage:"Password do not match."})
  }

  
  const existingUser= await User.findOne({email})
  if(existingUser){
    return res.render('signup', { errorMessage: 'User with this email already exists.' });

  }
  
  // To generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP: ${otp}`); 



 const expiresAt = new Date(Date.now() + 60 * 1000) //OTP expires in 30 seconds

 
 const saveOtp = new Otp({
   otp:otp,
   userId:email,
   expiresAt:expiresAt
 })

  await saveOtp.save()      

  
  const emailSent = await sendVerificationEmail(email,otp);

  if (!emailSent) {
    return res.json({success:false,message:"Failed to send OTP.Please try again"})
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


const postverifyOtp = async (req,res)=>{
  try{
   const {otp} = req.body;
   const {email} = req.session.userData

  // Finding OTP in the database for the given email/userId
   const otpRecord = await Otp.findOne({userId:email, otp:otp})

   if(!otpRecord){
   
    return res.status(400).json({ success: false, message: "Invalid OTP, Please try again."})
   }

   if(otpRecord.expiresAt < new Date()){
    return res.status(400).json({ success: false, message: "OTP has expired.Please request a new one."})
   }

    //OTP is valid, now proceed to hash the password
    const user = req.session.userData
    const passwordHash = await bcrypt.hash(user.password,10)

    const saveUserData = new User({
      name:user.name,
      email:user.email,
      phone:user.phone,
      password:passwordHash  
    })

    await saveUserData.save()  
    
    delete req.session.userData     //Delete userData from session (no longer needed,after saving user)
  
    res.status(200).json({success:true,redirectUrl:"/login"})  
  
  }
  catch(error){
   console.error("Error verifying OTP",error)
   res.status(500).json({success:false,message:"An error occured"})
  }
}

// =============================================UserResendOTP-POST=====================================================================//
const postResendOtp = async (req,res)=>{
  try{
   const{email} = req.session.userData  
   console.log("Resending Otp to:",email) //debugging
  
   const existingOtp = await Otp.findOne({userId:email}) 

   
   if(existingOtp){
    await Otp.deleteOne({_id:existingOtp._id});
   }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();   // Generate new OTP
  console.log(`Generated OTP(resend): ${otp}`); // debugging

   // Set expiration time for the new OTP
   const expiresAt = new Date(Date.now() + 60 * 1000)  

   const newOtpSave = new Otp({
    otp:otp,
    userId:email,
    expiresAt:expiresAt
   })
  
   await newOtpSave.save()  // Save new OTP to the database



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

   
    const passwordMatch = await bcrypt.compare(password,findUser.password)

    if(!passwordMatch){
      return res.render('login',{errorMessage:" Incorrect Email or password"})
    }

    
    req.session.user={
      id: findUser._id,
      isBlocked:findUser.isBlocked  
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


// ================================================================================================================================//

module.exports={
   getpageNotFound,
   getSignupPage,
   postSignupPage,
   postverifyOtp,
   postResendOtp,
   getLoginPage,
   postLoginPage,
   postLogoutPage,
   googleLogin,
  }
