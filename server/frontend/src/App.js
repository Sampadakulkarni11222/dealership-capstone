import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dealers from "./components/Dealers/Dealers";
import Dealer from "./components/Dealer/Dealer";
import PostReview from "./components/PostReview/PostReview";

function App() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("username");
    if (stored) setUserName(stored);
  }, []);

  return (
    <BrowserRouter>
      <Header userName={userName} setUserName={setUserName} />
      <Routes>
        <Route path="/" element={<Dealers userName={userName} />} />
        <Route
          path="/login"
          element={<Login setUserName={setUserName} />}
        />
        <Route path="/register" element={<Register setUserName={setUserName} />} />
        <Route path="/dealer/:id" element={<Dealer userName={userName} />} />
        <Route path="/postreview/:id" element={<PostReview userName={userName} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
