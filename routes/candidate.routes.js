const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate.models.js");
const User = require("../models/user.models.js");
const { generateToken, jwtAuthMiddleware } = require("../utils/jwt.js");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (error) {
    return false;
  }
};

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "User has no admin role" });

    const data = req.body;
    const newCandidate = new Candidate(data); //create a new Candidate using monoose schema

    const response = await newCandidate.save(); //save the new User to the database
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "User has no admin role" });

    const candidateId = req.params.candidateId;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log("candidate data updated successfully");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "User has no admin role" });

    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log("candidate deleted successfully");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  // no admin can vote
  // user can only vote once

  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    // find the Candidate document with the specified candidateId
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      res.status(400).json({ message: "You have already voted" });
    }

    if (user.role == "admin") {
      res.status(403).json({ message: "admin isn't allowed to vote" });
    }

    // update the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // update the user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

router.get("/vote/count", async (req, res) => {
  try {
    // Find all candidate and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
