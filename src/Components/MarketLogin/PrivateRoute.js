// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/" />;
  }

  const userRole = user.role_name;
  console.log('User Role:', userRole); // Debugging line

  if (allowedRoles.includes(userRole)) {
    // If user role matches allowed roles, render the children
    return children;
  } else {
    console.log('User role not allowed, redirecting to login');
    return <Navigate to="/" />;
  }
};

export default PrivateRoute;
