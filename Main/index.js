const express = require("express");
const app = express();
const parser = require("body-parser");

//const Reader = require("@maxmind/geoip2-node").Reader;

const cors = require("cors");
const path = require("path");
const Hash = require("./app/libraries/hash");

const env = require("./config/env");

/* const restrictToIndia = async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    if (ipAddress !== "::1") {
      Reader.open("GeoLite2-Country.mmdb").then((reader) => {
        const response = reader.country(ipAddress);
        if (response.country.isoCode === "IN") {
          next();
        } else {
          res.status(403).send("Access Forbidden");
        }
      });
    } else {
      next();
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}; */

//app.use(restrictToIndia);
app.use(express.json({ limit: "100mb" }));
app.use("/public", express.static("public"));
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://localhost:5001",
      "http://localhost:3000",
      "http://localhost:4003",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

var modifyRequest = function (req, res, next) {
  req.ENV = env;
  if (req.body.secure != null && req.body.secure != undefined) {
    req.body = JSON.parse(Hash.decrypt(req.body.secure));
  }
  next();
};

app.use(modifyRequest);
app.use("/", require("./routes/router"));

app.use(async (req, res) => {
  return res.status(400).send("invalid URL.");
});

app.listen(4005, () => {
  console.log(`App is running on ${"4005"}`);
});
