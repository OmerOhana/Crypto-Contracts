const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const redis = require("redis");
let RedisStore = require("connect-redis")(session);
require("dotenv").config();

// setups
const app = express();
const PORT = process.env.PORT || 3000;

const initializePassport = require("./passport-config");
initializePassport(passport);

// app.use(
//   cors({
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     origin: "http://localhost:3000",
//   })
// );

var allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:80",
  "http://localhost:8080",
  "http://crypto.itaikeren.com",
  process.env.CLIENT_BASE_URL1,
  process.env.CLIENT_BASE_URL2,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    preflightContinue: false,
    exposedHeaders: [
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Content-Type",
      "Accept",
    ],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json()); // allow perss json
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

// development mode
// let RedisClient = redis.createClient();

// live mode
let RedisClient = redis.createClient({
  port: "13828",
  // host: "redis-13828.c15.us-east-1-4.ec2.cloud.redislabs.com",
  host: process.env.REDIS_HOST,
  // password: "rdrSvTxzOPxW9XgeyvkpeegRqFQ6pm39"
  password: process.env.REDIS_PASS,
});

app.use(
  session({
    store: new RedisStore({ client: RedisClient }),
    name: "_redisDemo",
    secret: process.env.REDIS_SECRET,
    cookie: { secure: false, maxAge: 15 * 60000 }, // 60000 is 1 min
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// auth middleware
function checkAuthenticated(req, res, next) {
  // console.log("checkAuthenticated, req.user->", req.user);
  if (req.isAuthenticated()) {
    // console.log("checkAuthenticated, req.user GOOD IF->", req.user);
    return res.redirect("/homepage");
  }
  return next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
}

// mongo connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.set("useFindAndModify", false);

const mongoConnection = mongoose.connection;
mongoConnection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});
mongoConnection.on("error", (err) => {
  console.log("MongoDB err->", err);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

RedisClient.on("connect", () => {
  console.log("Redis database connection established successfully");
});
RedisClient.on("error", (err) => {
  console.log("Redis err->", err);
});

// models
let userModel = require("./models/user.model");
let contractModel = require("./models/contract.model");

// routes

// register
app.post("/register", checkAuthenticated, function (req, res) {
  const accountAddress = req.body.accountAddress;
  const username = req.body.username;
  const password = bcrypt.hashSync(req.body.password, 14);

  const newUser = new userModel({ accountAddress, username, password });

  newUser
    .save()
    .then(() => res.json("User added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

app.get("/", (req, res) => {
  res.send(req.session);
});

// login
app.post("/login", passport.authenticate("local"), (req, res) => {
  // console.log("/login POST->", req.user);
  res.send(req.user);
});

app.get("/login", checkAuthenticated, (req, res) => {
  // console.log("/login GET->", req.user);
  res.send(req.user);
});

//logout
app.get("/logout", (req, res) => {
  try {
    req.logOut();
    res.sendStatus(204);
  } catch (error) {
    console.log("err->", error);
  }
});

//get user by usernmae
app.get("/user/:username", (req, res) => {
  userModel.findOne({ username: req.params.username }, (err, doc) => {
    if (err) res.send(err);
    res.send(doc);
  });
});

//get user by account address
app.get("/user/address/:address", (req, res) => {
  userModel.findOne({ accountAddress: req.params.address }, (err, doc) => {
    if (err) res.send(err);
    res.send(doc);
  });
});

//update user pending contracts
app.put("/user/:id", (req, res) => {
  // console.log("body is->", req.body);
  // console.log("id->>>>", req.params.id);
  userModel.findByIdAndUpdate(
    req.params.id,
    { contracts: req.body },
    (err, doc) => {
      if (err) return res.status(500).send({ error: err });
      // console.log("all good->", doc);
      return res.send("Succesfully saved.");
    }
  );
});

//update user pending contract status
app.put("/user/:username/:contractid", (req, res) => {
  let updatedUser;
  userModel.findOne({ username: req.params.username }, (err, doc) => {
    if (err) return res.status(500).send({ error: err });
    updatedUser = doc;
    // console.log("before!!!->>>", updatedUser);
    for (let index = 0; index < doc.contracts.length; index++) {
      if (doc.contracts[index].contractId == req.params.contractid) {
        doc.contracts[index].status = req.body.status;
        break;
      }
    }
    updatedUser.contracts = doc.contracts;
    // console.log("after!!!!->>", updatedUser);

    userModel.findOneAndUpdate(
      { username: req.params.username },
      updatedUser,
      (err, doc) => {
        if (err) return res.status(500).send({ error: err });
        // console.log("all good->", doc);
        return res.send("Succesfully saved.");
      }
    );
  });
});

// Create new contract in db
app.post("/contract/new", (req, res) => {
  // console.log("add new con body->", req.body);
  const contractId = req.body.contractId;
  const seller = req.body.seller;
  const buyer = req.body.buyer;
  const roomNumber = -1;
  const apartmentNumber = -1;
  const apartmentFloor = -1;
  const apartmentStreet = "none";
  const apartmentCity = "none";
  const money = -1;
  const sellerApprove = false;
  const buyerApprove = false;
  const status = "local";

  const newContract = new contractModel({
    contractId,
    seller,
    buyer,
    roomNumber,
    apartmentNumber,
    apartmentFloor,
    apartmentStreet,
    apartmentCity,
    money,
    sellerApprove,
    buyerApprove,
    status,
  });

  newContract
    .save()
    .then(() => res.json("Contract added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

// get contract by contractid
app.get("/contract/:contractid", (req, res) => {
  contractModel.findOne({ contractId: req.params.contractid }, (err, doc) => {
    if (err) return res.status(500).send({ error: err });
    res.send(doc);
  });
});

// get all contracts
app.get("/contracts", (req, res) => {
  contractModel.find({}, (err, doc) => {
    if (err) return res.status(500).send({ error: err });
    res.send(doc);
  });
});

// update contract by contractid
app.put("/contract/:contractid", (req, res) => {
  let updatedContract;

  contractModel.findOne({ contractId: req.params.contractid }, (err, doc) => {
    updatedContract = doc;
    updatedContract.roomNumber = req.body.roomNumber;
    updatedContract.apartmentNumber = req.body.apartmentNumber;
    updatedContract.apartmentFloor = req.body.floor;
    updatedContract.apartmentStreet = req.body.street;
    updatedContract.apartmentCity = req.body.city;
    updatedContract.money = req.body.money;
    updatedContract.sellerApprove = req.body.sellerApprove;
    updatedContract.buyerApprove = req.body.buyerApprove;

    if (updatedContract.sellerApprove && updatedContract.buyerApprove) {
      updatedContract.status = "blockchain";
    }

    contractModel.findOneAndUpdate(
      { contractId: req.params.contractid },
      updatedContract,
      (err, doc) => {
        if (err) return res.status(500).send({ error: err });
        res.send(updatedContract);
      }
    );
  });
});
