/**
 * This function takes a json object containing information about a customer and trasforms it into HTML rows
 * @param  customers  , a json object containing information about customers
 * @returns returns HTML rows for the customers Table 
 */
function generateRows(customers) {
    let rows = customers.map((customer) => {
      let row = document.createElement('tr');
      row.insertAdjacentHTML(
        'beforeend',
        `
      <td>${customer.customer_id}</td>
      <td>${customer.first_name}</td>
      <td></td>
      <td>${customer.last_name}</td>
      <td>${customer.phone}</td>
      <td>${customer.email}</td>
      <td>${customer.customer_notes}</td>
      <td>${customer.address}</td>
      `
      );
      return row;
    });
    return rows;
  }

function getNewCustomerData() {
    let customer = {
        customer_id:0,
        first_name:$("#firstName").val(),
        last_name:$("#lastName").val(),
        phone:$("#phone").val(),
        email:$("#email").val(),
        customer_notes:$("#notes").val(),
        address:$("#adress").val()
    }
    
    let arrayCustomer = [customer];
    return arrayCustomer;
    
}

  // Using axios make a call to the API and get the customers information and render it in the table 
  // NOTE: after first deployement of the backEnd server URI can be changed to the public one 
  axios.get("http://localhost:3000/api/customers").then(({data}) => {
   let customerRows = generateRows(data.customers);
   console.log(data.customers);
   document.getElementById("tableBody").replaceChildren(...customerRows);
});

$("#addButton").on("click" , () => {
    let customer = getNewCustomerData();
    console.log(customer);
    let customerRow = generateRows(customer);
    document.getElementById("tableBody").append(...customerRow);
})