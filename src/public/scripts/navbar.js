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
                break;

            case 401:
                //Login failed.
                let errorMSG = document.getElementById("failed-login");
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

    //Get the data from the form.
    const formData = new FormData(event.target);

    //Check if the form is ready to be sent.
    let send = true;

    //Get the error message.
    let errorMSG = document.getElementById("empty-fields");

    //Check for empty fields.
    for(let pair of formData.entries()) {
        if(pair[1] == ""){
            //Show error message.
            errorMSG.style.display = "block";
            send = false;
            break;
        } else{
            errorMSG.style.display = "none";
        }
    }

    errorMSG = document.getElementById("short-password");

    //Check password length.
    if(formData.get("password").length < 8 && formData.get("password") != ""){
        //Show error message.
        errorMSG.style.display = "block";
        send = false;
    } else{
        errorMSG.style.display = "none";
    }

    //Get the error message.
    errorMSG = document.getElementById("password-mismatch");

    //Compare the passwords.
    if(formData.get("password") != formData.get("confirm-password")){
        //Show error message.
        errorMSG.style.display = "block";
        send = false;
    } else{
        errorMSG.style.display = "none";
    }

    //Send the form data to the server.
    if(send){
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
                    break;

                case 401:
                    //Registration failed.
                    errorMSG = document.getElementById("failed-register");
                    errorMSG.style.display = "block";
                    break;
            }
        })
    }
}

//Add event listeners to the forms.
window.addEventListener("load", () => {
    //Get the login and register forms.
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    loginForm.onsubmit = handleLogin;
    registerForm.onsubmit = handleRegister;
});