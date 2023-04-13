//Home page script------------------------------------------------------------------------------------

//Impoort functions
import {displayQuote, updateSubtaskCount, packageQuote, checkReady } from "./form.js";

//Run on page load.
window.addEventListener('load', () => {
    //Create subtask
    createSubtask();

    //Load form inputs when refreshing the page.
    loadCalculation();
});

//Save form inputs when refreshing the page.
window.onbeforeunload = function () {
    saveCalculation();
}

//Function to clear the form.
window.clearForm = function() {
    //Get the form inputs.
    const inputs = document.querySelectorAll('input');

    //Clear the form.
    for(let input of inputs){
        input.value = "";
    }

    //Get the form.
    const selects = document.querySelectorAll('select');

    //Clear the form.
    for(let select of selects){
        select.selectedIndex = 0;
    }

    //Clear the cost outputs.
    const subtaskQuotes = document.getElementsByClassName('subtask-quote');
    const finalQuote = document.getElementById('final-quote');

    for(let quote of subtaskQuotes){
        quote.innerHTML = "";
    }
    finalQuote.innerHTML = "";

    //Save the form data.
    saveCalculation();
}

//Function to reset the form.
window.resetForm = function () {
    clearForm();

    //Get all forms.
    const subtasks = document.getElementById("subtasks").children;

    //Remove all forms except the first one.
    for(let i = 1; i < subtasks.length; i++){
        subtasks[i].remove();
    }

    //Update subtask count.
    updateSubtaskCount();

    //Save the form data.
    saveCalculation();
}

//Save calculation form inputs to local storage.
function saveCalculation() {
    //Set key for local storage.
    const name = "calculator"

    //Save the form data to local storage.
    localStorage.setItem(name, JSON.stringify(packageQuote()));
}

//Load calculation form inputs from local storage.
function loadCalculation() {
    if(localStorage.getItem("calculator") != null){
        //Get the form data.
        const subtasks = JSON.parse(localStorage.getItem("calculator"));

        //Display the quote.
        displayQuote(subtasks);
    }
}

//Function to save the quote to the database.
window.saveQuote = function () {
    //Get all the forms
    let subtasks = packageQuote(true);

    //Get quote name.
    const quoteName = document.getElementById("quoteName").value;

    //Check if the forms are ready to be sent.
    if(!checkReady(subtasks, quoteName)){
        return null;
    }

    //Get the save status.
    let save = document.getElementById("saveStatus");

    //Package the quote data.
    const sendBody = {"subtasks": JSON.stringify(packageQuote()), "name": quoteName};

    //Send the form data to the server.
    return fetch("/SaveQuote", {
        method: "POST",
        body: new URLSearchParams(sendBody),
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Save successful.
                save.innerHTML = "Quote saved successfully.";
                resetForm();
                break;
            case 400:
                //Save failed.
                save.innerHTML = "Quote failed to save.";
                break;
        }
    })
}