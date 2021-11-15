

function dropdownmenuSet(val){
	if(val.innerHTML!=""){
		$('#dropdownMenuButton1').val(val.innerHTML);
		$('#dropdownMenuButton1').html(val.innerHTML);
	} else {
		$('#dropdownMenuButton1').val('');
		$('#dropdownMenuButton1').html('Search using:');
	}
}