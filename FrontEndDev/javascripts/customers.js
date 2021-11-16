let customerId = undefined;

function dropdownmenuSet(val) {
  if (val.innerHTML != "") {
    $("#dropdownMenuButton1").val(val.innerHTML);
    $("#dropdownMenuButton1").html(val.innerHTML);
  } else {
    $("#dropdownMenuButton1").val("");
    $("#dropdownMenuButton1").html("Search using:");
  }
}

/**
 * This function takes a json object containing information about a customer and trasforms it into HTML rows
 * @param  customers  , a json object containing information about customers
 * @returns returns HTML rows for the customers Table
 */
function generateRows(customers) {
  let rows = customers.map((customer) => {
    let row = document.createElement("tr");
    row.insertAdjacentHTML(
      "beforeend",
      `
      <td>${customer.customer_id}</td>
      <td>${customer.first_name}</td>
      <td></td>
      <td>${customer.last_name}</td>
      <td>${customer.phone}</td>
      <td>${customer.email}</td>
      <td class="ellipsis">${customer.customer_notes}</td>
      <td>${customer.address}</td>
      `
    );
    return row;
  });
  return rows;
}

/**
 * 
 * @param {*} id if the data of an existing customer is modified and id can be supliied
 * @returns an array with the customer data 
 */
function getNewCustomerData(id) {
  // If no Id was supplied then we now that a new user is created
  // If Id is supllied an existing user is modified
  if (id === undefined) id = 0;

  let customer = {
    customer_id: id,
    first_name: $("#validationCustom01").val(),
    last_name: $("#validationCustom03").val(),
    phone: $("#validationCustom04").val(),
    email: $("#validationCustom05").val(),
    customer_notes: $("#FormControlTextarea1").val(),
    address: $("#validationCustom06").val(),
  };

  let arrayCustomer = [customer];
  return arrayCustomer;
}

// Using axios make a call to the API and get the customers information and render it in the table
// NOTE: after first deployement of the backEnd server URI can be changed to the public one
axios
  .get("http://tjx-tracker.azurewebsites.net/api/customers")
  .then(({ data }) => {
    let customerRows = generateRows(data.customers);
    console.log(data.customers);
    document.getElementById("tableBody").replaceChildren(...customerRows);
  });

$("#addButton").on("click", () => {
  if ($(".needs-validation")[0].checkValidity()) {
    $(".needs-validation").submit((e) => {
      e.preventDefault();
    });
    let customer = getNewCustomerData(customerId);
    console.log(customer);
    let customerRow = generateRows(customer);
    document.getElementById("tableBody").append(...customerRow);
  }
});
// Reset all fields when the reset button is clicked 
$("#resetButton").on("click", () => {
  $("#validationCustom01").val("");
  $("#validationCustom02").val("");
  $("#validationCustom03").val("");
  $("#validationCustom04").val("");
  $("#validationCustom05").val("");
  $("#validationCustom06").val("");
  $("#FormControlTextarea1").val("");
  customerId = undefined;
});

// When a row on the customer table is clicked get the id and populate the fields
$("#tableBody").on("click", function (e) {
  console.log("Clicked");
  // Show the fields when an item on the table is cliked
  $("#collapseCustomer").collapse();
  // Get the row that was clicked and place the information from the table in the fields
  $(e.target)
    .closest("tr")
    .children()
    .each((index, element) => {
      console.log(index + "" + element.innerHTML);
      if (index === 0) {
        customerId = element.innerHTML;
      } else if (index === 6) {
        $("#FormControlTextarea1").val(element.innerHTML);
      } else if (index === 7) {
        $("#validationCustom06").val(element.innerHTML);
      } else {
        let htmlId = "#validationCustom0" + String(index);
        $(htmlId).val(element.innerHTML);
      }
    });
});

// When the collapse is shown change the name of the button
$("#collapseCustomer").on("show.bs.collapse", function () {
  $("#colapseButton").html("Click here to hide form");
});

// When the collapse is hidden change the name of the button to the default one
$("#collapseCustomer").on("hide.bs.collapse", function () {
  $("#colapseButton").html("Click here to add a new customer");
});
