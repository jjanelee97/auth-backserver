const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const app = express();
const port = 3001;

const jwt = require('jsonwebtoken');
const jwtSecret = "codeitsecret";

// Middleware

// JSON parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser())

// CORS middleware
app.use(function (req, res, next) {
  // Allow Origins
  res.header("Access-Control-Allow-Origin", 'http://localhost:3000');
  res.header("Access-Control-Allow-Credentials", true);
  // Allow Methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  // Allow Headers
  res.header("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, Authorization, cookie");
  // Handle preflight, it must return 200
  if (req.method === "OPTIONS") {
    // Stop the middleware chain
    return res.status(200).end();
  }
  // Next middleware
  next();
});

// Auth middleware
app.use((req, res, next) => {
  // login does not require jwt verification
  if (req.path == '/api/login') {
    // next middleware
    return next()
  }

  // Token verification
  try {
    var decoded = jwt.verify(req.headers.authorization, jwtSecret);
    console.log("decoded", decoded)
  } catch (err) {
    // Catch the JWT Expired or Invalid errors
    return res.status(401).json({ "msg": err.message })
  }

  // next middleware
  next()
});

// Routes
app.get("/api/login", (req, res) => {
  // generate a constant token, no need to be fancy here
  const token = jwt.sign({ "email": "user@codeit.kr", "username": "squirrel", "role": "admin" }, jwtSecret, { expiresIn: 18000000 }) // 1 min token
  // return it back
  res.json({ "jwt": token })
});

app.get("/api/token/ping", (req, res) => {
  // Middleware will already catch if token is invalid
  // so if we can get this far, that means token is valid

  // TODO: we should send back another updated jwt token here so clientside can update jwt payload information if needed
  res.json({ "msg": "Already Logged In!" })
})

app.get("/api/ping", (req, res) => {
  // proxy endpoint so that the client can call data
  res.json({ "msg": "API Data etc. etc." })
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
