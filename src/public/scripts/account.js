//Account page script------------------------------------------------------------------------------------

//Import functions
import { displayQuote, packageQuote, checkReady } from "./form.js";

//Store quote data.
let quoteData;
let displayedQuote;

//Run on page load.
window.addEventListener("load", async () => {
    //Get all quotes from the database.
    getQuotes();

    //Get all the pay grades from the database.
    getRates();

    //Get update form.
    const updateForm = document.getElementById("update-form");
    updateForm.onsubmit = updateUser;

    //Get the form.
    const payForm = document.getElementById("pay-grades-form");
    payForm.onsubmit = updateRates;
});

//Function to get all quotes from the database.
function getQuotes(){
    //Get the quotes from the database.
    fetch("/GetQuotes", {
        method: "GET"
    }).then(async response => {
        //Switch statement
        switch (response.status) {
            case 200:
                //Get the quotes.
                const quotes = (await response.json()).quotes;

                //Store quote data.
                quoteData = quotes;

                //Add quote selector.
                addQuoteSelector();

                //Add quotes to merge list.
                addQuotesToMergeList();

                break;
            case 401:
                console.log("Failed to get quotes.");
                break;
        }
    })
}

//Function to get all the pay grades from the database.
function getRates(){
    //Get the pay grades from the database.
    fetch("/GetRates", {
        method: "GET"
    }).then(async response => {
        //Switch statement
        switch (response.status) {
            case 200:
                //Get the pay grades.
                const rates = (await response.json()).rates[0];

                //Set the pay grades.
                setRates(rates);

                break;

            case 401:
                console.log("Failed to get rates.");
                break;
        }
    })
}

//Function to set the pay grades.
function setRates(rates){
    //Get the input fields.
    const junior = document.getElementById("junior-paygrade");
    const standard = document.getElementById("standard-paygrade");
    const senior = document.getElementById("senior-paygrade");

    //Set the pay grades.
    junior.value = rates.junior;
    standard.value = rates.standard;
    senior.value = rates.senior;
}

//Function to add the quote selector.
function addQuoteSelector(){
    //Get selector.
    const selector = document.getElementById("select-quote");

    //Remove all options.
    selector.innerHTML = "";

    //Add quotes to the selector.
    for(let i = 0; i < quoteData.length; i++){
        //Create option.
        const option = document.createElement("option");
        option.value = quoteData[i].name;
        option.innerHTML = quoteData[i].name;

        //Add option to the selector.
        selector.appendChild(option);
    }

    //Set index to -1.
    selector.selectedIndex = -1;
}

//Function to add quotes to the merge list.
function addQuotesToMergeList(){
    //Get the merge list.
    const mergeList = document.getElementById("merge-quotes-list");

    //Remove all items.
    mergeList.innerHTML = "";

    //Append quotes to the merge list.
    for(let i = 0; i < quoteData.length; i++){
        //Create div.
        const div = document.createElement("div");
        div.className = "merge-quotes-item";

        //Add plus sign to the div.
        div.innerHTML += '<i class="fa-solid fa-plus" onclick="moveMerge(event)"></i> '

        //Append quote name to the div.
        div.innerHTML += '<p>' + quoteData[i].name + '</p>';

        //Add div to the merge list.
        mergeList.appendChild(div);
    }
}

//Function to open tab.
window.openTab = function(tabName){
    //Hide all tabs.
    let tabs = document.getElementsByClassName("tabcontent");
    for(let i = 0; i < tabs.length; i++){
        tabs[i].style.display = "none";
    }

    //Show the selected tab.
    document.getElementById(tabName).style.display = "block";
}

//Function to update the user's account information
function updateUser(event){
    //Prevent the form from submitting.
    event.preventDefault();

    //Get the data from the form.
    const formData = new FormData(this);

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
        //Skip the password field.
        if(pair[0] == "password"){
            continue;
        }

        if(pair[1] == ""){
            //Show error message.
            errorMSG.style.display = "block";
            send = false;
            break;
        } else{
            errorMSG.style.display = "none";
        }
    }

    //Check if form is ready to be sent.
    if(!send){
        return;
    }

    //Send the form data to the server.
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

//Function to delete the user's account.
window.deleteUser = function(){
    //Get the user's password.
    const password = document.getElementById("deletePassword_account").value;

    //Error message.
    let errorMSG = document.getElementById("failed-delete");

    let send;

    //Check if ready to send.
    if(password === "" || password.length < 8){
        //Show error message.
        errorMSG.style.display = "block";
        send = false;
    } else{
        errorMSG.style.display = "none";
        send = true;
    }

    //Check if ready to send.
    if(!send){
        return;
    }

    //Send the password to the server.
    fetch("/DeleteUser", {
        method: "POST",
        body: new URLSearchParams({password: password})
    }).then(response => {
        if(response.status == 401){
            //Show error message.
            errorMSG.style.display = "block";
        }
    })
}       

//Function to show the selected quote.
window.showQuote = function(event){
    //Get the quote data.
    displayedQuote = quoteData[event.selectedIndex];

    //Get the quote elements.
    const name = displayedQuote.name;
    const subtasks = displayedQuote.subtasks;

    //Add the quote name.
    document.getElementById("project-title").innerHTML = "Project Name: " + name;

    //Get display partial.
    document.getElementById("account-partial").style.display = "block";

    //Remove all subtasks except the first one.
    let subtaskList = document.getElementById("subtasks");
    while(subtaskList.childElementCount > 1){
        subtaskList.removeChild(subtaskList.lastChild);
    }

    //Display the quote.
    displayQuote(subtasks);

    //Press every calculate button.
    let buttons = document.querySelectorAll(".button-calculate-subtask");

    buttons.forEach(button => {
        button.click();
    });

    //Calculate the total.
    document.getElementById("button-calculate-final").click();

    //Add the quote name to the update form.
    document.getElementById("newQuoteName").value = name;
}

