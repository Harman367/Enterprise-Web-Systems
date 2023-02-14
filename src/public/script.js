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