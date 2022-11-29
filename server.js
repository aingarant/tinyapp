require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 8080;
const shortenUrl = require("./helpers/shortenUrl");
const createUserId = require("./helpers/createUserId");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };

  res.render("pages/index", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("pages/user_login", templateVars);
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true,
  });
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

app.get("/register", (req, res) => {
  if (req.cookies["username"]) {
    res.redirect("/login");
  }
  const templateVars = {
    username: req.cookies["username"],
  };

  res.render("pages/user_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("email and password fields cannot be empty.");
  }

  // check if user exists in database.

  const userId = createUserId();

  for (const key in users) {
    if (email === users[key].email) {
      return res.send(`${email} already resgistered.`);
    }
  }

  users[userId] = {
    userId: userId,
    email: email,
    password: password,
  };

  res.cookie("username", email, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true,
  });

  res.cookie("user_id", userId, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true,
  });

  res.redirect("/urls");
});

app.get("/url/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("pages/urls_new", templateVars);
});

app.post("/url/new", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/url/${shortUrl}`);
});

app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/url/:id/edit", (req, res) => {
  const { id, newUrl } = req.body;
  urlDatabase[id] = newUrl;
  res.redirect(`/url/${id}`);
});

app.get("/url/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    username: req.cookies["username"],
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("pages/urls_edit", templateVars);
});

app.get("/url/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    username: req.cookies["username"],
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("pages/urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };

  if (!req.cookies["username"]) {
    res.redirect("/login");
  }
  res.render("pages/urls_index", templateVars);
});

// 404 page.
app.get("*", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("pages/page_not_found", templateVars);
});

// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});
