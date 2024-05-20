const setRateLimit = require("express-rate-limit");
const env = require("../../config/env");

const OtpRateLimit = setRateLimit({
        windowMs: 2 * 60 * 1000,
        limit: 1, 
        headers: true,
        message: (req, res)=> {
            const {mobile} = req.body;
            return res.status(200).json({ 
                message: `Oops, OTP already sent on mobile number ${mobile.substr(0, 3)} ***** ${mobile.substr(7, 3)}`
            });
        }
});

module.exports = OtpRateLimit;