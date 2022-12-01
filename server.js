require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const app = express();
const bcrypt = require("bcryptjs");

const port = process.env.PORT || 8080;

const {
  getUserByEmail,
  getUserByUserId,
  userLogin,
  userRegister,
} = require("./helpers/user");

const { getMyUrls } = require("./helpers/url");

// helper functions
const shortenUrl = require("./helpers/shortenUrl");
const createUserId = require("./helpers/createUserId");

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

// const getUserByUserId = (userId, users) => {
//   let user = null;
//   for (const userId in users) {
//     if (userId === users[userId].userId) user = users[userId];
//   }
//   return user;
// };

// const getUserByEmail = (email, users) => {
//   let user = null;
//   for (const userId in users) {
//     if (email === users[userId].email) user = users[userId];
//   }
//   return user;
// };

// const login = (email, password, users) => {
//   let user = null;
//   const foundUser = getUserByEmail(email, users);
//   if (!foundUser) {
//     return (user = null);
//   }

//   return bcrypt.compare(password, foundUser.password)
//     ? (user = foundUser)
//     : (user = null);
// };

// const getMyUrls = (userId, urls) => {
//   let myUrls = [];

//   for (urlId in urls) {
//     if (urls[urlId].userId === userId) {
//       myUrls.push(urls[urlId]);
//     }
//   }

//   return myUrls;
// };

/*
==========================================
GET ROUTES START HERE
==========================================
*/

// get - home page
app.get("/", (req, res) => {
  const userId = req.session.userId;
  const user = getUserByUserId(userId, users);
  const templateVars = {
    userId: userId,
    email: user.email,
    message: message,
    user,
  };
  res.render("pages/index", templateVars);
});

// get - user - login
app.get("/login", (req, res) => {
  const userId = req.session.userId;
  if (userId) return res.redirect("/");

  const templateVars = {
    userId: userId,
    message: "",
  };
  res.render("pages/user_login", templateVars);
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// get - user - register
app.get("/register", (req, res) => {
  const userId = req.session.userId;
  if (userId) return res.redirect("/");

  const templateVars = {
    userId: "",
    message: "",
  };

  res.render("pages/user_register", templateVars);
});

// get - url - new
app.get("/url/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.redirect("/login");

  const user = getUserByUserId(userId, users);

  const templateVars = {
    userId: userId,
    email: user.email,
    message: message,
    user,
  };

  res.render("pages/urls_new", templateVars);
});

// get - url - edit
app.get("/url/:id/edit", (req, res) => {
  const id = req.params.id;
  const longUrl = urls[id].longUrl;

  const templateVars = {
    userId: req.session.userId,
    id: id,
    longUrl: longUrl,
    shortUrl: id,
    message: "",
    email: "",
  };
  res.render("pages/urls_edit", templateVars);
});

// get - url - view
app.get("/url/:id", (req, res) => {
  const id = req.params.id;

  if (!urls[id]) {
    return res.send(`URL not found.`);
  }

  // validate if the url belongs to me
  // isItMyUrl(url)
  const userId = req.session.userId;

  if (urls[id].userId !== userId) {
    return res.send("nacho url!");
  }

  const longUrl = urls[id].longUrl;
  const user = getUserByUserId(userId, users);

  const templateVars = {
    message: "",
    user: user,
    userId: userId,
    email: user.email,
    id: id,
    longUrl: longUrl,
  };
  res.render("pages/urls_show", templateVars);
});

// get - url - go to
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = urls[id].longUrl;
  res.redirect(longUrl);
});

// get - urls - show all
app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect("/login");
  }

  const myUrls = getMyUrls(userId, urls);
  const user = getUserByUserId(userId, users);

  const templateVars = {
    message: "",
    urls: myUrls,
    user: user,
    userId: userId,
    email: user.email,
  };
  console.log(templateVars);

  res.render("pages/urls_index", templateVars);
});

app.get("/admin/users", (req, res) => {
  res.json(users);
});

app.get("/admin/urls", (req, res) => {
  res.json(urls);
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
  message = "";
  const { email, password } = req.body;
  const user = userLogin(email, password, users);

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
  const { email, password } = req.body;

  if (!email || !password) {
    const templateVars = {
      userId: req.session.userId,
      message: "Email & Password fields must be filled out.",
    };
    return res.render("pages/user_register", templateVars);
  }

  // verify if user exists.
  const user = getUserByEmail(email, users);
  if (user) {
    const templateVars = {
      userId: "",
      message: "User is already regsitered. Please <a href='/login'>Login</a>",
    };

    return res.render("pages/user_register", templateVars);
  }
  // create new userId/

  /*
  const userId = createUserId();

  const hashedPassword = bcrypt.hashSync(password, 10);

  // add user to users object.
  users[userId] = {
    userId: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
  };

  */

  const newUser = userRegister(email, password, users);
  if (!newUser) return res.render("Somethign went wrong during registration");


  req.session.userId = newUser.userId;

  res.redirect("/urls");
});

// post - url - new
app.post("/url/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.send(`Sorry, you need to be logged in.`);
  }

  const longUrl = req.body.longUrl;
  const shortUrl = shortenUrl();
  urls[shortUrl] = {
    longUrl,
    shortUrl,
    userId: userId,
  };
  res.redirect(`/url/${shortUrl}`);
});

//post - url - delete
app.post("/url/:id/delete", (req, res) => {
  const id = req.body.id;
  delete urls[id];
  res.redirect(`/urls`);
});

// post - url - edit
app.post("/url/:id/edit", (req, res) => {
  const userId = req.session.userId;
  const { id, newUrl } = req.body;
  urls[id] = { shortUrl: id, longUrl: newUrl, userId: userId };
  res.redirect(`/url/${id}`);
});

/*
==========================================
POST ROUTES END HERE
==========================================
*/

/*
==========================================
404 page route start
==========================================
*/
app.get("*", (req, res) => {
  let email = "";
  const templateVars = {
    userId: req.session.user_id,
    email: email,
  };
  res.render("pages/page_not_found", templateVars);
});
/*
==========================================
404 page route end
==========================================
*/

// set the listening port.
app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});
