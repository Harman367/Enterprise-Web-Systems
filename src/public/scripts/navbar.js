//Navbar script-------------------------------------------------------------------------------------

//Function to open thre dropdown menu on click.
function openDropdown(id, close) {
    //Open the dropdown menu.
    document.getElementById(id).classList.toggle("show");

    //Close the other dropdown menu.
    document.getElementById(close).classList.remove("show");
}

//Function to close the dropdown menu when the user clicks outside of it.
window.onclick = function (event) {
    //Check if the user clicked outside of the dropdown menu.
    if (!event.target.matches('.dropdown *')) {

        //Get all dropdown menus.
        let dropdowns = document.getElementsByClassName("dropdown-content");

        //Close all dropdown menus.
        for (let i = 0; i < dropdowns.length; i++) {
            let open = dropdowns[i];
            if (open.classList.contains('show')) {
                open.classList.remove('show');
            }
        }
    }
}

//Login and Register script-------------------------------------------------------------------------------------

//Function to handle the login form.
function handleLogin(event) {
    //Prevent the form from submitting.
    event.preventDefault();

    //Get the username and password from the form.
    const formData = new FormData(event.target);

    for(let pair of formData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]);
    }
    
    //Send the form data to the server.
    fetch("/Login", {
        method: "POST",
        body: new URLSearchParams(formData)
    }).then(response => {
        //Switch statement
        switch (response.status) {
            case 200: 
                //Login successful.
                window.location.reload();

            case 401:
                //Login failed.
                errorMSG = document.getElementById("failed-login");
                errorMSG.style.display = "block";
            break;
        }
    })
}

//Clear register form
function clearRegisterForm() {
    //Get the form inputs.
    const inputs = document.querySelectorAll('#register-form > input');

    //Clear the form.
    for(let input of inputs){
        input.value = "";
    }

    //Close the dropdown menu.
    document.getElementById('register-form-container').classList.remove("show");
}

//Function to handle the register form.
function handleRegister(event) {
    //Prevent the form from submitting.
    event.preventDefault();

    //Get the username and password from the form.
    const formData = new FormData(event.target);

    //Send the form data to the server.
    fetch("/Register", {
        method: "POST",
        body: new URLSearchParams(formData)
    }).then(response => {
        //Switch statement
        switch (response.status) {
            case 200: 
                //Registration successful.
                clearRegisterForm();
                alert("Registration successful!");

            case 401:
                //Registration failed.
                errorMSG = document.getElementById("failed-register");
                errorMSG.style.display = "block";
            break;
        }
    })
}

//Add event listeners to the forms.
window.addEventListener("load", () => {
    //Get the login and register forms.
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    loginForm.onsubmit = handleLogin;
    registerForm.onsubmit = handleRegister;
});