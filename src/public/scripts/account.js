//Account page script------------------------------------------------------------------------------------

//Store quote data.
let quoteData;

//Run on page load.
window.addEventListener("load", async () => {
    //Get update form.
    const updateForm = document.getElementById("update-form");

    //Add event listener to the update form.
    updateForm.onsubmit = updateUserDetails;

    //Get all quotes from the database.
    getQuotes();
});

//Function to get all quotes from the database.
function getQuotes(){
    //Get selector.
    const selector = document.getElementById("select-quote");

    //Get the quotes from the database.
    fetch("/GetQuotes", {
        method: "GET"
    }).then(async response => {
        //Switch statement
        switch (response.status) {
            case 200:
                //Get the quotes.
                const quotes = (await response.json()).quotes;

                //Add quotes to the selector.
                for(let i = 0; i < quotes.length; i++){
                    //Create option.
                    const option = document.createElement("option");
                    option.value = quotes[i].name;
                    option.innerHTML = quotes[i].name;

                    //Add option to the selector.
                    selector.appendChild(option);
                }

                //Set index to -1.
                selector.selectedIndex = -1;

                //Store quote data.
                quoteData = quotes;

                break;
            case 401:
                console.log("Failed to get quotes.");
                break;
        }
    })
}

//Function to open tab.
function openTab(event, tabName){
    //Hide all tabs.
    let tabs = document.getElementsByClassName("tabcontent");
    for(let i = 0; i < tabs.length; i++){
        tabs[i].style.display = "none";
    }

    //Show the selected tab.
    document.getElementById(tabName).style.display = "block";
}

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

    errorMSG = document.getElementById("failed-fields");

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

//Function to show the selected quote.
function showQuote(event){
    //Get the quote data.
    const data = quoteData[event.selectedIndex];

    //Get the quote elements.
    const name = data.name;
    const subtasks = data.subtasks;

    console.log(name);
    console.log(subtasks);
}
