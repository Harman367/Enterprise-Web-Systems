//Imports
import { model, Schema } from "mongoose";

//Create Schema
const quoteSchema = new Schema({
    "name": { type: String, required: true },
    "subtasks": { type: Array, ref: "Subtask" }
});

//Create model
const quoteModel = model("Quote", quoteSchema);
export default quoteModel;