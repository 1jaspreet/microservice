const verifyToken = (req, res, next) => {
    try {
        //const token =   req.body.token || req.query.token || req.headers['x-access-token'] ;
        const token = ((req.headers.authorization).split(' '))[1];
        if (!token) {
            return res.status(403).send('A token is required for authentication');
        } else {
            const jwt = require('jsonwebtoken');
            const auth = jwt.verify(token, req.ENV.JWT_TOKEN);
            // console.log("test", test)
            req.auth = auth;
        }
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
}

module.exports = verifyToken;