const crypto = require("crypto");
const fs = require("fs");
const fetchApi = require("node-fetch");
const CryptoJS = require("crypto-js");
const { JSEncrypt } = require("nodejs-jsencrypt");

const ALGO = "aes-256-ecb";

exports.handle = (req, callback) => {
  return getAuthenticatedSek(req, (result) => {
    if (result.status) {
      return callAPI(req, result.data, (response) => {
        if (response.status) {
          callback({ status: true, data: response.data });
        } else {
          callback({ status: false, message: response.errorDetails.message });
        }
      });
    } else {
      if (!result.status) {
        callback({ status: false, message: result.errorDetails.message });
      }
    }
  });
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const appKey = crypto.randomBytes(32).toString("base64");

const getPublicKey = (req) => {
  const PublicKey = crypto
    .createPublicKey(fs.readFileSync(req.ENV.API_CERT_PATH))
    .export({ type: "spki", format: "pem" });
  return PublicKey.replace("-----BEGIN PUBLIC KEY-----\n", "").replace(
    "\n-----END PUBLIC KEY-----\n",
    ""
  );
};

const getBase64 = (req) => {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(
      JSON.stringify({
        clientId: req.ENV.API_CLIENT_ID,
        clientSecret: req.ENV.API_CLIENT_SECRET,
        appKey: appKey,
      })
    )
  );
};

const geHexString = (req) => {
  const RSAEncrypt = new JSEncrypt();
  RSAEncrypt.setPublicKey(getPublicKey(req));
  const RSAEncryptText = RSAEncrypt.encrypt(getBase64(req));
  const RSAEncryptTextBase64 = CryptoJS.enc.Base64.parse(RSAEncryptText);
  return JSON.stringify({
    data: RSAEncryptTextBase64.toString(CryptoJS.enc.Hex),
  });
};

const getAuthenticatedSek = (req, callback) => {
  const options = {
    method: "POST",
    body: geHexString(req),
    headers: { "Content-Type": "application/json" },
  };
  return fetchApi(req.ENV.API_AUTHENTICATION, options)
    .then((response) => response.text())
    .then((result) => {
      callback(JSON.parse(result));
    })
    .catch((err) => {
      callback(err);
    });
};

const decodeString = (string) => {
  return Buffer.from(string, "base64").toString("utf8");
};

const getEncryptedString = (req, decryptedKey) => {
  const decodedKey = Buffer.from(decryptedKey, "base64");
  const cipher = crypto.createCipheriv(ALGO, decodedKey, null);
  return (
    cipher.update(JSON.stringify(req.dataBody), "utf8", "base64") +
    cipher.final("base64")
  );
};

const getDecryptedString = (req, data) => {
  const decodeStr = decodeString(data.sek);
  const decodedKey = Buffer.from(appKey, "base64");
  const decipher = crypto.createDecipheriv(ALGO, decodedKey, null);
  const decryptStr = decipher.update(Buffer.from(decodeStr, "base64"));
  const decryptedValue = Buffer.concat([decryptStr, decipher.final()]);
  return getEncryptedString(req, decryptedValue.toString());
};

const callAPI = (req, data, callback) => {
  const encryptedString = getDecryptedString(req, data);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.authToken}`,
  };
  const options = {
    method: "POST",
    body: JSON.stringify({ data: encryptedString }),
    headers: headers,
  };

  return fetchApi(req.apiUrl, options)
    .then((response) => response.text())
    .then((result) => {
      callback(JSON.parse(result));
    })
    .catch((err) => {
      callback(err);
    });
};
