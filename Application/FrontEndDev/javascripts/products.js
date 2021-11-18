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

/*document.querySelector("#search-button").addEventListener('click', async(evt) => {
	//evt.preventDefault();
	let search_cat = document.querySelector("#dropdownMenuButton1").value;
	let search_attr = document.querySelector("#productSearch").value;
	
	if (search_cat === "Product ID") {
		const {data:search} = await axios.get(url + `?product_id_like=${search_attr}`);
		if (search) {
			
		} else {
			window.alert("Product not in directory!");
		}
	} else if (search_cat === "SKU Number") {
		const {data:search} = await axios.get(url + `?product_sku_like=${search_attr}`);
		if (search) {
			
		} else {
			window.alert("Product not in directory!");
		}
	} else if (search_cat === "Product Name") {
		const {data:search} = await axios.get(url + `?product_name_like=${search_attr}`);
		if (search) {
			
		} else {
			window.alert("Product not in directory!");
		}
	}
		
	})*/

axios.get(url).then(({data}) => {

	let productEntry = generateProducts(data);
	return productEntry;
});

function newProductData() {
	let newProduct = {
		productID: document.getElementById("validationID").value,
		productSKU: document.getElementById("validationSKU").value,
		productPrice: document.getElementById("validationPrice").value,
		productName: document.getElementById("validationName").value,
		productQuantity: document.getElementById("validationQuantity").value,
		productDescription: document.getElementById("validationDescription").value,
		productImage: document.getElementById("validationImage").value,
	}

	let productArray = [newProduct];
	return productArray;
}

function generateProducts(products){

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
		learnMore.setAttribute("data-bs-target", "#productModal");
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
			let amount = document.createElement("input");
			amount.setAttribute("type","number");
			amount.setAttribute("min", "0");
			amount.setAttribute("id", "pAmount");
			let chooseQuantity = document.createElement("span");
			chooseQuantity.setAttribute("id", "productDetails");
			chooseQuantity.setAttribute("style", "white-space:nowrap");
			let qLabel = document.createElement("label");
			qLabel.textContent = "Quantity:";

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
			document.getElementById("modal-bod").appendChild(chooseQuantity);
			document.getElementById("productDetails").appendChild(qLabel);
			document.getElementById("productDetails").appendChild(amount);


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
  