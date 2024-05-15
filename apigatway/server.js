const gateway = require("fast-gateway");

const port = 4003;
const server = gateway({
    routes: [
        {
            prefix: "",
            target: "http://localhost:4000/",
          
            hooks: {}
        },
        {
            prefix: "/PmShridata",
            target: "http://localhost:3002/",
            hooks: {}
        }
    ]
});

server.get('/mytesting', (req, res) => {
  
    res.send("Gateway Called");
})

server.start(port).then(server => {
    console.log("Gateway is running " + port);
})