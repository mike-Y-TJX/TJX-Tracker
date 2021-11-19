
module.exports = (results) => {
    let orderData = []
    let processedOrders = {}
    
    results.forEach(order => {
        if (!processedOrders[order.order_id]){
            processedOrders[order.order_id] = [order.detail_id];
            orderData.push({
                order_id: order.order_id,
                total_order_price: order.total_order_price,
                order_notes: order.order_notes,
                datetime_order_placed: order.datetime_order_placed,
                status_desc: order.status_desc,
                status_id: order.status_id,
                customer_detail: {
                    customer_id:order.customer_id, 
                    first_name: order.first_name,
                    middle_name: order.middle_name,
                    last_name: order.last_name,
                    phone_country_code: order.phone_country_code,
                    phone: order.phone,
                    email: order.email,
                    customer_notes: order.customer_notes,
                    street: order.street,
                    city: order.city,
                    zip_code: order.zip_code,
                    country: order.country,
                },
                order_detail:[
                    {
                        detail_id: order.detail_id,
                        quantity_purchased: order.quantity_purchased,
                        product_id: order.product_id, 
                        product_sku: order.product_sku, 
                        product_price: order.product_price, 
                        product_name: order.product_name, 
                        product_quantity: order.product_quantity, 
                        product_description: order.product_description, 
                        image_url: order.image_url,
                    }
                ]
    
            })
        } else {
            let orderIndex = orderData.findIndex((orders) => {
                return orders.order_id === order.order_id
            })
            orderData[orderIndex].order_detail.push(
                {
                    detail_id: order.detail_id,
                    quantity_purchased: order.quantity_purchased,
                    product_id: order.product_id, 
                    product_sku: order.product_sku, 
                    product_price: order.product_price, 
                    product_name: order.product_name, 
                    product_quantity: order.product_quantity, 
                    product_description: order.product_description, 
                    image_url: order.image_url,
                }
            )
        }
    });
    return orderData
}
