//Functions for quote calculator form--------------------------------------------

//Function to create label and input field for a subtask.
window.createSubtask = function () {
    //Get template.
    const template = document.getElementById("subtaskTemplate");
    const item = template.content.cloneNode(true);
    item.className = "subtask";

    //Get the subtask forms.
    const subtaskforms = document.getElementById("subtasks");

    //Don't show remove button if there is only one subtask.
    if(subtaskforms.childElementCount === 0){
        item.querySelector('.removeSubtask').remove();
    }

    //Add event listeners to the form.
    addListeners(item.firstElementChild);

    //Add the form to the subtask forms.
    subtaskforms.appendChild(item);

    //Update subtask count.
    updateSubtaskCount()
}

//Function to add event listeners to the form.
function addListeners(form) {   
    //Add event listener to the add worker button.
    form.querySelector('.addWorker').addEventListener('click', event => {
        createInput('worker', '.workers', 'workerTemplate', event.target.parentElement);
    });

    //Add event listener to the add ongoing cost button.
    form.querySelector('.addOngoing').addEventListener('click', event => {
        createInput('ongoingCost', '.ongoingCosts', 'ongoingTemplate', event.target.parentElement);
    });

    //Add event listener to the add one off cost button.
    form.querySelector('.addOneOff').addEventListener('click', event => {
        createInput('oneOffCost', '.oneOffCosts', 'oneOffTemplate', event.target.parentElement);
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

//Function to create label and input fields for workers, ongoing costs and one off costs.
export function createInput(inputs, appendTo, temp, parent) {
    //Create item.
    const item = document.createElement('div');
    item.className = inputs;

    //Get template.
    const template = document.getElementById(temp);
    const content = template.content.cloneNode(true);

    //Append template to item.
    item.appendChild(content);

    //Get element to append to.
    let section = parent.querySelector(appendTo);
    section.appendChild(item);
}

//Function to remove a input field.
window.removeInput = function (element) {
    element.parentElement.remove();

    //Check if removing a subtask.
    if(element.parentElement.className === "quote-calculator subtask"){
        //Update subtask count.
        updateSubtaskCount();
    }
}

//Function to update subtask count.
export function updateSubtaskCount() {
    //Get the subtask forms.
    const subtaskforms = document.getElementById("subtasks");

    //Loop through the subtasks and update the count.
    Array.from(subtaskforms.children).forEach((subtask, index) => {
        const header = subtask.querySelector(".subtask-number");
        header.innerHTML = "Subtask " + (index + 1)
    })
}

//Function to calculate the quote.
window.calculateQuote = async function () {
    //Get the subtask forms.
    const subtaskforms = document.getElementById("subtasks");

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
export function validateForm(formData) {
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

//Function to pacakge the quote data.
export function packageQuote(db=false) {
    //Get all the forms.
    const subtasks = document.getElementById("subtasks").children;

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

//Function to display the quote data.
export function displayQuote(subtasks) {
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
                createInput('worker', '.workers', 'workerTemplate', subtaskForm);
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
                createInput('ongoingCost', '.ongoingCosts', 'ongoingTemplate', subtaskForm);
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
                createInput('oneOffCost', '.oneOffCosts', 'oneOffTemplate', subtaskForm);
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

//Function to check if ready to send form.
export function checkReady(subtasks, quoteName) {
    //Check if the forms are ready to be sent.
    let send;

    //Get the error message.
    let errorMSG = document.getElementById("empty-form-fields");
    let errorMSG2 = document.getElementById("empty-project-name");

    //Check for empty fields.
    for(let form of subtasks) {
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

    return send;
}