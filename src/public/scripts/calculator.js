//Export funtion to calculate the project quote.
export function calculateQuote(formData){
    //Create Fudge Factor.
    let fudgeFactorTime;
    let fudgeFactorCost;

    //Check if fudge factor is enabled.
    if(formData.useFudge === "true"){
        fudgeFactorTime = Math.random() * (1.11 - 0.9) + 0.9;
        fudgeFactorCost = Math.random() * (1.11 - 0.9) + 0.9;
    } else {
        fudgeFactorTime = 1;
        fudgeFactorCost = 1;
    }


    //Check if worker form data is an array.
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

        //Get the rate.
        let rate = 0

        //Check rate type.
        switch(formData.rate[i]){
            case "junior": rate =  10; break;
            case "standard": rate =  20; break;
            case "senior": rate =  30; break;
        }

        //Add to total cost.
        totalCost += formData.timeRequired[i] * (timeUnit * fudgeFactorTime) * (rate * fudgeFactorCost) * formData.numWorkers[i];
    }


    //Check if cost amount exists.
    if(formData.costAmount != undefined){
        //Check if ongoing form data is an array.
        if(!Array.isArray(formData.costAmount)){
            formData.costAmount = [formData.costAmount];
            formData.costDuration = [formData.costDuration];
        }

        //Calculate ongoing costs.
        for(let i = 0; i < formData.costAmount.length; i++){
            //Add to total cost.
            totalCost += (formData.costAmount[i] * fudgeFactorCost) * (formData.costDuration[i] * fudgeFactorTime);

        }
    }

    //Check if one-off cost amount exists.
    if(formData.oneCostAmount != undefined){
        //Check if one-off form data is an array.
        if(!Array.isArray(formData.oneCostAmount)){
            formData.oneCostAmount = [formData.oneCostAmount];
        }

        //Calculate one-off costs.
        for(let i = 0; i < formData.oneCostAmount.length; i++){
            //Add to total cost.
            totalCost += formData.oneCostAmount[i] * fudgeFactorCost;
        }
    }
    
    //Return the rounded total cost.
    return Math.round(totalCost);
}

