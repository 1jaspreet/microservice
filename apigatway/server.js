const gateway = require("fast-gateway");
const cors = require('cors');
const bodyParser = require('body-parser');

const findValidToken = (req, res, next) => {
    const tokenId = req.headers['apikey']
    try {
        if (tokenId && tokenId === '123456') {
            next();
        } else {
            res.statusCode = 401;
            res.end("wrong");
        }
    } catch (error) {
        res.status(500).send("catch");
    }
};

const port = 4003;
const server = gateway({
    middlewares: [
        cors({
            origin: 'http://localhost:3000', // Adjust this to specify allowed origins
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204
        }),
        bodyParser.json(), // Use body-parser middleware to parse JSON
        findValidToken
    ],
    routes: [
        {
            prefix: "userapi",
            target: "http://localhost:4000/",
            hooks: {}
        },
        {
            prefix: "pmshri",
            target: "http://localhost:4005/",
            hooks: {}
        },
        {
            prefix: "PmShridata",
            target: "http://localhost:3002/",
            hooks: {}
        }
    ]
});

server.get('/mytesting', (req, res) => {
    res.send("Gateway Called");
});

server.start(port).then(server => {
    console.log("Gateway is running on port " + port);
});