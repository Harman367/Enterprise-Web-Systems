//Variables.
workerInputCount = 0;

//Function to create label and input field for a worker.
function createWorkerInput() {
    //Create item.
    const item = document.createElement('div');
    item.id = 'workerInput' + workerInputCount;
    item.className = 'workerInput';

    //Create the labels and input fields.
    item.innerHTML = `
        <!--Label for time period of work.-->
        <label for="timePeriod${workerInputCount}">Time period of work:</label>
        `;

    let workers = document.getElementById('workers');
    workers.appendChild(item);
    workerInputCount++;
}

window.addEventListener('load', () => {
    document.getElementById('addWorker').addEventListener('click', createWorkerInput);
});