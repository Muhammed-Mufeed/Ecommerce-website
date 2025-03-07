const Order = require('../../models/orderSchema')


// ===============================================OrderListPage-GET===================================================================//


exports.getOrderListPage = async (req, res) => {
  try {
   
    const page = parseInt(req.query.page) || 1; 
    const limit = 5; 
    const search = req.query.search || ''; 

    // Search filter
    const searchFilter = {
      $or: [
        { orderId: { $regex: search, $options: 'i' } }, 
        { 'user.email': { $regex: search, $options: 'i' } }, 
      ],
    };

   
    const totalOrders = await Order.countDocuments(searchFilter);

    
    const totalPages = Math.ceil(totalOrders / limit);

    
    const orders = await Order.find(searchFilter)
      .populate('user', 'email')  //Populate user and email from Order 
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit) 
      .limit(limit); 

    
    res.render('orders', {
      orders,
      currentPage: page,
      totalPages,
      search,
    });
  } catch (error) {
    console.error('Error Listing orders:', error);
    return res.redirect('/admin/errorPage');
  }
};


// ===============================================OrderDetailPage-GET===================================================================//


exports.getOrderDetailspage = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Fetch the order and populate product details
    const order = await Order.findOne({ _id: orderId })
     

    if (!order) {
      return res.status(404).render('error', { message: 'Order not found.' });

    }
    
    
    return res.render('orderDetails', { order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.redirect('/admin/errorPage');
  }
};

// ===============================================UpdateOrderStatus-PATCH===================================================================//
exports.updateOrderStatus = async (req, res) => {
  try {
    const {orderId,itemId} = req.params
    const { status } = req.body;

    // Find the order
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const item = order.items.id(itemId)
    if (!item) {
      return res.status(404).json({ success: false, message: 'Order Item not found.' });
    }


       
    // Validate the status transition
    const isValidStatusChange = (currentStatus, newStatus) => {
      switch (currentStatus) {
          case "Pending":
              return newStatus === "Confirmed";
          case "Confirmed":
              return newStatus === "Shipped";
          case "Shipped":
              return newStatus === "Delivered";
          case "Delivered":
          case "Cancelled":
              return false; // No further updates allowed
          default:
              return false;
      }
    };

    if (!isValidStatusChange(item.status, status)) {     //here fn calling(statusfrom db, status from req.body)   //If the function returns false, it means the transition is not allowed, and we return a 400 Bad Request response.
      return res.status(400).json({ success: false, message: 'Invalid status transition.' });
     }

      // Update the item status
      item.status = status;
      await order.save();

   
      return res.status(200).json({ success: true, message: `Item status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating item status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update orderitem status.' });
  }
};