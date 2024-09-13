import express from "express";
import db from "../db/conn.mjs";
import jwt from "jsonwebtoken";
import session from "express-session";

const router = express.Router();

router.use(express.json()); // Middleware to parse JSON request bodies

router.use(session({ secret: "fingerpint" })); // Middleware to handle sessions

// Function to check if the user exists
const doesExist = (username, users) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

// check if user authenticated
const verifyUser = (token) => {
  let result = null;
  try {
    jwt.verify(token, "access", function (err, decoded) {
      result = decoded.username;
    });
    return result;
  } catch (err) {
    return false;
  }
};

// checking credentialss
const CheckUser = async (username, password) => {
  let collection = await db.collection("users");

  let user = await collection.findOne({
    username: username,
    password: password,
  });

  if (user) return true;
  else return false;
};


// registration endpoint
router.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  let collection = await db.collection("users");
  let users = await collection.find({}).toArray();

  if (username && password) {
    if (!doesExist(username, users)) {
      // save user to db
      let newDocument = {
        username: username,
        password: password,
        created_at: new Date(),
      };
      let insert_res = await collection.insertOne(newDocument);
      if (!insert_res) throw Error;
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(422).json({ message: "Unable to register user." });
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(422).json({ message: "Error logging in" });
  }

  if (await CheckUser(username, password)) {
    let accessToken = jwt.sign(
      {
        username: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    return res.status(200).send({
      message: `User ${username} successfully logged in`,
      token: accessToken, // send back token to save on client machine
    });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});


// check auth status with Authorization header in request
router.post("/check", async (req, res) => {
  try {
    let auth_value = req.headers.authorization;
    let token = auth_value.split(" ")[1];

    let auth_status = verifyUser(token);
    if (auth_status) res.send(auth_status).status(200);
    else throw Error;

  } catch (err) {
    res.send("Unauthorized!").status(403);
  }
});

export default router;
