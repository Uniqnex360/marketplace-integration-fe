// src/components/SuperAdmin/Dashboard/MainSettings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
} from "@mui/material";

const MainSettings = () => {
  const [ setCategories] = useState([]);
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get(`${process.env.REACT_APP_IP}obtainManufactureUnitList/?user_id=${userIds}`);
        console.log('9090',categoryResponse)
        setCategories(categoryResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      textAlign: "center",
      flexDirection: "column",
      marginTop:'5%'
    }}
  >
    <Typography variant="h6" color="textSecondary">
      This feature will be available soon!
    </Typography>
    <Typography variant="body2" color="textSecondary">
      We're working on it. Stay tuned!
    </Typography>
  </Box>
  
  );
};

export default MainSettings;
