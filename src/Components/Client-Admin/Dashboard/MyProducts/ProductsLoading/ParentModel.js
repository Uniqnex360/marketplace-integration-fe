import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  DialogActions,Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import soon from "../../../../assets/soon.png"; // Fallback image
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link, useNavigate, useLocation } from "react-router-dom";
import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';
const commonStyles = {
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};

// ✅ Always show dialog on load
const ParentModel = ({ productId, onClose ,page,rowsPerPage}) => {
        const navigate = useNavigate();
  const { id } = useParams(); // Extract product ID from URL
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVariations, setFilteredVariations] = useState([]);
  const [selectedVariationId, setSelectedVariationId] = useState(null);

  const [tooltipText, setTooltipText] = useState('Copy SKU');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = localStorage.getItem("user");
      let userId = "";
      if (userData) {
        const data = JSON.parse(userData);
        userId = data.id;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_IP}getProductVariant/`,
        {
          params: {
            product_id: productId || id, // Use prop if available, otherwise route param
            user_id: userId,
          },
        }
      );

      if (response.data && response.data.data) {
        setVariations(response.data.data);
        console.log('3333', response.data.data);
      } else {
        console.error("Invalid product data:", response.data);
        setError("Failed to load product variations.");
        setVariations([]);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load product variations.");
      setVariations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id, productId]); // Re-fetch if productId prop changes

  useEffect(() => {
    const filtered = variations.filter((variation) => {
      const searchRegex = new RegExp(searchTerm, 'i');
      return (
        searchRegex.test(variation?.product_id) ||
          searchRegex.test(variation?.sku) ||
        searchRegex.test(variation?.product_title)
      );
    });
    setFilteredVariations(filtered);
  }, [searchTerm, variations]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

const handleOpenListingAnalyzer = () => {
  console.log('stand', selectedVariationId);

  // Use template literal properly and open in a new tab
  const url = `/Home/product-detail/${selectedVariationId}?page=${page}&&rowsPerPage=${rowsPerPage}`;
  window.open(url, '_blank'); // '_blank' opens in a new tab
};

const handleCopyAsin = (asin, event) => {
  event.stopPropagation();

  const copyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(asin);
      } else {
        // Fallback for HTTP (non-secure) environments
        const textarea = document.createElement("textarea");
        textarea.value = asin;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setTooltipText("SKU Copied!");
    } catch (err) {
      console.error("Copy failed", err);
      setTooltipText("Copy Failed!");
    }

    setTimeout(() => setTooltipText("Copy SKU"), 1500);
  };

  copyText();
};


      const handleCardClick = (variationId) => {
        setSelectedVariationId((prevId) => (prevId === variationId ? null : variationId));
    };

  return (
    <div>
  <Dialog
  open={true}
  onClose={onClose}
  PaperProps={{
    sx: { maxWidth: 700 } // set your desired width here
  }}
>      
        <DialogTitle sx={{ ...commonStyles, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6"  sx={{fontSize: '24px', color: '#121212'}} style={commonStyles}>Which variation do you want to analyze?</Typography>
          <IconButton aria-label="close" onClick={onClose} size="small" style={commonStyles}>
            <CloseIcon style={commonStyles} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
        <Box
  sx={{
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    // p: 2, // optional padding
    boxShadow: 'none' // optional shadow for separation
  }}
>
  <Typography
    variant="body2"
    sx={{ fontSize: '16px', color: '#485E75', mb: 2 }}
    style={commonStyles}
  >
    Choose which variation SKU of this parent SKU you want to open in Listing Analyzer.
  </Typography>

  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search by SKU or Product Title"
    InputProps={{
      style: commonStyles,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton aria-label="search" style={commonStyles}>
            <SearchIcon style={commonStyles} />
          </IconButton>
        </InputAdornment>
      ),
    }}
    sx={{ mb: 2, fontSize: '16px' }}
    value={searchTerm}
    onChange={handleSearchChange}
  />
</Box>

          <Grid container spacing={2}>
            {loading ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" style={commonStyles}>
                  Loading variations...
                </Typography>
              </Grid>
            ) : error ? (
              <Grid item xs={12}>
                <Typography variant="body2" color="error" style={commonStyles}>
                  {error}
                </Typography>
              </Grid>
            ) : filteredVariations.length > 0 ? (
              filteredVariations.map((variation) => (
                <Grid item xs={12} sm={6} key={variation?.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card
                    sx={{
                      width: '300px',
                      height: '110px',
                      paddingLeft: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      },
                   border: selectedVariationId === variation?.id ? '2px solid rgb(2, 83, 181)' : '1px solid #ccc',
    }}
                                                         onClick={() => handleCardClick(variation?.id)}

                  >
                       <img
                        src={variation?.image_url || soon} 
                        alt={variation?.product_title || "Product Image"}
                        style={{ display: 'block',width: '50%',  height: '45%', objectFit: 'contain' }}
                      />
                     <CardContent sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <CustomizeTooltip title={variation?.product_title}>
                                     <Typography
  variant="subtitle2"
  sx={{
    fontSize: '14px',
    fontWeight:'800px',
    color: '#121212',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
  gutterBottom
  style={commonStyles}
>
  {variation?.product_title}
</Typography>
</CustomizeTooltip>
                      <Box display="flex" alignItems="center" mb={0.5}>
                          <img
                            src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                            alt="Country Flag"
                            width={27}
                            height={16}
                            style={{ marginRight: 6 }}
                        />

                        <Typography variant="caption" sx={{ fontSize: '14px', color: '#485E75' }} style={commonStyles}>
                          {variation?.sku}
                        </Typography>
                          <Tooltip title={tooltipText}>
                                                    <IconButton onClick={(event) => handleCopyAsin(variation?.sku, event)} size="small" >
                                                        <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
                                                    </IconButton>
                                                </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" style={commonStyles}>
                  No variations found matching your search.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      <DialogActions sx={{ px: 2, py: 2 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
    <Button onClick={onClose} style={commonStyles} sx={{fontSize:'16px',color:'#121212', textTransform:'capitalize'}}>Cancel</Button>
   <Button
  onClick={handleOpenListingAnalyzer}
  variant="contained"
  color="primary"
  disabled={!selectedVariationId}
  sx={{
    textTransform:'capitalize',
    fontSize: '16px',
    bgcolor: !selectedVariationId ? '#A6B7C9' : '#hsl(245, 72.60%, 42.90%)',
    color: 'white',
    '&:hover': {
      bgcolor: !selectedVariationId ? '#A6B7C9' : 'rgb(2, 83, 181)',
    },
    ...commonStyles,
  }}
>
  Open in Listing Analyzer
</Button>

  </Box>
</DialogActions>

      </Dialog>
    </div>
  );
};

export default ParentModel;