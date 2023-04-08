//Imports
import { model, Schema } from "mongoose";

//Create Schema
const quoteSchema = new Schema({
    "name": { type: String, required: true },
    "subtasks": [{ type: Schema.Types.ObjectId, ref: "Subtask" }]
});

//Create model
const quoteModel = model("Quote", quoteSchema);
export default quoteModel;