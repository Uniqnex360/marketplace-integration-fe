import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import CostOfGoodsSold from '../ProductInfoTab/COGSTab';
import COGSGraph from './COGSGraph';

const ProductInfoTab = () => {
  const { id } = useParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [asinWpidTooltipText, setAsinWpidTooltipText] = useState('Copy'); // Combined tooltip state
  const [skuTooltipText, setSkuTooltipText] = useState('Copy SKU');

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };


  
  const handleCopyAsinWpid = async (valueToCopy) => {
    if (!valueToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textarea = document.createElement("textarea");
        textarea.value = valueToCopy;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      // Determine what was copied for the Snackbar message
      const hasAsin = productData.ASIN && productData.ASIN !== "N/A";
      const hasWpid = productData.WPID && productData.WPID !== "N/A"; // Corrected to WPID

      let messageText = '';
      if (hasAsin && hasWpid) {
        messageText = 'ASIN/WPID Copied!';
      } else if (hasAsin) {
        messageText = 'ASIN Copied!';
      } else if (hasWpid) {
        messageText = 'WPID Copied!';
      } else {
        messageText = 'ID Copied!'; // Generic fallback if neither is found
      }

      setCopiedText(messageText); // Set the specific message
      setSnackbarOpen(true); // Open Snackbar

      setAsinWpidTooltipText('Copied!'); // Change tooltip immediately after copy
    } catch (err) {
      console.error('Clipboard copy failed', err);
      setAsinWpidTooltipText('Copy Failed');
      setCopiedText('Failed to copy!'); // Set a failure message for Snackbar
      setSnackbarOpen(true);
    }

    // Reset tooltip text after a short delay
    setTimeout(() => {
      setAsinWpidTooltipText('Copy');
    }, 1500);
  };

  const handleCopySku = async (sku) => {
    if (!sku) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(sku);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = sku;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setSkuTooltipText('SKU Copied!');
      setCopiedText('SKU Copied!'); // Directly set for SKU
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Clipboard copy failed', err);
      setSkuTooltipText('Copy Failed');
      setCopiedText('Failed to copy SKU!'); // Set a failure message for Snackbar
      setSnackbarOpen(true);
    }

    setTimeout(() => {
      setSkuTooltipText('Copy SKU');
    }, 1500);
  };
  useEffect(()=>{
 const fetchProductInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getProductInformation/`,
        {
          params: {
            product_id: id,
            user_id: userId,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }
      );
      setProductData(response.data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  if(id)fetchProductInfo()
  },[id])
 


  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography>Loading product information...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!productData) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>No product data available.</Typography>
      </Box>
    );
  }

  // Determine the dynamic label based on ASIN and WPID presence
  const getAsinWpidLabel = () => {
    const hasAsin = productData.ASIN && productData.ASIN !== ""; // Check for empty string too
    const hasWpid = productData.WPID && productData.WPID !== ""; // Corrected to WPID and check for empty string

    if (hasAsin && hasWpid) {
      return "ASIN/WPID";
    } else if (hasAsin) {
      return "ASIN";
    } else if (hasWpid) {
      return "WPID";
    }
    return "ID"; // Fallback if neither ASIN nor WPID are present
  };

  // Determine the value to display and copy for ASIN/WPID
  const getAsinWpidValue = () => {
    const hasAsin = productData.ASIN && productData.ASIN !== "";
    const hasWpid = productData.WPID && productData.WPID !== ""; // Corrected to WPID and check for empty string

    if (hasAsin && hasWpid) {
      return `${productData.ASIN} / ${productData.WPID}`;
    } else if (hasAsin) {
      return productData.ASIN;
    } else if (hasWpid) {
      return productData.WPID;
    }
    // As a final fallback, use the "asin/wpid" field if individual fields are empty
    return productData['asin/wpid'] || 'N/A';
  };

  return (
    <Box sx={{ marginTop: '13px', marginLeft: '15px', paddingRight: '15px' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={12}>
          <Box
            sx={{
              border: 'solid 1px #ddd',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: 'none',
              padding: { xs: '24px', sm: '32px' },
              fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              color: '#485E75',
            }}
          >
            <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold', fontSize: '20px',color: '#212B36',fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
              Product Information
            </Typography>

            {/* Selling Status */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4}><Typography sx={{ color: '#121212', fontWeight: '600', fontSize: '14px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>Selling Status</Typography></Grid>
              <Grid item xs={8}>
                <Chip
                  label={productData.selling_status}
                  size="small"
                  sx={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    color: productData.selling_status === 'Active' ? 'rgb(30, 120, 90)' : 'inherit',
                    backgroundColor: productData.selling_status === 'Active' ? 'rgb(214, 245, 235)' : 'default',
                  }}
                />
              </Grid>
            </Grid>

            {/* Dynamic ASIN / WPID */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography sx={{ color: '#121212', fontWeight: '600', fontSize: '14px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
                  {getAsinWpidLabel()}
                </Typography>
              </Grid>
              <Grid item xs={8} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: '#485E75', fontSize: '16px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>
                  {getAsinWpidValue()}
                </Typography>
                <Tooltip title={asinWpidTooltipText}>
                  <IconButton onClick={() => handleCopyAsinWpid(getAsinWpidValue())} size="small" >
                    <ContentCopyIcon sx={{ fontSize: '16px', color: '#757575' }} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* SKU */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4}><Typography sx={{ color: '#121212', fontWeight: '600', fontSize: '14px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>SKU</Typography></Grid>
              <Grid item xs={8} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ color: '#485E75', fontSize: '16px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>{productData.SKU}</Typography>
                <Tooltip title={skuTooltipText}>
                  <IconButton onClick={() => handleCopySku(productData.SKU)} size="small" >
                    <ContentCopyIcon sx={{ fontSize: '16px', color: '#757575' }} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* Brand */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4}><Typography sx={{ color: '#121212', fontWeight: '600', fontSize: '14px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>Brand</Typography></Grid>
              <Grid item xs={8}><Typography sx={{ color: '#485E75', fontSize: '16px', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif" }}>{productData.Brand}</Typography></Grid>
            </Grid>
          </Box>
        </Grid>

        <CostOfGoodsSold
          dateRange={productData.date_range}
          marketplaces={productData.marketplaces}
          productData={productData}
        />
        <COGSGraph   dateRange={productData.date_range}
          marketplaces={productData.marketplaces}
          productData={productData}/>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={copiedText}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  );
};

export default ProductInfoTab;