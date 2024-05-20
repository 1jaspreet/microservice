const express = require("express");
const router = express.Router();
const { verifyToken } = require("../app/middlware");

router.use("/", require("./web"));
router.use("/web", verifyToken, require("./web"));
router.use("/admin", verifyToken, require("./admin"));
router.use("/migration", verifyToken, require("./migration"));
router.use("/api", verifyToken, require("./api"));

// COMMON API 
router.use("/auth", require("./auth"));

router.get("/pmshri-list", (req, res) => {
    let response = {
        data: {
            item: [
                {
                    id: 1,
                    name: 'order-1'
                },
                {
                    id: 2,
                    name: 'order-2'
                }
            ]
        }
    };
    res.status(200).json({ response, msg: "pmShridata" });
});
// PM SHRI ROUTES
router.use("/pmshriapi", verifyToken, require("./pmshri"));
router.use("/pmshriauth", require("./pmshriAuth"));

module.exports = router;
