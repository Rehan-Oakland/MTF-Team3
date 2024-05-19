import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  // Simulate authentication check (replace with your logic)
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    // Redirect to a specific unauthorized page
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
