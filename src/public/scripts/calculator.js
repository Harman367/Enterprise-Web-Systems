//Export funtion to calculate the project quote.
export function calculateQuote(formData){
    //Create Fudge Factor.
    let fudgeFactorTime = Math.random() * (1.11 - 0.9) + 0.9;
    let fudgeFactorCost = Math.random() * (1.11 - 0.9) + 0.9;

    console.log(fudgeFactorTime)
    console.log(fudgeFactorCost)

    //Check if form data is an array.
    if(!Array.isArray(formData.timeRequired)){
        formData.timeRequired = [formData.timeRequired];
        formData.units = [formData.units];
        formData.rate = [formData.rate];
        formData.numWorkers = [formData.numWorkers];
    }

    //Total Cost.
    let totalCost = 0;

    //Calculate work costs.
    for(let i = 0; i < formData.timeRequired.length; i++){
        //Get the time unit.
        let timeUnit = 0;

        //Check time unit.
        switch(formData.units[i]){
            case "hours": timeUnit =  1; break;
            //8 hour working day.
            case "days": timeUnit =  8; break;
            //5 day working week.
            case "weeks": timeUnit =  40; break;
            //4 week working month.
            case "months": timeUnit =  160; break;
        }

        console.log(timeUnit)

        //Get the rate.
        let rate = 0

        //Check rate type.
        switch(formData.rate[i]){
            case "junior": rate =  10; break;
            case "standard": rate =  20; break;
            case "senior": rate =  30; break;
        }

        console.log(rate)

        console.log(formData.numWorkers[i])

        //Add to total cost.
        totalCost += formData.timeRequired[i] * (timeUnit * fudgeFactorTime) * (rate * fudgeFactorCost) * formData.numWorkers[i];
    }

    

    //Return the total cost.
    return Math.round(totalCost);
}

