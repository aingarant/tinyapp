const urls = require("../db/urls");

const shortenUrl = () => Math.random().toString(36).substring(2, 8);

const getUrlById = (shortUrl, urls) => {
  let foundUrl = null;
  for (const urlId in urls) {
    if (urls[urlId].shortUrl === shortUrl) {
      foundUrl = urls[urlId];
    }
  }
  return foundUrl;
};

const urlsForUser = (userId) => {
  let myUrls = [];

  for (const urlId in urls) {
    if (urls[urlId].userId === userId) {
      myUrls.push(urls[urlId]);
    }
  }

  return myUrls;
};

module.exports = {
  getUrlById,
  shortenUrl,
  urlsForUser,
};
