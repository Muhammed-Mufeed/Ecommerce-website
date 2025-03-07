
// Function to add product to cart
async function addToCart(productId,variantId){
  try{
       const response = await fetch('/add-to-cart',{
           method:'POST',
           headers: {
           'Content-Type' : 'application/json'
           },
           body:JSON.stringify({productId,variantId}),

       });

        // Check if the response status is 401 (Unauthorized),(Not Logged in users)
        if(response.status === 401){
           window.location.href = "/login"
           return
        }

       const data = await response.json()

       if(data.success){
           Swal.fire({
               icon:'success',
               title:'Success',
               text: data.message || "Item added to the Cart",
               confirmButtonText: "OK"
           })
       }
       else{
           Swal.fire({
               icon:'error',
               title:'Error',
               text:data.message || "Failed to add Item to the Cart",
               confirmButtonText:"OK"
           })
       }
   }
   catch(error){
    console.log("Error during Add to cart",error)
    Swal.fire({
       icon: 'error',
       title: 'Error',
       text: 'An error occurred while adding in to the Cart',
       confirmButtonText: 'OK'
     });
   }
}       