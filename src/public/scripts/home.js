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

    //Save the form data.
    saveCalculation();
}

//Function to reset the form.
function resetForm() {
    clearForm();

    //Get form rows
    const workers = document.querySelectorAll('.worker');
    const ongoingCosts = document.querySelectorAll('.ongoingCost');
    const oneOffCosts = document.querySelectorAll('.oneOffCost');

    //Remove all rows except the first.
    for(let i = 1; i < workers.length; i++){
        workers[i].remove();
    }

    for(let i = 1; i < ongoingCosts.length; i++){
        ongoingCosts[i].remove();
    }

    for(let i = 1; i < oneOffCosts.length; i++){
        oneOffCosts[i].remove();
    }

    //Save the form data.
    saveCalculation();
}

//Add event listeners.
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

    //Add event listener to the clear button.
    document.getElementById('clear').addEventListener('click', event => {
        clearForm();
    });

    //Add event listener to the reset button.
    document.getElementById('reset').addEventListener('click', event => {
        resetForm();
    });

    //Load form inputs when refreshing the page.
    loadCalculation();
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

    for(let oneOffCost of oneOffCosts){
        calculationState.oneOffCosts.push({
            costName: oneOffCost.querySelector('#oneCostName').value,
            costAmount: oneOffCost.querySelector('#oneCostAmount').valueAsNumber,
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

    if(localStorage.getItem("calculator") != null){
        //Get the form data.
        const calculationState = JSON.parse(localStorage.getItem("calculator"));

        //Count the number of rows.
        let workerCount = 0;
        let ongoingCount = 0;
        let oneOffCount = 0;

        //Load the form data.
        for(let worker of calculationState.workers){
            //Create a new row if there are not enough rows.
            if (document.querySelectorAll('.worker').length < calculationState.workers.length) {
                createInput('worker', 'workers', 'workerTemplate');
            }

            //Get the row.
            const workerRow = document.querySelectorAll('.worker')[workerCount];

            //Set the values.
            workerRow.querySelector('#timeRequired').value = worker.timeRequired;
            workerRow.querySelector('#units').value = worker.units;
            workerRow.querySelector('#rate').value = worker.rate;
            workerRow.querySelector('#numWorkers').value = worker.numWorkers;

            workerCount++;
        }

        for(let ongoingCost of calculationState.ongoingCosts){
            //Create a new row if there are not enough rows.
            if (document.querySelectorAll('.ongoingCost').length < calculationState.ongoingCosts.length) {
                createInput('ongoingCost', 'ongoingCosts', 'ongoingTemplate');
            }

            //Get the row.
            const ongoingCostRow = document.querySelectorAll('.ongoingCost')[ongoingCount];

            //Set the values.
            ongoingCostRow.querySelector('#costName').value = ongoingCost.costName;
            ongoingCostRow.querySelector('#costAmount').value = ongoingCost.costAmount;
            ongoingCostRow.querySelector('#costFrequency').value = ongoingCost.costFrequency;
            ongoingCostRow.querySelector('#costDuration').value = ongoingCost.costDuration;

            ongoingCount++;
        }

        for(let oneOffCost of calculationState.oneOffCosts){
            //Create a new row if there are not enough rows.
            if (document.querySelectorAll('.oneOffCost').length < calculationState.oneOffCosts.length) {
                createInput('oneOffCost', 'oneOffCosts', 'oneOffTemplate');
            }

            //Get the row.
            const oneOffCostRow = document.querySelectorAll('.oneOffCost')[oneOffCount];

            //Set the values.
            oneOffCostRow.querySelector('#oneCostName').value = oneOffCost.costName;
            oneOffCostRow.querySelector('#oneCostAmount').value = oneOffCost.costAmount;

            oneOffCount++;
        }
    }
}