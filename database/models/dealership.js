const mongoose = require("mongoose");

const DealershipSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  full_name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  zip: { type: String, required: true },
  lat: { type: Number },
  long: { type: Number },
});

module.exports = mongoose.model("Dealership", DealershipSchema);
