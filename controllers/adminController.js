

const getLoginPage = async (req,res)=>{
  try {
   
    return res.render('login')
  } catch (error) {
    console.error('Login page is not found',error)
    res.status(500).send("Internal server error")
  }
}


module.exports={getLoginPage}