const express=require('express')
const session = require('express-session')
const path=require('path')
const env=require("dotenv").config()
const  mongoDB=require("./config/db")
 mongoDB()

const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')

const app=express()

app.set('view engine','ejs')
app.set('views',[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')])


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
 secret: process.env.SESSION_SECRET,
 resave: false,
 saveUninitialized: true,
 cookie: {
  secure:false,
  httpOnly:true,
  maxAge:72*60*60*1000     //(72 hrs)
 }
}))
app.use(express.static(path.join(__dirname,'public')))


app.use('/admin',adminRoutes)
app.use('/',userRoutes)




app.listen(process.env.PORT,()=>{
  console.log(`app is listening at http://localhost:${process.env.PORT}`)
})

module.export=app