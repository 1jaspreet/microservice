const express = require("express");
const routers = express.Router();
//const Helper = require("../../helpers/Helper");
const Handler = require("../../handlers").Masteryear;
//const Validate = require("../../validation").Masteryear;

routers.post("/", async (req, res) => {
  return await Handler.index(req, res);
});

routers.get("/list", async (req, res) => {
  return await Handler.list(req, res);
});

module.exports = routers;
