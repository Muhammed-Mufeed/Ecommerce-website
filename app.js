const express=require('express')
const app=express()
const env=require("dotenv").config()
const  mongoDB=require("./config/db")
 mongoDB()

app.listen(process.env.PORT,()=>{
  console.log(`app is listening at http://localhost:${process.env.PORT}`)
})




module.export=app