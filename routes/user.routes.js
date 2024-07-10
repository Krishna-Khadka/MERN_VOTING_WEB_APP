const express = require("express");
const router = express.Router();
const User = require("../models/user.models.js");
const { generateToken, jwtAuthMiddleware } = require("../utils/jwt.js");
const Candidate = require("../models/candidate.models.js");

router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data); //create a new USer using monoose schema

    const response = await newUser.save(); //save the new User to the database
    console.log("data saved");

    const payload = {
      id: response.id,
    };

    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is: ", token);
    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    // Extract citizenshipNumber and password from request body
    const { citizenshipNumber, password } = req.body;

    // Check if citizenshipNumber or password is missing
    if (!citizenshipNumber || !password) {
      return res
        .status(400)
        .json({ error: "Citizenship Number and password are required" });
    }

    // Find the citizenshipNumber by aadharCardNumber
    const user = await User.findOne({ citizenshipNumber: citizenshipNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid Citizenship Number or Password" });
    }

    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user; //from the jwt token
    console.log("User: ", userData);

    const userId = userData.id;
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; //Extract Id from token

    const { currentPassword, newPassword } = req.body;

    //check if the user is present or not
    const user = await User.findById(userId);

    if (!(await user.comparePassword(currentPassword))) {
      return res
        .status(401)
        .json({ error: "Invalid Citizenship Number or Password" });
    }

    user.password = newPassword;
    await user.save();

    console.log("Password Changed Successfully");
    res.status(200).json({ message: "Password Changed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
