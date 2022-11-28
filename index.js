require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const port = process.env.PORT || 8181;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.listen(port, (req, res) => {
  console.log(`Web server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("welcome to my server.");
});
