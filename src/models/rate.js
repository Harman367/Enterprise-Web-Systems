//Imports
import { model, Schema } from "mongoose";

//Create Schema
const rateSchema = new Schema({
    "junior": { type: Number, required: true },
    "standard": { type: Number, required: true },
    "senior": { type: Number, required: true }
});

//Create model
const rateModel = model("Rate", rateSchema);
export default rateModel;