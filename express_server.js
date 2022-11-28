require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 8181;
const shortenUrl = require("./helpers/shortenUrl");
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// set the view engine to ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/url/new", (req, res) => {
  res.render("pages/urls_new");
});

app.post("/url/new", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urlDatabase[shortUrl] = longUrl;
  res
    .status(201)
    .send(
      `Long Url: ${longUrl} and Short Url: http://localhost:8181/url/${shortUrl}`
    );
});

app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urlDatabase[id];
  res.send(urlDatabase)
  console.log(urlDatabase);


});

app.get("/url/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = { id: id, longURL: urlDatabase[id] };
  res.render("pages/urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get("*", (req, res) => {
  res.send("404 page.");
});

// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});
