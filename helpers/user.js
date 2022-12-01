const users = require("../db/users");
const bcrypt = require("bcryptjs");


const createUserId = () => Math.random().toString(36).substring(2, 8);

const getUserByUserId = (userId, users) => {
  let user = null;
  for (const userId in users) {
    if (userId === users[userId].userId) user = users[userId];
  }
  return user;
};

const getUserByEmail = (email, users) => {
  let user = null;
  for (const userId in users) {
    if (email === users[userId].email) user = users[userId];
  }
  return user;
};

const userLogin = (email, password, users) => {
  let user = null;
  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return (user = null);
  }

  return bcrypt.compare(password, foundUser.password)
    ? (user = foundUser)
    : (user = null);
};

const userRegister = (email, password, users) => {
  // verify if user exists.

  // create new userId/
  const userId = createUserId();

  const hashedPassword = bcrypt.hashSync(password, 10);

  // add user to users object.
  const newUser = users[userId] = {
    userId: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
  };

  return newUser;

};

module.exports = {
  getUserByEmail,
  getUserByUserId,
  userLogin,
  userRegister,
  createUserId
};
