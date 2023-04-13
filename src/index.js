//Imports
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import userModel from "./models/user.js";
import quoteModel from "./models/quote.js";
import rateModel from "./models/rate.js";
import { calculateQuote } from "./public/scripts/calculator.js";

//Initialize App
const app = express();

//Set Port
const port = process.env.PORT || 3000;
app.set("port", port);

//Set up static folder.
app.use(express.static("src/public"));

//Set up view folder.
app.set("views", "src/views");

//Set up view engine.
app.set("view engine", "ejs");

//Set up session.
app.use(session({secret:process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));


/*---Get Routes---*/

//Root Route
app.get("/", (req, res) => {
  res.render("pages/Home", {loggedIn: req.session.loggedIn, admin: req.session.admin});
});

//Account Route
app.get("/Account", async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get current user.
  const username = req.session.currentuser;

  //Get the user data.
  try{
    const user = await userModel.findOne({username: username});

    //Check if the user exists.
    if(!user){
      res.redirect("/");
      return
    }

    //Render the page.
    res.render("pages/Account", {loggedIn: req.session.loggedIn, admin: req.session.admin, user: user});

  } catch(error){
    res.redirect("/");
    console.error(error);
  }
});

//Admin Route
app.get("/Admin", (req, res) => {
  res.render("pages/Admin", {loggedIn: req.session.loggedIn, admin: req.session.admin});
});

//Logout Route
app.get("/Logout", (req, res) => {
  //Destroy the session.
  req.session.destroy();

  //Redirect to the home page.
  res.redirect("/");
});

