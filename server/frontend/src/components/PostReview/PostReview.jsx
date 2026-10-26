import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PostReview = ({ userName }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carModels, setCarModels] = useState([]);
  const [review, setReview] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    axios.get("/djangoapp/get_cars").then((res) => {
      setCarModels(res.data.CarModels || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: userName,
      dealership: parseInt(id, 10),
      review,
      purchase: true,
      purchase_date: new Date().toISOString().slice(0, 10),
      car_make: carMake,
      car_model: carModel,
      car_year: carYear,
    };
    await axios.post("/djangoapp/add_review", payload, { withCredentials: true });
    navigate(`/dealer/${id}`);
  };

  return (
    <div className="container">
      <h2>Post a Review</h2>
      <form onSubmit={handleSubmit} className="contact-form" style={{ maxWidth: 500 }}>
        <textarea
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
        <select value={carMake} onChange={(e) => setCarMake(e.target.value)} required>
          <option value="">Select Car Make</option>
          {[...new Set(carModels.map((c) => c.CarMake))].map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Car Model"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Car Year"
          value={carYear}
          onChange={(e) => setCarYear(e.target.value)}
          required
        />
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default PostReview;
