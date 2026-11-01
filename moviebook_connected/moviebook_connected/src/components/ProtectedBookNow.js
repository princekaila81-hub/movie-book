import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

const ProtectedBookNow = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/BookNow");

      navigate("/Login", {
        replace: true,
      });
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");

  if (!user) {
    return null;
  }

  return children;
};

export default ProtectedBookNow;
