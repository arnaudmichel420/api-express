const express = require("express");
const router = express.Router();
const fs = require("fs");

/* GET home page. */
router.get("/exo2", async (req, res, next) => {
  return res.send("home");
});

module.exports = router;