//Get Quotes Route
app.get("/GetQuotes", async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the current user.
  const username = req.session.currentuser;

  try{
    //Get the user document.
    const quoteIDs = await userModel.findOne({username: username}, {savedQuotes: 1});

    //Find the quotes.
    const savedQuotes = await quoteModel.find({_id: {$in: quoteIDs.savedQuotes}});

    //Return the quotes.
    res.status(200).json({ message: "Success", quotes: savedQuotes });
  
  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Get Rates Route
app.get("/GetRates", async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  try{
    //Get the rates.
    const rates = await rateModel.find({});

    //Return the rates.
    res.status(200).json({ message: "Success", rates: rates });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  } 
});

/*---Post Routes---*/

//Login Route
app.post("/Login", express.urlencoded({
  extended: true
}), async (req, res) => {

  //Get the username and password from the form.
  const username = req.body.username;
  const password = req.body.password;

  try{
    //Check if the user exists.
    const user = await userModel.findOne({username: username});

    if(!user){
      res.status(401).json({ message: "Failed" });
      return 
    }

    //Authenticate the password.
    if(!user.authenticate(password)){
      res.status(401).json({ message: "Failed" });
      return
    }

    //Set the session variables.
    req.session.loggedIn = true;
    req.session.currentuser = user.username;
    req.session.admin = user.admin;

    //Login successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Register Route
app.post("/Register", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Get the user data from the form.
  let userData = {
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "email": req.body.email,
    "company": req.body.company,
    "username": req.body.username,
    "password": req.body.password,
    "admin": false,
    "savedQuotes": []
  }

  //Check if the username / email is already taken.
  const user = new userModel(userData);
  try{
    //Save the user.
    await user.save()

    //Registration successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Update User Route
app.post("/UpdateUser", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the user data from the form.
  let userData = {
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "email": req.body.email,
    "company": req.body.company,
    "username": req.body.username,
    "password": req.body.password
  }

  //Check if the password is empty.
  if(userData.password == ""){
    delete userData["password"]
  }

  //Get the current user.
  const username = req.session.currentuser;
  try{
    //Update the user data.
    await userModel.findOneAndUpdate({username: username, password: req.body.currenntPassword}, userData)

    //Change the session variables.
    req.session.currentuser = userData.username;

    //Update successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Delete User Route
app.post("/DeleteUser", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the current user.
  const username = req.session.currentuser;
  try{
    await userModel.deleteOne({username: username, password: req.body.deletePassword});

    //Destroy the session.
    req.session.destroy();

    //Redirect to the home page.
    res.redirect("/");

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Save Quote Route
app.post("/SaveQuote", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the current user.
  const username = req.session.currentuser;

  //Get the quote data from the body.
  let quoteData = {
    "name": req.body.name,
    "subtasks": JSON.parse(req.body.subtasks),
  }

  //Create the quote data.
  const quote = new quoteModel(quoteData);

  try{
    //Save the quote.
    await quote.save();

    //Get the quote ID.
    const quoteID = quote._id;

    //Add the quote ID to the user's saved quotes.
    await userModel.findOneAndUpdate({username: username}, {$push: {savedQuotes: quoteID}})

    //Save successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Update Quote Route
app.post("/UpdateQuote", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the user data from the form.
  let quoteData = {
    "name": req.body.name,
    "subtasks": JSON.parse(req.body.subtasks),
  }

  try{
    //Update the user data.
    await quoteModel.findOneAndUpdate({_id: req.body.id}, quoteData)

    //Update successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Delete Quote Route
app.post("/DeleteQuote", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the current user.
  const username = req.session.currentuser;

  try{
    //Delete the quote.
    await quoteModel.deleteMany({_id: {$in: req.body.id}});

    //Remove the quote ID from the user's saved quotes.
    await userModel.findOneAndUpdate({username: username}, {$pull: {savedQuotes: req.body.id}})

    //Delete successful.
    res.status(200).json({ message: "Success" });
  
  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Merge Quotes Route
app.post("/MergeQuotes", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the current user.
  const username = req.session.currentuser;

  //Parse the quote IDs.
  req.body.ids = JSON.parse(req.body.ids);

  //Get quotes and merge them.
  try{
    //Find the quotes.
    const savedQuotes = await quoteModel.find({_id: {$in: req.body.ids}});

    //Merge the quotes.
    let mergedQuote = [];

    //Loop through the quotes.
    for(let i = 0; i < savedQuotes.length; i++){
      //Get the quote.
      mergedQuote = mergedQuote.concat(savedQuotes[i].subtasks);
    }

    //Create the quote data.
    const newQuote = new quoteModel({
      "name": req.body.name,
      "subtasks": mergedQuote,
    });

    //Save the quote.
    await newQuote.save();

    //Get the quote ID.
    const quoteID = newQuote._id;

    //Add the quote ID to the user's saved quotes.
    await userModel.findOneAndUpdate({username: username}, {$push: {savedQuotes: quoteID}})

    //Delete the old quotes.
    await quoteModel.deleteMany({_id: {$in: req.body.ids}});

    //Remove the quote ID from the user's saved quotes.
    await userModel.findOneAndUpdate({username: username}, {$pullAll: {savedQuotes: req.body.ids}})

    //Merge successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Calculator Route
app.post("/Calculator", express.urlencoded({
  extended: true
}), async (req, res) => {

  try{
    //Get the rates.
    const rates = await rateModel.find({});

    //Get project quote data from the form.
    let totalCost = calculateQuote(req.body, rates[0]);

    //Return the total cost.
    res.status(200).json({ message: "Success", cost: totalCost });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Update Rate Route
app.post("/UpdateRate", express.urlencoded({
  extended: true
}), async (req, res) => {
  //Check if the user is logged in.
  checkLoggedIn(req, res);

  //Get the user data from the form.
  let rateData = {
    "junior": req.body.junior,
    "standard": req.body.standard,
    "senior": req.body.senior,
  }

  try{
    //Get the current rate.
    const rate = (await rateModel.find({}))[0];

    //Update the rate.
    await rateModel.findOneAndUpdate({_id: rate._id}, rateData)

    //Update successful.
    res.status(200).json({ message: "Success" });

  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

/*---Functions---*/

//Function to check if the user is logged in.
function checkLoggedIn(req, res){
  if(!req.session.loggedIn){
    res.redirect("/");
    return
  }
}

//Fuinction setup worker rate.
async function setupWorkerRate(){
  //Set the worker rates.
  let workerRateData = {
    "junior": 10,
    "standard": 20,
    "senior": 30
  }

  //Create the model.
  const workerRate = new rateModel(workerRateData);

  try{
    const check = (await rateModel.find({junior: { $exists: true}})).length;

    //Check if the worker rate already exists.
    if(check === 0){
      //Save the worker rates.
      workerRate.save();
    }
  } catch(error){
    console.error(error);
  }
}

/*---Start Server---*/

//Database Connection
mongoose.connect(process.env.DB_HOST ?? "").then(() => {
  console.log("Connecting to database...");

  //Add the worker rate to the database.
  setupWorkerRate();

  //Start Server
  app.listen(app.get("port"), () => console.log(`Listening on: http://localhost:${app.get("port")}`));

}).catch(error => console.error(error));