let url = "http://localhost:3000/api/products";

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

	let productEntry = generateRows(data);
	/*document.getElementById("products-body").replaceChildren(...productEntry);
	document.querySelector("table").hidden = false;*/
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

	/*let rows = products.map((product) => {
		let row = document.createElement('tr');
		row.insertAdjacentHTML('beforeend', `
		<td>${product.product_id}</td>
		<td>${product.product_sku}</td>
		<td>${product.product_price}</td>
		<td>${product.product_name}</td>
		<td>${product.product_quantity}</td>
		<td>${product.product_description}</td>
		`
		);
		return row;

	});
	return rows;*/

	let picture = products.map((product) => {
		let zone = document.createElement("div");
		zone.classList.add("box", "zone");
		zone.setAttribute("id", `${product.product_id}`);
		document.getElementById("catalogue").appendChild(zone);
		let name = document.createElement("h5");
		name.innerHTML = `<strong>${product.product_name}</strong>`;
		let img = document.createElement("img");
		img.src = `${product.image_url}`;
		let learnMore = document.createElement("button");
		learnMore.classList.add("learnMore");
		learnMore.setAttribute("type", "button");
		learnMore.setAttribute("data-bs-toggle", 'modal');
		learnMore.setAttribute("data-bs-target", "#exampleModal");
		learnMore.setAttribute("id", `${product.product_sku}`);
		learnMore.textContent = "Learn More";
		document.getElementById(`${product.product_id}`).appendChild(img);
		document.getElementById(`${product.product_id}`).appendChild(name);
		document.getElementById(`${product.product_id}`).appendChild(learnMore);
		document.getElementById(`${product.product_sku}`).addEventListener("click", function() {
			document.getElementById("mod-title").innerHTML = `<strong>${product.product_name}</strong>`;
			document.getElementById('modal-bod').innerHTML = `<img src = ${product.image_url} width = "80%">`;
			let productDescription = document.createElement("p");
			let productPrice = document.createElement("p");
			let productSKU = document.createElement("h5");
			let productQ = document.createElement("p");

			if (product.product_quantity === 0){
				productQ.innerHTML = `<label> Item not in stock! </label>`;
			} else if (product.product_quantity === 1 ) {
				productQ.innerHTML = `<label> There is ${product.product_quantity} item left in stock! </label>`;
			} else {
				productQ.innerHTML = `<label> There are ${product.product_quantity} items left in stock! </label>`;
			}	
			
			productSKU.innerHTML = `SKU: ${product.product_sku}`;
			productPrice.innerHTML = `<strong> Price: $${product.product_price}`;
			productDescription.innerHTML = `<strong> Product Description: ${product.product_description}<strong>`;
			document.getElementById("modal-bod").appendChild(productSKU);
			document.getElementById("modal-bod").appendChild(productDescription);
			document.getElementById("modal-bod").appendChild(productPrice);
			document.getElementById("modal-bod").appendChild(productQ);
		});
	}); return picture;
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
  