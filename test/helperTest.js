const chai = require("chai"); // 1
const assert = chai.assert;

const users = require("../db/users");
const urls = require("../db/urls");

const {
  getUserByEmail,
  getUserByUserId,
  userLogin,
  userRegister,
} = require("../helpers/user");

describe("#getUserByEmail()", function () {
  it("email - should return false if not valid user", function () {
    const email = "bob@bob.com";
    const userObj = {
      userId: "b2jd2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = getUserByEmail(email, users);
    assert.notEqual(validUser, userObj);
  });

  it("email - should return true if valid user.", function () {
    const email = "bob@bob.com";
    const userObj = {
      userId: "b2j2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = getUserByEmail(email, users);
    assert.equal(userObj, validUser);
  });
});

describe("#getUserByUserId()", function () {
  it("should return false if not valid user", function () {
    const userId = "b2j2jcc";
    const userObj = {
      userId: "b2j2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = getUserByUserId(userId, users);
    assert.notEqual(validUser, userObj);
  });

  it("should return true if valid user.", function () {
    const userId = "b2j2j2";
    const userObj = {
      userId: "b2j2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = getUserByUserId(userId, users);
    assert.equal(userObj, validUser);
  });
});


describe("#userRegister()", function () {
  it("should return false if not valid user", function () {
    const email = "aingarant@me.com";
    const password = "aingaran";
    const userObj = {
      userId: "b2j2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = userRegister(email, password, users);
    assert.notEqual(validUser, userObj);
  });

  it("should return true if valid user.", function () {
    const email = "test@me.com";
    const password = "aingaran";
    const userObj = {
      userId: "b2j2j2",
      email: "bob@bob.com",
      password: "aingaran",
    };
    const validUser = userRegister(email, password, users);
    assert.equal(userObj, validUser);
  });
});
