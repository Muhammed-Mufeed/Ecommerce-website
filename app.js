const express=require('express')
const app=express()
const env=require("dotenv").config()
const  mongoDB=require("./config/db")
 mongoDB()
const path=require('path')
const userRoutes=require('./routes/userRoutes')


app.set('view engine','ejs')
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])



app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))


app.use('/',userRoutes)



app.listen(process.env.PORT,()=>{
  console.log(`app is listening at http://localhost:${process.env.PORT}`)
})




module.export=app