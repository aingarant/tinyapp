const urls = require("../db/urls");

const shortenUrl = () => Math.random().toString(36).substring(2, 8);

const getMyUrls = (userId, urls) => {
  let myUrls = [];

  for (const urlId in urls) {
    if (urls[urlId].userId === userId) {
      myUrls.push(urls[urlId]);
    }
  }

  return myUrls;
};

module.exports = {
  getMyUrls,
  shortenUrl
};
