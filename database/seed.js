const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Dealership = require("./models/dealership");
const Review = require("./models/reviews");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/dealershipsDB";

async function seed() {
  await mongoose.connect(MONGO_URL);

  const dealerships = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "dealerships.json"))
  );
  const reviews = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "reviews.json"))
  );

  await Dealership.deleteMany({});
  await Review.deleteMany({});

  await Dealership.insertMany(dealerships);
  await Review.insertMany(reviews);

  console.log(`Seeded ${dealerships.length} dealerships and ${reviews.length} reviews.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
