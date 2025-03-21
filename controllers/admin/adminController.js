const Admin=require('../../models/userSchema')
const Order = require('../../models/orderSchema')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const bcrypt = require('bcrypt')



//===============================================AdminErrorPage-GET===================================================================//

exports.getAdminErrorPage=async(req,res)=>{
  try{
   return res.render('error-page.ejs')
  }
  catch(error){
   res.redirect('/admin/errorPage')
  }
}
// ===============================================AdminLogin--GET===================================================================//

 exports.getAdminLogin = async (req,res)=>{
  try {   
     return res.render('admin-login',{errorMessage:null})
    }
    
  catch (error) {
    console.error('Login page is not found',error)
    res.status(500).send("Internal server error")
  }
}


// ============================================== AdminLogin--POST==================================================================//
exports.postAdminLogin = async (req,res)=>{

try {
  const {email,password} = req.body
  const findAdmin =  await Admin.findOne({email,isAdmin:true})

  if(!findAdmin){
    return res.render('admin-login',{errorMessage:"You are not authorized to access this page"})
  }

  const passwordMatch = await bcrypt.compare(password,findAdmin.password)
  if(!passwordMatch){
     return res.render('admin-login',{errorMessage:"Invalid Email or Password"})
  }

  //store admin information in the session
  req.session.admin = {
    id: findAdmin._id,
    isAdmin:true
  }
   res.redirect('/admin//sales-report')
  }
  
  catch (error) {
  console.log("Login error",error)
  res.status(500).send("Internal server error")
  }

}

// =============================================AdminDashboard--GET=====================================================================//


exports.getSalesReport = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        let start, end;

        // Set date range based on filter type
        const now = new Date();
        if (filterType === 'daily') {
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
        } else if (filterType === 'weekly') {
            start = new Date(now.setDate(now.getDate() - 7));
            end = new Date();
        } else if (filterType === 'monthly') {
            start = new Date(now.setMonth(now.getMonth() - 1));
            end = new Date();
        } else if (filterType === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            start = new Date(0); // Default: all time
            end = new Date();
        }

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            paymentStatus: 'Paid' // Only include paid orders
        });

        const salesData = {
            orderCount: orders.length,
            totalAmount: orders.reduce((sum, order) => sum + order.finalAmount, 0),
            totalDiscount: orders.reduce((sum, order) => sum + (order.coupon.discountAmount || 0), 0)
        };

        res.render('dashboard', {
            salesData,
            filterType: filterType || 'all',
            startDate: startDate || '',
            endDate: endDate || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.downloadSalesReport = async (req, res) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        let start, end;

        // Same date logic as above
        const now = new Date();
        if (filterType === 'daily') {
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
        } else if (filterType === 'weekly') {
            start = new Date(now.setDate(now.getDate() - 7));
            end = new Date();
        } else if (filterType === 'monthly') {
            start = new Date(now.setMonth(now.getMonth() - 1));
            end = new Date();
        } else if (filterType === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            start = new Date(0);
            end = new Date();
        }

        const orders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            paymentStatus: 'Paid'
        });

        const salesData = {
            orderCount: orders.length,
            totalAmount: orders.reduce((sum, order) => sum + order.finalAmount, 0),
            totalDiscount: orders.reduce((sum, order) => sum + (order.coupon.discountAmount || 0), 0)
        };

        // Generate PDF
        const doc = new PDFDocument();
        res.setHeader('Content-disposition', 'attachment; filename=sales-report.pdf');
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date Range: ${start.toDateString()} - ${end.toDateString()}`);
        doc.moveDown();
        doc.text(`Total Orders: ${salesData.orderCount}`);
        doc.text(`Total Amount: ₹${salesData.totalAmount.toFixed(2)}`);
        doc.text(`Total Discounts: ₹${salesData.totalDiscount.toFixed(2)}`);
        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// ===============================================AdminLogout--POST===================================================================//
exports.postAdminLogout = async (req,res)=>{
   
   try{
    req.session.destroy((err)=>{
     if(err){
      console.error("Session Logout Error",err)
      return res.status(500).render('error-page.ejs', { errorMessage: "Failed to log out. Please try again." });
     }
     else{
     
       return res.redirect('/admin/login')
      }
    })
  }
  catch(error){
    console.error("Error during Logout",error)
    res.redirect('/admin/errorPage')
   }

}


