const User=require('../../models/userSchema')
const bcrypt=require('bcrypt')


// =============================================UserProfile-GET=====================================================================//

exports. getUserProfile = async (req,res)=>{
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }

    const user = await User.findById(req.session.user.id)
    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
    return res.render('user-profile',{user})
  } catch (error) {
    console.log("Error loading User profile page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================UserChangePassword-GET=====================================================================//

exports.getChangePassword = async (req,res) => {
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }
    return res.render('user-changePassword')
  } catch (error) {
    console.log("Error loading User change password page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================UserChangePassword-POST=====================================================================//

exports.putChangePassword = async (req,res) =>{
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id

    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }
   
    const hashedPassword =  await bcrypt.hash(newPassword,10)

    user.password = hashedPassword
    await user.save()

    return res.status(200).json({ success:true,message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success:false,message: 'Internal Server Error' }); 
  }
}

// =============================================EditUserProfile-GET========================================================================//
exports.getEditUserProfile = async (req,res) => {
  try {
    if(!req.session.user){
      return res.redirect('/login')
    }
    const user = await User.findById(req.session.user.id)
    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
    return res.render('user-profile-edit',{user})
  } catch (error) {
    console.log("Error loading User edit profile page",error)
    return res.redirect('/pageNotFound')
  }
}

// =============================================EditUserProfile-POST========================================================================//
exports.putEditUserProfile = async (req,res) => {
  try {
    
    const{fullName,email,mobile} = req.body
    const userId = req.session.user.id

    const user = await User.findById(userId)
   

    if(!user){
      return res.status(404).json({success:false,message:"User not found."})
    }
  // Check if email is already in use
    const existingUser = await User.findOne({ email });
    
    if(existingUser && existingUser._id.toString() !== userId.toString()){
      return res.status(400).json({ success:false,message: 'Email is already in use' });  
    }

     // Update user profile
     user.name = fullName;
     user.email = email;
     user.phone = mobile;

     await user.save();
     return res.status(200).json({success:true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success:false,message: 'Internal Server Error' });
  }
}


// ============================================================================================================================//
