
function dropdownmenuSet(val){
	if(val.innerHTML!=""){
		$('#dropdownMenuButton1').val(val.innerHTML);
		$('#dropdownMenuButton1').html(val.innerHTML);
	} else {
		$('#dropdownMenuButton1').val('');
		$('#dropdownMenuButton1').html('Search using:');
	}
}



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
        first_name:$("#validationCustom01").val(),
        last_name:$("#validationCustom03").val(),
        phone:$("#validationCustom04").val(),
        email:$("#validationCustom05").val(),
        customer_notes:$("#FormControlTextarea1").val(),
        address:$("#validationCustom06").val()
    }
    
    let arrayCustomer = [customer];
    return arrayCustomer;
    
}


  // Using axios make a call to the API and get the customers information and render it in the table 
  // NOTE: after first deployement of the backEnd server URI can be changed to the public one 
  axios.get("http://tjx-tracker.azurewebsites.net/api/customers" ).then(({data}) => {
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
$("#resetButton").on("click" , () => {
  $("#validationCustom01").val("");
  $("#validationCustom02").val("");
  $("#validationCustom03").val("");
  $("#validationCustom04").val("");
  $("#validationCustom05").val("");
  $("#validationCustom06").val("");
  $("#FormControlTextarea1").val("");
})

// When a row on the customer table is clicked get the id and populate the fields 
$("#tableBody").on("click" , function(e) {
  console.log("Clicked");
  let id = $(e.target).closest('tr').children().html();
  console.log(id);

})