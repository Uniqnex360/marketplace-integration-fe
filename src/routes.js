// src\routes.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientDashboardHomepage from "./Components/Client-Admin/Dashboard/ClientDashboardHompage";

import LoginPage from "./Components/MarketLogin/LoginPage";
import PrivateRoute from "./Components/MarketLogin/PrivateRoute";
import Register from "./Components/MarketLogin/Register";
const AppRoutes = () => {
  return (
    <Router>
      {/* <Layout> */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Home/*"
            element={
              <PrivateRoute allowedRoles={['Manager']}>
                <ClientDashboardHomepage />
              </PrivateRoute>
            }
              />
        </Routes>
      {/* </Layout> */}
    </Router>
  )
}

export default AppRoutes;
