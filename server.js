require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const bcrypt = require("bcryptjs");

const port = process.env.PORT || 8080;
const shortenUrl = require("./helpers/shortenUrl");
const createUserId = require("./helpers/createUserId");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "",
  },
};

const users = {
  userRandomID: {
    userId: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    userId: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// helper functions
const getUserByUserId = (userId) => {
  let user = "";
  for (const key in users) {
    if (userId === users[key].userId) {
      user = users[key];
    }
  }
  return user;
};

const getUserByEmail = (email) => {
  let user = "";
  for (const key in users) {
    if (email.toLowerCase() === users[key].email) {
      user = users[key];
    }
  }
  return user;
};

const login = (email, password) => {
  let user = "";
  for (const key in users) {
    if (
      email.toLowerCase() === users[key].email &&
      password === users[key].email
    ) {
      user = users[key];
    }
  }
  return user;
};

const register = (email, password) => {};

const hasMyPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}


const getMyUrls = (userId) => {
  let urls = "";

  return urls;
}



app.set("view engine", "ejs");

/*
==========================================
GET ROUTES START HERE
==========================================
*/

// get - home page
app.get("/", (req, res) => {
  const templateVars = {
    userId: req.cookies["user_id"],
  };

  res.render("pages/index", templateVars);
});

// get - user - login
app.get("/login", (req, res) => {
  const templateVars = {
    userId: req.cookies["user_id"],
  };
  res.render("pages/user_login", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
});

// get - user - register
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const templateVars = {
    userId: req.cookies["user_id"],
  };

  res.render("pages/user_register", templateVars);
});

// get - url - new
app.get("/url/new", (req, res) => {
  const templateVars = {
    userId: req.cookies["user_id"],
  };

  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("pages/urls_new", templateVars);
});

// get - url - edit
app.get("/url/:id/edit", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    userId: req.cookies["user_id"],
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("pages/urls_edit", templateVars);
});

// get - url - view
app.get("/url/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    userId: req.cookies["user_id"],
    id: id,
    longURL: urlDatabase[id],
  };
  res.render("pages/urls_show", templateVars);
});

// get - url - go to
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// get - urls - show all
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userId: req.cookies["user_id"] };
  console.log(templateVars);

  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("pages/urls_index", templateVars);
});

app.get("/admin/users", (req, res) => {
  res.send(`${JSON.stringify(users)}`);
});

/*
==========================================
GET ROUTES END HERE
==========================================
*/

/*
==========================================
POST ROUTES START HERE
==========================================
*/

// all post routes start here //
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = login(email, password);
  if (!user) {
    return res.status(401).send("Login Error.");
  }

  res.cookie("user_id", users[key], {
    expires: new Date(Date.now() + 900000),
    httpOnly: true,
  });
  res.redirect("/");
});

// post - user - logout


// post - user - register
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // check if input fields are empty.
  if (!email || !password) {
    return res.status(400).send("email and password fields cannot be empty.");
  }

  // verify if user exists.
  const user = getUserByEmail(email);
  if (user) {
    return res.status(401).send(`User already regsitered.`);
  }
  // create new userId/
  const userId = createUserId();

  // add user to users object.
  users[userId] = {
    userId: userId,
    email: email.toLowerCase(),
    password: password,
  };

  res.cookie("user_id", userId, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true,
  });

  res.redirect("/urls");
});

// post - url - new
app.post("/url/new", (req, res) => {
  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`/url/${shortUrl}`);
});

//post - url - delete
app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

// post - url - edit
app.post("/url/:id/edit", (req, res) => {
  const { id, newUrl } = req.body;
  urlDatabase[id] = newUrl;
  res.redirect(`/url/${id}`);
});

/*
==========================================
POST ROUTES END HERE
==========================================
*/

/*
==========================================
404 page route
==========================================
*/
app.get("*", (req, res) => {
  const templateVars = {
    userId: req.cookies["user_id"],
  };
  res.render("pages/page_not_found", templateVars);
});
/*
==========================================
404 page route
==========================================
*/

// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});
