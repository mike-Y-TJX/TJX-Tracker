let customerId = undefined;
let url = "http://tjx-tracker.azurewebsites.net/api/customers"
// Using axios make a call to the API and get the customers information and render it in the table
// NOTE: after first deployement of the backEnd server URI can be changed to the public one
axios.get(url).then(({ data }) => {
  let customerRows = generateRows(data);
  console.log(data);
  document.getElementById("tableBody").replaceChildren(...customerRows);
});

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
    let adress =
      customer.street +
      ";" +
      customer.city +
      ";" +
      customer.zip_code +
      ";" +
      customer.country;
    let row = document.createElement("tr");
    row.insertAdjacentHTML(
      "beforeend",
      `
      <td>${customer.customer_id}</td>
      <td>${customer.first_name}</td>
      <td>${customer.middle_name}</td>
      <td>${customer.last_name}</td>
      <td class="prefix">${customer.phone_country_code}</td>
      <td>${customer.phone}</td>
      <td>${customer.email}</td>
      <td class="ellipsis">${customer.customer_notes}</td>
      <td class="ellipsis">${adress}</td>
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
    middle_name: $("#validationCustom02").val(),
    last_name: $("#validationCustom03").val(),
    phone_country_code: Number($("#validationCustom04").val()),
    phone:Number($("#validationCustom05").val()),
    email: $("#validationCustom06").val(),
    customer_notes: $("#FormControlTextarea1").val(),
    street: $("#validationCustom07").val(),
    city: $("#validationCustom08").val(),
    zip_code: $("#validationCustom09").val(),
    country: $("#validationCustom10").val(),
  };

  
  return customer;
}

$("#addButton").on("click", () => {
  if ($(".needs-validation")[0].checkValidity()) {
    let customer = getNewCustomerData(customerId);
    if (customer.customer_id === 0){
      delete customer.customer_id;
      console.log(customer);
      axios.post(url,customer).then((res) => {
        console.log(res);
      },(err) => {
        console.log(err);
      });
    }
    else{
      let newUrl = url + "/" + customer.customer_id;
      console.log(newUrl);
      axios.put(newUrl,customer).then((res) => {
        console.log(res);
      },(err) => {
        console.log(err);
      });
    }
  }
});


// When a row on the customer table is clicked get the id and populate the fields
$("#tableBody").on("click", function (e) {
  console.log("Clicked");
  // Show the fields when an item on the table is cliked
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $("#collapseCustomer").collapse("show");
  // Get the row that was clicked and place the information from the table in the fields
  $(e.target)
    .closest("tr")
    .children()
    .each((index, element) => {
      // Populate all fields with the current information 
      if (index === 0) {
        customerId = element.innerHTML;
      } else if (index === 7) {
        $("#FormControlTextarea1").val(element.innerHTML);
      } else if (index === 8) {
        let adress = element.innerHTML;
        index -= 1;
        while (adress.indexOf(";") !== -1) {
          let val = adress.substring(0, adress.indexOf(";"));
          adress = adress.substring(adress.indexOf(";") + 1, adress.length + 1);

          if (index === 9) {
            let htmlId = "#validationCustom0" + String(index);
            $(htmlId).val(val);
            $("#validationCustom10").val(adress);
          } else {
            let htmlId = "#validationCustom0" + String(index);
            $(htmlId).val(val);
          }
          index += 1;
        }
      } else {
        let htmlId = "#validationCustom0" + String(index);
        $(htmlId).val(element.innerHTML);
      }
    });
});

$("#search-button").on("click" , () => {
  let searchOption = $("#dropdownMenuButton1").val();
  if (searchOption) {
    switch (searchOption){
      case "First Name":
        searchOption = "first_name";
        break;
      case "Last Name":
        searchOption = "last_name";
        break;
      case "Phone":
        searchOption = "phone";
        break;
      case "Email":
        searchOption = "email";
        break;
    }
    console.log(searchOption);
    let searchTerm = $("#searchInput").val();
    if (searchTerm){
      let goodElements = [];
      if (searchOption !== "phone"){
        searchTerm = searchTerm.toLowerCase();
      }
      axios.get(url).then(({ data }) => {
      data.forEach(element => {
        if (searchOption !== "phone"){
          if (element[searchOption].toLowerCase().indexOf(searchTerm) !== -1){
            goodElements.push(element);
          }}
        else {
          if (element[searchOption].toString().indexOf(searchTerm) !== -1){
            goodElements.push(element);
          }
        }
      });  
      let customerRows = generateRows(goodElements);
      console.log(goodElements);
      document.getElementById("tableBody").replaceChildren(...customerRows);
});
    }
  }
});

// When the collapse is shown change the name of the button
$("#collapseCustomer").on("show.bs.collapse", function () {
  $("#colapseButton").html("Click here to hide form");
});


// When the collapse is hidden change the name of the button to the default one
$("#collapseCustomer").on("hide.bs.collapse", function () {
  $("#colapseButton").html("Click here to add a new customer");
});

// Reset all fields when the reset button is clicked
$("#resetButton").on("click", () => {
  $("#validationCustom01").val("");
  $("#validationCustom02").val("");
  $("#validationCustom03").val("");
  $("#validationCustom04").val("");
  $("#validationCustom05").val("");
  $("#validationCustom06").val("");
  $("#validationCustom07").val("");
  $("#validationCustom08").val("");
  $("#validationCustom09").val("");
  $("#validationCustom10").val("");
  $("#FormControlTextarea1").val("");
  customerId = undefined;
});
