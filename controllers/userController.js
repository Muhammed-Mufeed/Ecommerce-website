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




const getHomepage= async (req,res)=>{
  try{
    res.render('home')
  }
  catch(error){
    console.log("Home page is not found")
    res.status(500).send("server error")
    
  }
}


module.exports={getHomepage,
  getpageNotFound

}