import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Dealer = ({ userName }) => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const dealerRes = await axios.get(`/djangoapp/dealer/${id}`);
      setDealer(dealerRes.data.dealer);
      const reviewRes = await axios.get(`/djangoapp/reviews/dealer/${id}`);
      setReviews(reviewRes.data.reviews || []);
    };
    load();
  }, [id]);

  if (!dealer) return <div className="container">Loading dealer...</div>;

  return (
    <div className="container">
      <h2>{dealer.full_name || dealer.name}</h2>
      <p>
        {dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}
      </p>

      {userName && (
        <p>
          <Link to={`/postreview/${id}`}>Post Review</Link>
        </p>
      )}

      <h3>Reviews</h3>
      {reviews.length === 0 && <p>No reviews yet for this dealer.</p>}
      <ul>
        {reviews.map((r, idx) => (
          <li key={idx} style={{ marginBottom: 12 }}>
            <strong>{r.name}</strong> ({r.car_make} {r.car_model} {r.car_year}) —{" "}
            <em>{r.sentiment}</em>
            <p>{r.review}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dealer;
