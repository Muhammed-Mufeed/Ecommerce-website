const Coupon = require('../../models/couponSchema')

// ===============================================Coupons - GET===================================================================//
exports.getCoupons = async (req,res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const search = req.query.search || ""

    const searchFilter = {
      couponCode :{$regex: search, $options: "i"}
    }

    const totalCoupons = await Coupon.countDocuments(searchFilter)

    const totalPages = Math.ceil(totalCoupons / limit)

    const coupons = await Coupon.find(searchFilter)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({createdAt:1})

    return res.render('coupons',{coupons,currentPage:page,totalPages,search})
  } catch (error) {
    console.error("Error during loading coupons page:", error);
    res.redirect("/admin/errorPage");
  }
}


// ===============================================Add Coupons - GET===================================================================//

exports.getAddCoupon =  async (req,res) => {
  try {
    return res.render('add-coupons')
  } catch (error) {
   console.log("Error while loading Add Coupons page",error)
   return res.redirect('/admin/errorPage')
  }
}

// ===============================================Add Coupons - POST===================================================================//

exports.postAddCoupon = async (req, res) => {
  try {
    const { couponCode, minPurchaseAmount,discountAmount, validFrom, validTo, usageLimit } = req.body;

    // Validate date range
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    if (validToDate < validFromDate) {
      return res.status(400).json({ success: false, message: "Valid to date cannot be before valid from date" });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      couponCode: couponCode.toUpperCase(), // Store in uppercase
      minPurchaseAmount,
      discountAmount,
      validFrom: validFromDate,
      validTo: validToDate,
      usageLimit,
    });

    await newCoupon.save();

    return res.status(200).json({ success: true, message: "Coupon added successfully" });
  } catch (error) {
    console.error("Error during adding coupon:", error);
    return res.status(500).json({ success: false, message: "Failed to add coupon" });
  }
};

// ===============================================Edit-Coupons -GET===================================================================//


exports.getEditCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({success:false,message:"Coupon not Found."});
    }

    return res.render("edit-coupons", { coupon });
  } catch (error) {
    console.error("Error during loading edit coupon page:", error);
    return res.redirect("/admin/errorPage");
  }
};
// ===============================================Edit-Coupons -POST===================================================================//
exports.putEditCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const { couponCode, minPurchaseAmount,discountAmount, validFrom, validTo, usageLimit } = req.body;

    // Validate date range
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    if (validToDate < validFromDate) {
      return res.status(400).json({ success: false, message: "Valid to date cannot be before valid from date" });
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        couponCode: couponCode.toUpperCase(),
        minPurchaseAmount,
        validFrom: validFromDate,
        validTo: validToDate,
        discountAmount,
        usageLimit,
      },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Coupon updated successfully",updatedCoupon });
  } catch (error) {
    console.error("Error during updating coupon:", error);
    return res.status(500).json({ success: false, message: "Failed to update coupon" });
  }
};

// ===============================================UpdateCouponStatus-PATCH===================================================================//
exports.patchUpdateCouponStatus = async (req,res) => {
  try {
    const couponId = req.params.id

    const coupon = await Coupon.findById(couponId)
    if(!coupon){
      return res.status(404).json({success:false,message:"Coupon is not found"})
    }

    coupon.isActive = !coupon.isActive
    await coupon.save();

    const message = offer.isActive ? "Coupon activated Successfully" : "Coupon deactivated successfully"
    
    return res.status(200).json({success: true,isActive: coupon.isActive, message});
  }
  catch (error) {
    console.error('Error updating offer status:', error);
    return res.status(500).json({success: false,message: 'Failed to update coupon status'});
  } 
}

