require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 8181;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// set the view engine to ejs
app.set('view engine', 'ejs');



app.get("/", (req, res) => {
  res.render('pages/index');
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get("/url/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {id: id, longURL: urlDatabase[id]};
  res.render("pages/urls_show", templateVars);
});


// 
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("*", (req, res) => {
  res.send("404 page.")
});


// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});