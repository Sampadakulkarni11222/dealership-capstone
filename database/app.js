const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Dealership = require("./models/dealership");
const Review = require("./models/reviews");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3030;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/dealershipsDB";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB at", MONGO_URL))
  .catch((err) => console.error("MongoDB connection error:", err));

// GET all dealers
app.get("/fetchDealers", async (req, res) => {
  const dealers = await Dealership.find();
  res.json(dealers);
});

// GET dealers filtered by state
app.get("/fetchDealers/:state", async (req, res) => {
  const dealers = await Dealership.find({ state: req.params.state });
  res.json(dealers);
});

// GET a single dealer by id
app.get("/fetchDealer/:id", async (req, res) => {
  const dealer = await Dealership.findOne({ id: req.params.id });
  res.json(dealer);
});

// GET reviews for a dealer
app.get("/fetchReviews/dealer/:id", async (req, res) => {
  const reviews = await Review.find({ dealership: req.params.id });
  res.json(reviews);
});

// POST a new review
app.post("/insert_review", async (req, res) => {
  try {
    const count = await Review.countDocuments();
    const newReview = new Review({
      id: count + 1,
      ...req.body,
    });
    await newReview.save();
    res.json({ status: 200, message: "Review inserted", review: newReview });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Dealership database microservice is running.");
});

app.listen(PORT, () => {
  console.log(`Dealership database service listening on port ${PORT}`);
});
