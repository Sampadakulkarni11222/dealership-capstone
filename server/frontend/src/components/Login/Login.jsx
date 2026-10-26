import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setUserName }) => {
  const [userName, setUserNameField] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/djangoapp/login",
        { userName, password },
        { withCredentials: true }
      );
      if (res.data.status === "Authenticated") {
        sessionStorage.setItem("username", res.data.userName);
        setUserName(res.data.userName);
        navigate("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} className="contact-form" style={{ maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserNameField(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
