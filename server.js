require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const app = express();

const port = process.env.PORT || 8080;

const {
  getUserByEmail,
  getUserByUserId,
  userLogin,
  userRegister,
} = require("./helpers/user");

const { getMyUrls, shortenUrl, getUrlById } = require("./helpers/url");

// data files (database)
const users = require("./db/users");
const urls = require("./db/urls");

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["uid"],
  })
);

// error mesage placeholder
let message = "";
let email = "";
let user = "";
let userId = null;

// get routes.
app.get("/", (req, res) => {
  userId = req.session.userId;

  if (!userId) {
    req.session = null;
  }

  user = getUserByUserId(userId, users);

  if (!user) {
    req.session = null;
  }

  if (user) {
    email = user.email;
  }

  const templateVars = {
    userId,
    email,
    message,
  };
  res.render("pages/index", templateVars);
});

app.get("/login", (req, res) => {
  userId = req.session.userId;
  if (userId) return res.redirect("/");

  const templateVars = {
    userId,
    email,
    message,
  };
  res.render("pages/user_login", templateVars);
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  userId = req.session.userId;
  if (userId) return res.redirect("/");

  const templateVars = {
    userId,
    email,
    message,
  };
  res.render("pages/user_register", templateVars);
});

app.get("/url/new", (req, res) => {
  userId = req.session.userId;

  if (!userId) {
    req.session = null;
    return res.redirect("/login");
  }

  user = getUserByUserId(userId, users);

  if (!user) {
    req.session = null;
    return res.redirect("/login");
  }

  const templateVars = {
    userId,
    email,
    message,
  };

  res.render("pages/urls_new", templateVars);
});

app.get("/url/:id/edit", (req, res) => {
  userId = req.session.userId;

  if (!userId) {
    req.session = null;
    return res.redirect("/login");
  }

  user = getUserByUserId(userId, users);

  if (!user) {
    req.session = null;
    return res.redirect("/login");
  }

  const id = req.params.id;

  if (urls[id].userId !== userId) {
    return res.send("nacho url!");
  }

  const longUrl = urls[id].longUrl;

  const templateVars = {
    userId: req.session.userId,
    id: id,
    longUrl: longUrl,
    shortUrl: id,
    email,
    message,
  };
  res.render("pages/urls_edit", templateVars);
});

app.get("/url/:id", (req, res) => {
  const id = req.params.id;

  if (!urls[id]) {
    return res.send(`URL not found.`);
  }

  userId = req.session.userId;

  if (!userId) {
    req.session = null;
    return res.redirect("/login");
  }

  user = getUserByUserId(userId, users);

  if (!user) {
    req.session = null;
    return res.redirect("/login");
  }

  if (urls[id].userId !== userId) {
    return res.send("nacho url!");
  }

  const longUrl = urls[id].longUrl;

  const templateVars = {
    userId,
    email,
    message,
    id: id,
    longUrl: longUrl,
  };
  res.render("pages/urls_show", templateVars);
});

// get - url - go to
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  const url = getUrlById(id, urls);

  if (!url) {
    return res.redirect("/");
  }

  res.redirect(url.longUrl);
});

// get - urls - show all
app.get("/urls", (req, res) => {
  userId = req.session.userId;

  if (!userId) {
    req.session = null;
    return res.redirect("/login");
  }

  user = getUserByUserId(userId, users);

  if (!user) {
    req.session = null;
    return res.redirect("/login");
  }

  const myUrls = getMyUrls(userId, urls);

  const templateVars = {
    urls: myUrls,
    userId,
    email,
    message,
  };
  console.log(templateVars);

  res.render("pages/urls_index", templateVars);
});

app.get("*", (req, res) => {
  // check if session cookie exists for userId
  userId = req.session.userId;

  if (!userId) {
    req.session = null;
  } else {
    user = getUserByUserId(userId, users);
  }

  if (!user) {
    req.session = null;
  } else {
    email = user.email;
  }

  const templateVars = {
    userId,
    email,
    message,
  };
  res.render("pages/page_not_found", templateVars);
});

/*
==========================================
POST ROUTES START HERE
==========================================
*/

// all post routes start here //
app.post("/login", (req, res) => {
  message = "";
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  user = userLogin(emailInput, passwordInput, users);

  if (!user) {
    const templateVars = {
      userId: null,
      message: "Invalid Login Details",
    };
    return res.render("pages/user_login", templateVars);
  }
  req.session.userId = user.userId;
  res.redirect("/");
});

// post - user - register
app.post("/register", (req, res) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (!emailInput || !passwordInput) {
    const templateVars = {
      userId: req.session.userId,
      message: "Email & Password fields must be filled out.",
    };
    return res.render("pages/user_register", templateVars);
  }

  // verify if user exists.
  user = getUserByEmail(emailInput, users);
  if (user) {
    const templateVars = {
      userId: "",
      message: "User is already registered. Please <a href='/login'>Login</a>.",
    };

    return res.render("pages/user_register", templateVars);
  }

  const newUser = userRegister(emailInput, passwordInput, users);
  if (!newUser) return res.render("Somethign went wrong during registration");

  req.session.userId = newUser.userId;

  res.redirect("/urls");
});

app.post("/url/new", (req, res) => {
  userId = req.session.userId;

  if (!userId) {
    return res.send(`Sorry, you need to be logged in.`);
  }

  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urls[shortUrl] = {
    longUrl,
    shortUrl,
    userId,
  };
  res.redirect(`/url/${shortUrl}`);
});

app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urls[id];
  res.redirect(`/urls`);
});

app.post("/url/:id/edit", (req, res) => {
  userId = req.session.userId;
  const { id, newUrl } = req.body;
  urls[id] = { shortUrl: id, longUrl: newUrl, userId: userId };
  res.redirect(`/url/${id}`);
});

// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});
