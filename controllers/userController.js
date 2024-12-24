const User=require('../models/userSchema')


const express= require('express')
const app=express()
const router=express.Router()


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

const postSignupPage=async(req,res)=>{
  try{

  const {name,email,phone,password}=req.body//for simply testing it is posting or not..
   const newUser= new User({name,email,phone,password}) //This creates a new instance of the User model (from Mongoose).
   console.log(newUser); 
   await newUser.save()        //Saves the new user to the MongoDB database
   return res.redirect('/signup') //for simply given for now
  
  }

  catch(error){
   console.log("Error for save User",error)
   res.status(500).send("Internal server error")
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