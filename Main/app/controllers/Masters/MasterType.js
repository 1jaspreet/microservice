const express = require("express");
const routers = express.Router();
const Helper = require("../../helpers/Helper");
const Handler = require("../../handlers").Mastertype;
const Validate = require("../../validation").Mastertype;

routers.post("/create", Validate.create(), (req, res) => {
  const error = Helper.validate(req, res);
  return error != null ? error : Handler.create(req, res);
});
routers.post("/", async (req, res) => {
  return await Handler.index(req, res);
});

routers.post("/getalltypecode", async (req, res) => {
  return await Handler.getalltypecode(req, res);
});
routers.post("/update", async (req, res) => {
  return await Handler.update(req, res);
});
routers.post("/updateall", async (req, res) => {
  return await Handler.updateAll(req, res);
});
routers.post("/getmasterbyid", async (req, res) => {
  return await Handler.findById(req, res);
});

routers.post("/getmastertypedetail", async (req, res) => {
  return await Handler.MasterTypefindById(req, res);
});

module.exports = routers;
