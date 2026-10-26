const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  dealership: { type: Number, required: true },
  review: { type: String, required: true },
  purchase: { type: Boolean, required: true },
  purchase_date: { type: String },
  car_make: { type: String },
  car_model: { type: String },
  car_year: { type: Number },
});

module.exports = mongoose.model("Review", ReviewSchema);
