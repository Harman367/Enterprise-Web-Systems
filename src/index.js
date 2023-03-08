//Imports
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import userModel from "./models/user.js";

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
  if(!req.session.loggedIn){
    res.redirect("/");
    return
  }

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

    console.log(user)

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


/*---Post Routes---*/

//Login Route
app.post("/Login", express.urlencoded({
  extended: true
}), async (req, res) => {

  //Get the username and password from the form.
  const username = req.body.username;
  const password = req.body.password;

  //Check if the user exists.
  try{
    const user = await userModel.findOne({username: username});

    //Check if the user exists.
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
    req.session.currentuser = username;
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

  //Check if the username is already taken.
  const user = new userModel(userData);
  try{
    await user.save()
    res.status(200).json({ message: "Success" });
  } catch(error){
    res.status(401).json({ message: "Failed" });
    console.error(error);
  }
});

//Logout Route
app.get("/Logout", (req, res) => {
  //Destroy the session.
  req.session.destroy();

  //Redirect to the home page.
  res.redirect("/");
});


/*---Start Server---*/

//Database Connection
mongoose.connect(process.env.DB_HOST ?? "").then(() => {
  console.log("Connecting to database...");

  //Start Server
  app.listen(app.get("port"), () => console.log(`Listening on: http://localhost:${app.get("port")}`));

}).catch(error => console.error(error));