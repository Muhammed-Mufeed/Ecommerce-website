const User = require('../models/userSchema')


// ===============================================CustomerManagement-GET===================================================================//
exports.getuserManagement = async (req,res)=>{
try {
    // Get page and search parameters
   const page = parseInt(req.query.page) || 1;
   const limit = 5;
   const search = req.query.search || '';

   //create search Filter
   const searchFilter ={ 
    $or:[
      {name: {$regex: search, $options: 'i'}}, // Search in 'name' field
      {email: {$regex: search, $options: 'i'}}// Search in 'email' field
     ] 
   }
   
     // Count total documents of users that match the filter for pagination
    const totalUsers = await User.countDocuments({isAdmin:false,...searchFilter})                                //...searchFilter: This adds the key-value pairs from the searchFilter object (which contains the search conditions) into the same query object


    const totalPages = Math.ceil(totalUsers / limit)  // Calculate total pages
  
      // Fetch users based on pagination and search filter
    const users = await User.find({isAdmin:false,...searchFilter})
     .skip( (page - 1)* limit) // Skips a specific number of documents based on the current page
     .limit(limit)             // Limits the number of documents retrieved to the limit (5 customers per page
     .sort({createdAt : 1})   // Newest last

  // Render the page and pass users, pagination info, and search keyword
  res.render('customers',{users,currentPage:page,totalPages,search})

   
} catch (error) {
   console.error("Error during loading customer page",error)
   res.status(500).send("Internal Server Error")
}
}

// ===============================================UpdateUserStatus-PATCH===================================================================//


exports.patchUpdateUserStatus = async (req,res)=>{
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if(!user){
      res.status(404).json({success:false,message:"User not found"})
    }

    user.isBlocked =  !user.isBlocked   // The admin can click a button to either block or unblock a user, and this code handles that logic.
                                           //If user.isBlocked is true, !user.isBlocked will evaluate to false.
                                           //If user.isBlocked is false, !user.isBlocked will evaluate to true

    await user.save() 

     // To return success response with a message
     const message = user.isBlocked  ? 'The user has been blocked successfully.' : 'The user has been unblocked successfully.';

    res.status(200).json({success:true,isBlocked:user.isBlocked,message})   // Current blocked status after toggling
  } 

  catch (error) {
    res.status(500).json({success:false,message:"Internal server Error"}) 
  }
}
