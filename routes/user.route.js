const express = require("express");
const router = express.Router();

// get routes
router.get("/register", (req, res) => {});
router.get("/login", (req, res) => {});
router.get("/profile", (req, res) => {});

// post routes
router.post("/register", (req, res) => {});
router.post("/login", (req, res) => {});
router.post("/logout", (req, res) => {});
router.post("/profile", (req, res) => {});

router.get("*", (req, res) => {});

module.exports = router;
