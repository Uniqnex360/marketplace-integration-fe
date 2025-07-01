import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material'; // Import Skeleton
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const commonStyles = {
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
  color: '#485E75',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // For stacked bars, the payload will contain an array of data entries.
    // We need to find the specific entries for product_cost and shipping_cost.
    const productCostEntry = payload.find(entry => entry.dataKey === 'product_cost');
    const shippingCostEntry = payload.find(entry => entry.dataKey === 'shipping_cost');

    const productCost = productCostEntry ? productCostEntry.value : 0;
    const shippingCost = shippingCostEntry ? shippingCostEntry.value : 0;
    const totalCogs = productCost + shippingCost; // Sum of the stacked parts

    return (
      <Paper elevation={3} sx={{ padding: 1, ...commonStyles }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9C27B0', mr: 1 }} /> {/* Purple dot for Product Cost */}
          <Typography variant="body2">Product Cost: ${productCost.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF4081', mr: 1 }} /> {/* Pink dot for Shipping Cost */}
          <Typography variant="body2">Shipping Cost: ${shippingCost.toFixed(2)}</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>Total COGS: ${totalCogs.toFixed(2)}</Typography>
      </Paper>
    );
  }
  return null;
};

const COGSGraph = ({ productId, dateRange, widgetData }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const currentProductId = productId || id;

  const fetchCOGSData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';

      if (!currentProductId) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_IP}cogsGraph/`,
        {
          params: {
            product_id: currentProductId,
            user_id: userId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // If you intend to use dateRange or widgetData for filtering,
            // make sure your backend API is configured to accept and use them.
            // For example:
            // start_date: dateRange?.startDate,
            // end_date: dateRange?.endDate,
            // widget_data_type: widgetData // Assuming widgetData might be a type of filter
          },
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        const transformedData = response.data.data.map(item => ({
          name: item.date_range,
          product_cost: item.product_cost || 0, // Ensure product_cost defaults to 0 if null/undefined
          shipping_cost: item.shipping_cost || 0, // Ensure shipping_cost defaults to 0 if null/undefined
          // total_cogs from API is still useful for verification or alternative displays if needed
          total_cogs: item.total_cogs || 0
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching COGS data:", err);
      setError(err.message || 'Failed to fetch COGS data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProductId) {
      fetchCOGSData();
    } else {
      setLoading(false);
      setError("Product ID not provided.");
    }
  }, [currentProductId]); // Added currentProductId to dependency array

  // Determine min/max for YAxis based on the sum of product_cost and shipping_cost (total COGS)
  const yAxisDomain = chartData.length > 0
    ? [0, Math.max(...chartData.map(d => (d.product_cost + d.shipping_cost))) * 1.2]
    : [0, 1];

  return (
    <Box sx={{ border:'solid 1px #ddd', borderRadius:'7px', marginLeft:'25px', marginTop:'20px', position: 'relative', width: '100%', height: 400, padding: 2, ...commonStyles }}>
   

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rectangular" width="95%" height="70%" /> {/* Main chart area */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '95%', mt: 2 }}>
            {Array(5).fill(0).map((_, index) => ( // Skeletons for X-axis labels
              <Skeleton key={index} variant="text" width="15%" height={20} />
            ))}
          </Box>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%', color: 'error.main' }}>
          <Typography>{error}</Typography>
        </Box>
      ) : chartData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography>No COGS data available for the selected period.</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="80%">
          <BarChart
            data={chartData}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              style={{ fontSize: '0.75rem', ...commonStyles }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(tick) => {
                  const parts = tick.split(', ');
                  if (parts.length === 2 && parts[0].includes(' ') && parts[1].match(/^\d{4}$/)) {
                      return parts[0]; // e.g., "Jan 1" from "Jan 1, 2023"
                  }
                  if (tick.includes(' ') && tick.length <= 8) { // e.g., "Oct 2022"
                      return tick;
                  }
                  return tick; // Fallback for other formats
              }}
              height={30}
            />
            <YAxis
              domain={yAxisDomain}
              tickFormatter={(tick) => `$${tick.toFixed(2)}`}
              style={{ fontSize: '0.75rem', ...commonStyles }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            {/* Bar for Shipping Cost - now at the bottom of the stack */}
            <Bar dataKey="shipping_cost" stackId="cogsStack" fill="#FF4081" barSize={70} />
            {/* Bar for Product Cost - stacked on top of shipping cost, now gets the top rounded corners */}
            <Bar dataKey="product_cost" stackId="cogsStack" fill="#C3B1E1" barSize={70} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>

  );
};

export default COGSGraph;
