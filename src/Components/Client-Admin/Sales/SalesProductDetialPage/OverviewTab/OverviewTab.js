import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Tooltip,
} from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import axios from 'axios';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function OverviewTab({ productId, widgetData, startDate, endDate }) {
  const [overviewData, setOverviewData] = useState(null);
  const [overviewCompare, setOverviewCompare] = useState(null)
  const [loading, setLoading] = useState(true);
 let lastParamsRef = useRef("");
    
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';

      const payload = {
        product_id: productId,
        user_id: userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (widgetData) {
        payload.preset = widgetData;
      } else {
        payload.start_date = startDate?.format('YYYY-MM-DD');
        payload.end_date = endDate?.format('YYYY-MM-DD');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getrevenuedetailsForProduct/`,
        payload
      );

      if (response.data && response.data.status && response.data.data) {
        setOverviewData(response.data.data);
        setOverviewCompare(response.data.data.compare_total);
      } else {
        setOverviewData(null);
      }
    } catch (error) {
      console.error('Error fetching profit and loss details:', error);
      setOverviewData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('widget',widgetData)

      if (productId && (widgetData || (startDate && endDate))) {
          const currentParams = JSON.stringify({productId, widgetData, startDate, endDate
          
          })
        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
       fetchOverview();
        }
  
     
    }
  }, [productId, widgetData, startDate, endDate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const renderDifference = (currentValue, compareValue) => {
    if (typeof currentValue !== 'number' || typeof compareValue !== 'number') {
      return <Typography variant="body2" color="textSecondary">N/A</Typography>;
    }

    const difference = currentValue - compareValue;
    const isPositive = difference >= 0;
    const Icon = isPositive ? ArrowUpward : ArrowDownward;
    const iconColor = isPositive ? 'success.main' : 'error.main';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#000' }}>
          {formatCurrency(Math.abs(difference))}
        </Typography>
        <Icon fontSize="small" sx={{ ml: 0.5, color: iconColor }} />
      </Box>
    );
  };

  const renderUnitsDifference = (currentValue, compareValue) => {
    if (typeof currentValue !== 'number' || typeof compareValue !== 'number') {
      return <Typography variant="body2" color="textSecondary">N/A</Typography>;
    }

    const difference = currentValue - compareValue;
    const isPositive = difference >= 0;
    const Icon = isPositive ? ArrowUpward : ArrowDownward;
    const iconColor = isPositive ? 'success.main' : 'error.main';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: '#000' }}>
          {Math.abs(difference)}
        </Typography>
        <Icon fontSize="small" sx={{ ml: 0.5, color: iconColor }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ padding: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>Loading overview...</Typography>
      </Box>
    );
  }

  if (!overviewData || !overviewData.total || !overviewData.compare_total) {
    return (
      <Box sx={{ padding: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>No overview data available.</Typography>
      </Box>
    );
  }

  const { date_range_label, total } = overviewData;

  return (
    <Box sx={{ padding: 2, fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>
      <Grid container spacing={2}>
        {/* Gross Revenue */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontSize:'20px',fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#121212', fontWeight:'600'  }}>
                Gross Revenue
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>
                {date_range_label}
              </Typography>
              <Box sx={{ display: 'flex',  alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{fontSize:'32px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#121212' }}>
                  {formatCurrency(total.gross_revenue)}
                </Typography>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' ,marginTop:'10px', paddingLeft:'5px',}}>
  <Typography variant="body2" sx={{ color: '#485E75', fontSize: 16, fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
    {/* Show minus sign for negative values explicitly */}
    {overviewCompare.gross_revenue < 0 ? '-' : ''}
    ${Math.abs(overviewCompare.gross_revenue || 0).toFixed(2)}
  </Typography>
  {overviewCompare.gross_revenue < 0 ? (
    <ArrowDownwardIcon sx={{ color: 'red', fontSize: 16, ml: 0.3 }} />
  ) : (
    <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 16, ml: 0.3 }} />
  )}
</Box>

              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Net Profit */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{fontSize:'20px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",color: '#121212', fontWeight:'600'}}>
                Net Profit
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>
                {date_range_label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{ fontSize:'32px',fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#121212' }}>
                  {formatCurrency(total.net_profit)}
                </Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center',marginTop:'10px', paddingLeft:'5px', }}>
  <Typography variant="body2" sx={{ color: '#485E75', fontSize: 16 , fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>
    {/* Show minus sign for negative values explicitly */}
    {overviewCompare.net_profit < 0 ? '-' : ''}
    ${Math.abs(overviewCompare.net_profit || 0).toFixed(2)}
  </Typography>
  {overviewCompare.net_profit < 0 ? (
    <ArrowDownwardIcon sx={{ color: 'red', fontSize: 16, ml: 0.3 }} />
  ) : (
    <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 16, ml: 0.3 }} />
  )}
</Box>
            


              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Units Sold */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{fontSize:'20px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#121212', fontWeight:'600' }}>
                Units Sold
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#485E75' }}>
                {date_range_label}
              </Typography>
              <Box sx={{ display: 'flex',  alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{ fontSize:'32px',fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", color: '#121212' }}>
                  {total.units_sold}
                </Typography>
                       
   <Box sx={{ display: 'inline-flex', alignItems: 'center' ,marginTop:'10px', paddingLeft:'5px',}}>
  <Typography variant="body2" sx={{ color: '#485E75', fontSize: 16, fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
    {/* Show minus sign for negative values explicitly */}
    {overviewCompare.units_sold < 0 ? '-' : ''}
    {Math.abs(overviewCompare.units_sold || 0).toFixed(2)}
  </Typography>
  {overviewCompare.units_sold < 0 ? (
    <ArrowDownwardIcon sx={{ color: 'red', fontSize: 16, ml: 0.3 }} />
  ) : (
    <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 16, ml: 0.3 }} />
  )}
</Box>



              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default OverviewTab;