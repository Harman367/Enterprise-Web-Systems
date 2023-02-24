//Home page script------------------------------------------------------------------------------------

//Function to create label and input field for a worker.
function createInput(inputs, appendTo, temp) {
    //Create item.
    const item = document.createElement('div');
    item.className = inputs;

    //Get template.
    const template = document.getElementById(temp);
    const content = template.content.cloneNode(true);

    //Append template to item.
    item.appendChild(content);

    //Get element to append to.
    let workers = document.getElementById(appendTo);
    workers.appendChild(item);
}

//Function to remove a input field.
function removeInput(element) {
    element.parentElement.remove();
}

//Add event listener to the button.
window.addEventListener('load', () => {
    //Add event listener to the add worker button.
    document.getElementById('addWorker').addEventListener('click', event => {
        createInput('worker', 'workers', 'workerTemplate');
    });

    //Add event listener to the add ongoing cost button.
    document.getElementById('addOngoing').addEventListener('click', event => {
        createInput('ongoingCost', 'ongoingCosts', 'ongoingTemplate');
    });

    //Add event listener to the add one off cost button.
    document.getElementById('addOneOff').addEventListener('click', event => {
        createInput('oneOffCost', 'oneOffCosts', 'oneOffTemplate');
    });
});


//Save calculation form inputs to local storage.
function saveCalculation() {
    //Get the form.
    const workers = document.querySelectorAll('.worker');
    const ongoingCosts = document.querySelectorAll('.ongoingCost');
    const oneOffCosts = document.querySelectorAll('.oneOffCost');

    //Array to store the form data.
    const calculationState = {
        workers: [],
        ongoingCosts: [],
        oneOffCosts: []
    }

    //Get the form data.
    for(let worker of workers){
        calculationState.workers.push({
            timeRequired: worker.querySelector('#timeRequired').valueAsNumber,
            units: worker.querySelector('#units').value,
            rate: worker.querySelector('#rate').value,
            numWorkers: worker.querySelector('#numWorkers').valueAsNumber
        });
    }

    for(let ongoingCost of ongoingCosts){
        calculationState.ongoingCosts.push({
            costName: ongoingCost.querySelector('#costName').value,
            costAmount: ongoingCost.querySelector('#costAmount').valueAsNumber,
            costFrequency: ongoingCost.querySelector('#costFrequency').value,
            costDuration: ongoingCost.querySelector('#costDuration').valueAsNumber
        });
    }

    //Set key for local storage.
    const name = "calculator"

    //Save the form data to local storage.
    localStorage.setItem(name, JSON.stringify(calculationState));
}

//Save form inputs when refreshing the page.
window.onbeforeunload = function () {
    saveCalculation();
}

//Load calculation form inputs from local storage.
function loadCalculation() {
    //Get the form.
    const form = document.getElementById('quote-calculator');

    //Get the form data.
    const formData = new FormData(form);

    //Set key for local storage.
    const name = "calculator"

    //Get the form data from local storage.
    const data = JSON.parse(localStorage.getItem(name));

    //Set the form data to the values from local storage.
    for (let [key, value] of formData.entries()) {
        formData.set(key, data[key]);
    }
}

//Load form inputs when refreshing the page.
window.addEventListener('load', () => {
    loadCalculation();
});