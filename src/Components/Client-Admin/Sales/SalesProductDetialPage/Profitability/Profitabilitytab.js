import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import AmazonNetUnitProfitability from './AmazonNetUnitProfitability';
import {
  Box,
  Grid,
  CircularProgress,
  Typography,
} from '@mui/material';

const commonStyles = {
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
  color: '#485E75',
};

function ProfitabilityTab({ productId, widgetData, startDate, endDate }) {
  const { id } = useParams(); // Get the 'id' from the URL parameters
  const [productData, setProductData] = useState(null);
    const [productUnitData, setProductUnitData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(()=>{
    console.log('oppo',widgetData)
  },[widgetData])

  const fetchProfitabilityData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';

   const requestBody = {
        product_id: id,
        user_id: userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Conditionally add preset or date range to the request body
      if (widgetData) {
        requestBody.preset = widgetData;
      } else {
        requestBody.start_date = startDate?.format('YYYY-MM-DD');
        requestBody.end_date = endDate?.format('YYYY-MM-DD');
      }

      const response = await axios.post( // Correctly using axios.post
        `${process.env.REACT_APP_IP}productUnitProfitability/`, // Assuming this is the correct POST endpoint
        requestBody // Pass the request body for POST method
      );
      setProductUnitData(response.data.data);
      console.log('8080',response.data.data)
    } catch (err) {
      console.error("Error fetching profitability data:", err);
      // More user-friendly error message based on the type of error
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Something went wrong on the server.'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('Network Error: No response received. Please check your internet connection.');
        } else {
          // Something else happened while setting up the request that triggered an Error
          setError(`Request Setup Error: ${err.message}`);
        }
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if 'id' (from useParams) is available
    if (id) {
      fetchProfitabilityData();
    } else {
      setLoading(false);
      setError('No product ID found in the URL to display profitability.');
    }
  }, [id, widgetData, startDate, endDate]); // Depend on 'id' to re-fetch when it changes


  const fetchNetProfitabilityData = async () => {
  setLoading(true);
  setError(null);

  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';

    // Validate id (from useParams) and userId
    if (!id) { // Use 'id' here
      throw new Error('Product ID is missing from URL. Cannot fetch profitability data.');
    }
    if (!userId) {
      throw new Error('User ID is missing. Please log in again.');
    }

     const requestBody = {
        product_id: id,
        user_id: userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Conditionally add preset or date range to the request body
      if (widgetData) {
        requestBody.preset = widgetData;
      } else {
        requestBody.start_date = startDate?.format('YYYY-MM-DD');
        requestBody.end_date = endDate?.format('YYYY-MM-DD');
      }

  
    const response = await axios.post( // Changed from axios.get to axios.post
      `${process.env.REACT_APP_IP}productNetprofit/`,
      requestBody // Pass the request body for POST method
    );
    setProductData(response.data.data);
    console.log('8080',response.data.data)
  } catch (err) {
    console.error("Error fetching profitability data:", err);
    // More user-friendly error message based on the type of error
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Something went wrong on the server.'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network Error: No response received. Please check your internet connection.');
      } else {
        // Something else happened while setting up the request that triggered an Error
        setError(`Request Setup Error: ${err.message}`);
      }
    } else {
      setError(err.message || 'An unexpected error occurred.');
    }
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  // Only fetch if 'id' (from useParams) is available
  if (id) {
    fetchNetProfitabilityData();
  } else {
    setLoading(false);
    setError('No product ID found in the URL to display profitability.');
  }
}, [id,widgetData, startDate, endDate]); // Depend on 'id' to re-fetch when it changes
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, ...commonStyles }}>Loading profitability data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, ...commonStyles }}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
        <Typography variant="body2">Please ensure the product ID is valid and try again later.</Typography>
      </Box>
    );
  }

  // Assuming productData has properties like 'amazon' and 'walmart'
  // You'll need to adjust these based on your actual API response structure.

  return (
    <Box sx={{ p: 4, backgroundColor: '#F0F2F5', minHeight: '100vh', ...commonStyles }}>
      <Grid container spacing={4}>
        {/* Amazon Profitability */}
        <Grid item xs={12} md={12}>
          <AmazonNetUnitProfitability profitabilityData={productData} unitProfitability={productUnitData} widgetData={ widgetData} startDate={startDate} endDate={endDate}/>
        </Grid>

      </Grid>
    </Box>
  );
}

export default ProfitabilityTab;