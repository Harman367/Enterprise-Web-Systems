//Imports
import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import session from "express-session";

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

//Setup Database
let db;

/*---Get Routes---*/

//Root Route
app.get("/", (req, res) => {
  res.render("pages/Home");
});

//Account Route
app.get("/Account", (req, res) => {
  res.render("pages/Account");
});

//Admin Route
app.get("/Admin", (req, res) => {
  res.render("pages/Admin");
});


/*---Post Routes---*/

//Login Route
app.post("/Login", express.urlencoded({
  extended: true
}), (req, res) => {

  //Get the username and password from the form.
  const username = req.body.username;
  const password = req.body.password;

  
  db.collection("users").findOne({username: username, password: password}).then(result => {
    //Check if the user exists.
    if(!result){
      res.status(401).json({ message: "Failed" });

    } else{
      //Set the session variables.
      req.session.loggedIn = true;
      req.session.currentuser = username;
      req.session.admin = result.admin;

      //Login successful.
      res.status(200).json({ message: "Success" });
    }
  }).catch(error => console.error(error));
});

//Register Route
app.post("/Register", express.urlencoded({
  extended: true
}), (req, res) => {
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
  db.collection("users").findOne({username: userData.username}).then(result => {
    if(result){
      res.status(401).json({ message: "Failed" });
    } else{
      //Insert the user into the database.
      db.collection("users").insertOne(userData).then(result => {
        res.status(200).json({ message: "Success" });
      }).catch(error => console.error(error));
    }
  }).catch(error => console.error(error));
});


/*---Start Server---*/

//Database Connection
MongoClient.connect(process.env.DB_HOST ?? "").then(database => {
  console.log("Connecting to database...");
  db = database;

  //Start Server
  app.listen(app.get("port"), () => console.log(`Listening on: http://localhost:${app.get("port")}`));

}).catch(error => console.error(error));