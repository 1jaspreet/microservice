const express = require("express");
const routers = express.Router();

// routers.use("/pmshri/", require("../app/controllers/pmshri/pmshriController"));
// routers.use("/reports/", require("../app/controllers/Masters/ReportsController"));


// routers.use("/pmshriuser/", require("../app/controllers/pmshri/pmshriAdminUserController"));
routers.use("/admin-users/", require("../app/controllers/Users/pmshriAdminUserController"));

// routers.use("/support/", require("../app/controllers/Support/support"));

module.exports = routers;
