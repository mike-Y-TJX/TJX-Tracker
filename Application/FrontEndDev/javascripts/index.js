
// Starter function for login
// Uses a hard coded credentials (bad practice but used to have a flow)
$(".submit").on("click" , () => 
{   
    // Get the value of the fields
    let username = $(".un").val();
    let password = $(".pass").val();
    console.log(username + "" + password);
    // Check the values against a dumb input 
    if (username === "admin" && password === "admin" )
    {
        window.location.href = ("../views/customers.html");
        console.log("Redirect");
    }
    else {
        $(".un").val("");
        $(".pass").val("");
        alert("Wrong credentials");
    }
});