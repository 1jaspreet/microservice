const express = require("express");
const router = express.Router();
const { verifyToken } = require("../app/middlware");

// router.use("/", require("./web"));
// router.use("/web", verifyToken, require("./web"));
// router.use("/admin", verifyToken, require("./admin"));
// router.use("/migration", verifyToken, require("./migration"));
// router.use("/api", verifyToken, require("./api"));

// COMMON API 
// router.use("/auth", require("./auth"));

// PM SHRI ROUTES
router.use("/pmshriapi", verifyToken, require("./pmshri"));
// router.use("/pmshriauth", require("./pmshriAuth"));

module.exports = router;
