//Home page script------------------------------------------------------------------------------------

//Array of subtasks
let subtaskforms;

//Run on page load.
window.addEventListener('load', () => {
    //Get subtask forms.
    subtaskforms = document.getElementById("subtasks");

    //Create subtask
    createSubtask();

    //Load form inputs when refreshing the page.
    loadCalculation();
});

//Save form inputs when refreshing the page.
window.onbeforeunload = function () {
    saveCalculation();
}

//Function to create label and input field for a subtask.
function createSubtask() {
    //Get template.
    const template = document.getElementById("subtaskTemplate");
    const item = template.content.cloneNode(true);
    item.className = "subtask";

    //Don't show remove button if there is only one subtask.
    if(subtaskforms.childElementCount === 0){
        item.querySelector('.removeSubtask').remove();
    }

    //Add event listeners to the form.
    addListeners(item.firstElementChild);

    //Get element to append to.
    subtaskforms.appendChild(item);

    //Update subtask count.
    updateSubtaskCount()
}

//Function to add event listeners to the form.
function addListeners(form) {   
    //Add event listener to the add worker button.
    form.querySelector('.addWorker').addEventListener('click', event => {
        createInput('worker', '.workers', 'workerTemplate', event);
    });

    //Add event listener to the add ongoing cost button.
    form.querySelector('.addOngoing').addEventListener('click', event => {
        createInput('ongoingCost', '.ongoingCosts', 'ongoingTemplate', event);
    });

    //Add event listener to the add one off cost button.
    form.querySelector('.addOneOff').addEventListener('click', event => {
        createInput('oneOffCost', '.oneOffCosts', 'oneOffTemplate', event);
    });

    form.onsubmit = async e => {
        //Prevent form from submitting.
        e.preventDefault();

        let useFudge;

        try{
            //Check if fudge factor is enabled.
            useFudge = form.getElementsByClassName("fudgeFactorSub")[0].checked;
        } catch (e) {
            //If fudge factor is not enabled, set it to true.
            useFudge = true;
        }

        //Get the form data.
        const subtaskQuote = await calcSubtask(form, useFudge);

        //Check if the quote is being calculated for a subtask.
        form.querySelector(".button-holder > .subtask-quote").innerHTML = "£" + subtaskQuote.cost;
    }
}

//Function to update subtask count.
function updateSubtaskCount() {
    //Loop through the subtasks and update the count.
    Array.from(subtaskforms.children).forEach((subtask, index) => {
        const header = subtask.querySelector(".subtask-number");
        header.innerHTML = "Subtask " + (index + 1)
    })
}

//Function to create label and input fields for workers, ongoing costs and one off costs.
function createInput(inputs, appendTo, temp, event) {
    //Create item.
    const item = document.createElement('div');
    item.className = inputs;

    //Get template.
    const template = document.getElementById(temp);
    const content = template.content.cloneNode(true);

    //Append template to item.
    item.appendChild(content);

    //Get element to append to.
    let parent = event.target.parentElement;
    let section = parent.querySelector(appendTo);
    section.appendChild(item);
}

//Function to remove a input field.
function removeInput(element) {
    element.parentElement.remove();

    //Check if removing a subtask.
    if(element.parentElement.className === "quote-calculator subtask"){
        //Update subtask count.
        updateSubtaskCount();
    }
}

//Function to clear the form.
function clearForm() {
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
        select.selectedIndex = "0";
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
function resetForm() {
    clearForm();

    //Get all forms.
    const subtasks = subtaskforms.children;

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

        //Count the number of subtasks.
        let subtaskCount = 0;

        //Loop through the subtasks.
        subtasks.forEach(subtask =>{
            //Create a new subtask if there are not enough subtasks.
            if (document.querySelectorAll('.subtask').length < Object.keys(subtasks).length) {
                createSubtask();
            }

            //Get the subtask.
            const subtaskForm = document.querySelectorAll('.subtask')[subtaskCount];

            //Count the number of rows.
            let workerCount = 0;
            let ongoingCount = 0;
            let oneOffCount = 0;

            //Load the form data.
            for(let worker of subtask.workers){
                //Create a new row if there are not enough rows.
                if (subtaskForm.querySelectorAll('.worker').length < subtask.workers.length) {
                    createInput('worker', 'workers', 'workerTemplate');
                }

                //Get the row.
                const workerRow = subtaskForm.querySelectorAll('.worker')[workerCount];

                //Set the values.
                workerRow.querySelector('.timeRequired').value = worker.timeRequired;
                workerRow.querySelector('.units').value = worker.units;
                workerRow.querySelector('.rate').value = worker.rate;
                workerRow.querySelector('.numWorkers').value = worker.numWorkers;

                workerCount++;
            }

            for(let ongoingCost of subtask.ongoingCosts){
                //Create a new row if there are not enough rows.
                if (subtaskForm.querySelectorAll('.ongoingCost').length < subtask.ongoingCosts.length) {
                    createInput('ongoingCost', 'ongoingCosts', 'ongoingTemplate');
                }

                //Get the row.
                const ongoingCostRow = subtaskForm.querySelectorAll('.ongoingCost')[ongoingCount];

                //Set the values.
                ongoingCostRow.querySelector('.costName').value = ongoingCost.costName;
                ongoingCostRow.querySelector('.costAmount').value = ongoingCost.costAmount;
                ongoingCostRow.querySelector('.costFrequency').value = ongoingCost.costFrequency;
                ongoingCostRow.querySelector('.costDuration').value = ongoingCost.costDuration;

                ongoingCount++;
            }

            for(let oneOffCost of subtask.oneOffCosts){
                //Create a new row if there are not enough rows.
                if (subtaskForm.querySelectorAll('.oneOffCost').length < subtask.oneOffCosts.length) {
                    createInput('oneOffCost', 'oneOffCosts', 'oneOffTemplate');
                }

                //Get the row.
                const oneOffCostRow = subtaskForm.querySelectorAll('.oneOffCost')[oneOffCount];

                //Set the values.
                oneOffCostRow.querySelector('.oneCostName').value = oneOffCost.costName;
                oneOffCostRow.querySelector('.oneCostAmount').value = oneOffCost.costAmount;

                oneOffCount++;
            }
            subtaskCount++;
        });
    }
}

