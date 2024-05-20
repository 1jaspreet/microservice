const express = require("express");
const { PassThrough } = require("nodemailer/lib/xoauth2");
const routers = express.Router();
const Handler = require("../../handlers").pmshriAdminUserHandler;
const Password = require("../../handlers").Password;

routers.post("/", async (req, res) => {
    return await Handler.index(req, res);
});

routers.post("/create", async (req, res) => {
    return await Handler.create(req, res);
});

routers.post("/update", async (req, res) => {
    return await Handler.update(req, res);
});

routers.post("/update-status", async (req, res) => {
    return await Handler.updateStatus(req, res);
});

// routers.post("/user-per", async (req, res) => {
//     return await Handler.userPer(req, res);
// });

routers.post("/change/password", async (req, res) => {
    return await Password.changePassword(req, res);
});

// routers.post("/profile-update", async (req, res) => {
//     return await Handler.profileUpdate(req, res);
// });

// routers.post("/approve", async (req, res) => {
//     return await Handler.approve(req, res);
// });

// routers.post("/update-status", async (req, res) => {
//     return await Handler.updateStatus(req, res);
// });

routers.post("/find-user", async (req, res) => {
    return await Handler.findById(req, res);
});

// routers.post("/find-user-by-role", async (req, res) => {
//     return await Handler.findUserByRole(req, res);
// });

// routers.post("/find-user-by-email", async (req, res) => {
//     return await Handler.findByEmail(req, res);
// });

// routers.post("/find-user-by-mobile", async (req, res) => {
//     return await Handler.findByMobile(req, res);
// });

// routers.post("/find-user-by-udise", async (req, res) => {
//     return await Handler.findByUdiseCode(req, res);
// });

// routers.post("/generate-link", async (req, res) => {
//     return await Handler.generateLink(req, res);
// });

// routers.post("/dashboard", async (req, res) => {
//     return await Handler.dashboard(req, res);
// });

// routers.post("/financial-status", async (req, res) => {
//     return await Handler.dashboardFinancialStatus(req, res);
// });

// routers.post("/get-logged-users-data", async (req, res) => {
//     return await Handler.loggedUsersList(req, res);
// });

module.exports = routers;
