import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const STATES = [
  "All", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Kansas", "New York", "Texas", "Washington",
];

const Dealers = ({ userName }) => {
  const [dealers, setDealers] = useState([]);
  const [state, setState] = useState("All");

  const fetchDealers = async (selectedState) => {
    const endpoint =
      selectedState === "All"
        ? "/djangoapp/get_dealers"
        : `/djangoapp/get_dealers/${selectedState}`;
    const res = await axios.get(endpoint);
    setDealers(res.data.dealers || []);
  };

  useEffect(() => {
    fetchDealers(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="container">
      <h2>Dealerships</h2>
      <label>
        Filter by State:{" "}
        <select value={state} onChange={(e) => setState(e.target.value)}>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Dealer Name</th>
            <th>City</th>
            <th>State</th>
            <th>Zip</th>
            {userName && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealers.map((dealer) => (
            <tr key={dealer.id || dealer.dealer_id}>
              <td>
                <Link to={`/dealer/${dealer.id || dealer.dealer_id}`}>
                  {dealer.full_name || dealer.name}
                </Link>
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.state}</td>
              <td>{dealer.zip || dealer.zip_code}</td>
              {userName && (
                <td>
                  <Link to={`/postreview/${dealer.id || dealer.dealer_id}`}>
                    Post Review
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
