//Account page script------------------------------------------------------------------------------------

//Function to update the user's account information
function updateUserDetails(event){
    //Prevent the form from submitting.
    event.preventDefault();

    //Get the data from the form.
    formData = new FormData(event.target);

    //Check if the form is ready to be sent.
    let send = true;

    //Get the error message.
    let errorMSG = document.getElementById("failed-password");

    //Check password length.
    if(formData.get("password").length < 8 && formData.get("password") != ""){
        //Show error message.
        errorMSG.style.display = "block";
        send = false;
    } else{
        errorMSG.style.display = "none";
    }

    //Send the form data to the server.
    if(send){
        fetch("/UpdateUser", {
            method: "POST",
            body: new URLSearchParams(formData)
        }).then(response => {
            //Switch statement
            switch (response.status) {
                case 200: 
                    //Update successful.
                    alert("Update successful!");
                    break;

                case 401:
                    //Update failed.
                    errorMSG = document.getElementById("failed-update");
                    errorMSG.style.display = "block";
                    break;
            }
        })
    }
}

//Add event listeners to the forms.
window.addEventListener("load", () => {
    //Get update form.
    const updateForm = document.getElementById("update-form");

    //Add event listener to the update form.
    updateForm.onsubmit = updateUserDetails;
});

//Function to open collapsible.
window.onclick = function (event) {
    //Check if the user clicked the box.
    if (event.target.matches('#user-details')) {
        //Get update form.
        const updateForm = document.getElementById("update-form");
        updateForm.style.display = "block";
    }
}