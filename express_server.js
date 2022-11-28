require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser")
const app = express();
const port = process.env.PORT || 8181;
const shortenUrl = require("./helpers/shortenUrl");
require("./helpers/createUser");

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
  const templateVars= {username: ''}
  res.render("pages/index", templateVars);
});


//auth
app.post("/login", (req, res) => {
  const {username} = req.body;
  res.cookie('username', username, { expires: new Date(Date.now() + 900000), httpOnly: true });
  res.send("cookie")

});

app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect("/")
});

app.get("/register", (req, res) => {
  new User;
  res.render("pages/register")

})

app.post("/register", (req, res) => {

})




app.get("/url/new", (req, res) => {
  res.render("pages/urls_new");
});

app.post("/url/new", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/url/${shortUrl}`)
  // res
  //   .status(201)
  //   .send(
  //     `Long Url: ${longUrl} and Short Url: http://localhost:8181/url/${shortUrl}`
  //   );
});

app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urlDatabase[id];
  res.send(urlDatabase)
  console.log(urlDatabase);
});

app.post("/url/:id/edit", (req, res) => {
  const {id, newUrl} = req.body;
  urlDatabase[id] = newUrl;
  res.redirect(`/url/${id}`)
  // console.log(urlDatabase);
});

app.get("/url/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = { username: username, id: id, longURL: urlDatabase[id] };
  res.render("pages/urls_edit", templateVars);
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