//Function update the quote.
window.updateQuote = function(){
    //Get all the subtasks.
    const subtasks = packageQuote(true);

    //Get the new quote name.
    const newQuoteName = document.getElementById("newQuoteName").value;

    //Check if the forms are ready to be sent.
    if(!checkReady(subtasks, newQuoteName)){
        return null;
    }

    //Get the save status.
    let save = document.getElementById("saveStatus");

    const sendBody = {"subtasks": JSON.stringify(packageQuote()), "name": newQuoteName, "id": displayedQuote._id};

    //Send the form data to the server.
    fetch("/UpdateQuote", {
        method: "POST",
        body: new URLSearchParams(sendBody),
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Save successful.
                save.innerHTML = "Update successfully.";
                getQuotes();
                //Add the quote name.
                document.getElementById("project-title").innerHTML = "Project Name: " + newQuoteName;
                break;
            case 400:
                //Save failed.
                save.innerHTML = "Failed to update.";
                break;
        }
    })
}

//Function to delete the quote.
window.deleteQuote = function(){
    const sendBody = {"id": displayedQuote._id};

    //Send the form data to the server.
    fetch("/DeleteQuote", {
        method: "POST",
        body: new URLSearchParams(sendBody),
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Delete successful.
                alert("Delete successful.");

                getQuotes();

                //Get hide partial.
                document.getElementById("account-partial").style.display = "none";

                break;
            case 400:
                //Delete failed.
                alert("Failed to delete.");
                break;
        }
    })
}

//Function to move the quote to the merge list.
window.moveMerge = function(event){
    //Get the parent div.
    const parent = event.target.parentElement;

    //Get the quote.
    const quote = parent.children[1];

    //Create div.
    const div = document.createElement("div");

    //List to move to.
    let mergeList;

    //Check the parent id.
    if(parent.className === "merge-quotes-item"){
        //Get the list to move to.
        mergeList = document.getElementById("quotes-to-merge");

        //Give class to the div.
        div.className = "quotes-to-merge-item";

        //Add minus sign to the div.
        div.innerHTML += '<i class="fa-solid fa-minus" onclick="moveMerge(event)"></i> '
    
    } else if(parent.className ==="quotes-to-merge-item"){
        //Get the list to move to.
        mergeList = document.getElementById("merge-quotes-list");

        //Give class to the div.
        div.className = "merge-quotes-item";

        //Add plus sign to the div.
        div.innerHTML += '<i class="fa-solid fa-plus" onclick="moveMerge(event)"></i> '
    }

    //Add the quote to the div.
    div.appendChild(quote);

    //Add div to the merge list.
    mergeList.appendChild(div);

    //Remove the parent div.
    parent.remove();

    //Check if there are 2 or more quotes in the merge list.
    if(document.getElementById("quotes-to-merge").childElementCount > 1){
        //Show the merge button.
        document.getElementById("saveMerged").style.display = "block";
    } else{
        //Hide the merge button.
        document.getElementById("saveMerged").style.display = "none";
    }
}

//Function to save the merged quote.
window.saveMerged = function(){
    //Get the quotes to merge.
    const quoteNames = document.getElementById("quotes-to-merge").querySelectorAll("p");
    
    let quotIDs = [];

    //Get the quote ids.
    quoteNames.forEach(quote => {
        for(let i = 0; i < quoteData.length; i++){
            if(quote.innerHTML === quoteData[i].name){
                quotIDs.push(quoteData[i]._id);
                break;
            }
        }
    });

    //Get the new quote name.
    const newQuoteName = document.getElementById("mergedQuoteName").value;

    //Ready to send.
    const sendBody = {"ids": JSON.stringify(quotIDs), "name": newQuoteName};

    //Send the form data to the server.
    fetch("/MergeQuotes", {
        method: "POST",
        body: new URLSearchParams(sendBody)
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Merge successful.
                alert("Merge successful.");

                getQuotes();

                //Get hide partial.
                document.getElementById("account-partial").style.display = "none";

                //Hide the merge button.
                document.getElementById("saveMerged").style.display = "none";

                //Remove all quotes from the merge list.
                document.getElementById("quotes-to-merge").innerHTML = "";

                break;

            case 400:
                //Merge failed.
                alert("Failed to merge.");
                break;
        }
    })
}

//Function to update the rate.
function updateRates(event){
    //Prevent the form from submitting.
    event.preventDefault();

    //Get the data from the form.
    const formData = new FormData(this);

    //Check if the form is ready to be sent.
    let send;

    //Get error message.
    const error = document.getElementById("rateError");

    //Check if the form is ready to be sent.
    for (const entry of formData.entries()) {
        if(entry[1] === "" || entry[1] === 0){
            error.style.display = "block";
            send = false;
            break;
        } else{
            error.style.display = "none";
            send = true;
        }
    }

    //Check if the form is ready to be sent.
    if(!send){
        return;
    }

    //Send the form data to the server.
    fetch("/UpdateRate", {
        method: "POST",
        body: new URLSearchParams(formData)
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Update successful.
                alert("Update successful.");
                break;

            case 400:
                //Update failed.
                alert("Failed to update.");
                break;
        }
    })
}
