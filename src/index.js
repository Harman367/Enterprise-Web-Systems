//Imports
import "dotenv/config";
import express from "express";

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

//Login Route
app.get("/Login", (req, res) => {

});

//Register Route
app.get("/Register", (req, res) => {

});

//Start Server
app.listen(app.get("port"), () => console.log(`Listening... http://localhost:${app.get("port")}`));