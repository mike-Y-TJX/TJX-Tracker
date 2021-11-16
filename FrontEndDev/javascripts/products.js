let url = "http://tjx-tracker.azurewebsites.net/api/products";

document.querySelector(".submit-button").addEventListener("click", function () {
	/*let product = newProductData();
	let newProduct = generateRows(product);
	document.getElementById("products-body").append(...newProduct);
	document.querySelector("table").hidden = false;*/

	let zone = document.createElement("div");
	zone.classList.add("box", "zone");
	zone.setAttribute("id", "newProduct");
	document.getElementById("newDiv").appendChild(zone);

	let img = document.createElement("img");
	img.src = "../Order Tracker logo.png";
	img.setAttribute("alt", "Product");
	document.getElementById("newProduct").appendChild(img);
})

axios.get(url).then(({data}) => {

	let productEntry = generateRows(data.products);
	document.getElementById("products-body").replaceChildren(...productEntry);
	document.querySelector("table").hidden = false;
});

function newProductData() {
	let newProduct = {
		productID: document.getElementById("validationCustom01").value,
		productName: document.getElementById("validationCustom02").value,
		skuNumber: document.getElementById("validationCustom03").value,
		productQuantity: document.getElementById("validationCustom04").value,
		productDescription: document.getElementById("exampleFormControlTextarea1").value
	}

	let productArray = [newProduct];
	return productArray;
}

function generateRows(products){

	let rows = products.map((product) => {
		let row = document.createElement('tr');
		row.insertAdjacentHTML('beforeend', `
		<td>${product.product_id}</td>
		<td>${product.product_SKU}</td>
		<td>${product.product_price}</td>
		<td>${product.product_name}</td>
		<td>${product.product_quantity}</td>
		<td>${product.product_description}</td>
		`
		);
		return row;

	});
	return rows;
}


function dropdownmenuSet(val){
	if(val.innerHTML!=""){
		$('#dropdownMenuButton1').val(val.innerHTML);
		$('#dropdownMenuButton1').html(val.innerHTML);
	} else {
		$('#dropdownMenuButton1').val('');
		$('#dropdownMenuButton1').html('Search using:');
	}
}

$("#collapseProduct").on("show.bs.collapse", function () {
	$("#collapseButton").html("Click here to hide form");
  });

$("#collapseProduct").on("hide.bs.collapse", function () {
	$("#collapseButton").html("Click here to add a new product");
  });
  