const express = require("express");
const router = express.Router();

router.get("/add", (req, res)=>
{
  res.send(`this is the url add route.`)
})

module.exports = router;