//Function to calculate the quote.
async function calculateQuote() {
    //Check if fudge factor is enabled.
    let useFudge;
    
    try{
        //Check if fudge factor is enabled.
        useFudge = document.getElementById("fudgeFactor").checked;
    } catch (e) {
        //If fudge factor is not enabled, set it to true.
        useFudge = true;
    }

    //Total quote cost.
    let totalCost = 0;

    //Get the cost of each subtask.
    for(const subtask of subtaskforms.children){
        totalCost += (await calcSubtask(subtask, useFudge)).cost;
    }

    //Display the quote.
    document.getElementById("final-quote").innerHTML = "£" + totalCost;
}

//Function to calculate the cost of a subtask.
function calcSubtask(form, useFudge) {
    //Get the data from the form.
    const formData = new FormData(form);

    //Check if the form is ready to be sent.
    let send = validateForm(formData);

    if(!send){
        return null;
    }

    //Add the fudge factor to the form data.
    formData.append("useFudge", useFudge);

    //Send the form data to the server.
    return fetch("/Calculator", {
        method: "POST",
        body: new URLSearchParams(formData)
    }).then(async response => {
        if (response.status == 200){
            //Get the response.
            return await response.json()
        }
    })
}

//Function to validate the form.
function validateForm(formData) {
    //Check if the form is ready to be sent.
    let send = true;

    //Get the error message.
    let errorMSG = document.getElementById("empty-form-fields");

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

    //Return if the form is ready to be sent.
    return send;
}

//Function to save the quote to the database.
function saveQuote() {
    //Get all the forms
    let forms = packageQuote(true);

    //Get quote name.
    const quoteName = document.getElementById("quoteName").value;

    //Check if the forms are ready to be sent.
    let send;

    //Get the error message.
    let errorMSG = document.getElementById("empty-form-fields");
    let errorMSG2 = document.getElementById("empty-project-name");

    //Check for empty fields.
    for(let form of forms) {
        //Get the data from the form.
        const formData = new FormData(form);

        if(!validateForm(formData)){
            //Show error message.
            errorMSG.style.display = "block";
            send = false;
            break;
        } else{
            errorMSG.style.display = "none";
            send = true;
        }
    }

    //Check if quote name is empty.
    if(quoteName == ""){
        //Show error message.
        errorMSG2.style.display = "block";
        send = false;
    }

    if(!send){
        return null;
    }

    //Get the save status.
    let save = document.getElementById("saveStatus");

    //Package the quote data.
    sendBody = {"subtasks": JSON.stringify(packageQuote()), "name": quoteName};

    //Send the form data to the server.
    return fetch("/SaveQuote", {
        method: "POST",
        body: new URLSearchParams(sendBody),
    }).then(async response => {
        switch (response.status) {
            case 200: 
                //Save successful.
                save.innerHTML = "Quote saved successfully.";
                break;
            case 400:
                //Save failed.
                save.innerHTML = "Quote failed to save.";
                break;
        }
    })
}

//Function to pacakge the quote data.
function packageQuote(db=false) {
    //Get all the forms.
    const subtasks = subtaskforms.children;

    //Check if the quote is being saved to the database.
    if(db){
        return subtasks;
    }

    //Array to store the subtask forms.
    const calculationState = [];

    Array.from(subtasks).forEach((subtask, index) => {
        //Get the form.
        let workers = subtask.querySelectorAll('.worker');
        let ongoingCosts = subtask.querySelectorAll('.ongoingCost');
        let oneOffCosts = subtask.querySelectorAll('.oneOffCost');

        //Array to store the form data.
        const subtaskForm = {
            workers: [],
            ongoingCosts: [],
            oneOffCosts: []
        }

        //Get the form data.
        for(let worker of workers){
            subtaskForm.workers.push({
                timeRequired: worker.querySelector('.timeRequired').valueAsNumber,
                units: worker.querySelector('.units').value,
                rate: worker.querySelector('.rate').value,
                numWorkers: worker.querySelector('.numWorkers').valueAsNumber
            });
        }

        for(let ongoingCost of ongoingCosts){
            subtaskForm.ongoingCosts.push({
                costName: ongoingCost.querySelector('.costName').value,
                costAmount: ongoingCost.querySelector('.costAmount').valueAsNumber,
                costFrequency: ongoingCost.querySelector('.costFrequency').value,
                costDuration: ongoingCost.querySelector('.costDuration').valueAsNumber
            });
        }

        for(let oneOffCost of oneOffCosts){
            subtaskForm.oneOffCosts.push({
                costName: oneOffCost.querySelector('.oneCostName').value,
                costAmount: oneOffCost.querySelector('.oneCostAmount').valueAsNumber,
            });
        }

        //Add the form data to the array.
        calculationState.push(subtaskForm);
    });

    //Return the array.
    return calculationState;
}