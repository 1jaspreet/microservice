const express = require("express");
const app = express();

const port = 3002 ;
app.get("/pmshri-list", (req,res)=>{
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
    res.status(200).json({response,msg:"pmShridata"});
});
app.get("/", (req,res)=>{
    res.send("Order called");
});

app.listen(port, ()=>{
    console.log("Listening at localhost "+ port);    
})