import React, { useState , useEffect, useRef} from 'react';
import { Tabs, Tab, TextField, MenuItem, Button,TablePagination, Chip, Tooltip, Switch, Paper,TableCell, IconButton,TableHead, TableBody, TableRow, Table, TableContainer,Select, Typography, Box, Grid } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Close";
import { ContentCopy as CopyIcon, Info as InfoIcon } from "@mui/icons-material";
import { useParams, Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker,LocalizationProvider } from "@mui/x-date-pickers";
import {

  ArrowBack
} from "@mui/icons-material";
import axios from "axios";
import ProductAttributes from './ProductAttributes';
import DetailVarient from './DetailVarient';
import ProductOrdersDetailTab from './ProductOrdersDetailTab';
import { Snackbar, Alert } from '@mui/material'; 
const ProductDetails = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(0);  // Current page
  const [rowsPerPage, setRowsPerPage] = useState(5);  // Rows per page
  const [tabIndex, setTabIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image

  const [ordersData, setOrdersData] = useState([]);
  const { id } = useParams(); // Extract SKU from URL
  const [product, setProduct] = useState([]); 
  const [attributes, setAttributes] = useState([]); 
  
  const [MarketplaceImage, setMarketplaceImage] = useState([]); 
  
  const [loading, setLoading] = useState(false);

  const [startDateHelium, setStartDateHelium] = useState(dayjs().subtract(7, 'day'));
  const [endDateHelium, setEndDateHelium] = useState(dayjs());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get('page') || 0;
  const rowsPerPageURL = queryParams.get('rowsPerPage');
  console.log("rowsPerPageURL:", rowsPerPageURL);
  
  let lastParamsRef = useRef(""); // Ref to store last API call parameters to prevent unnecessary fetches

 // Assuming these props are passed
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success', 'error', 'info', 'warning'

  const { searchQuery } = location.state || {};
  console.log("searchQuery-Details:", searchQuery);
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
 
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [inventory, setInventory] = useState([
    {
      id: 1,
      priority: 1,
      warehouseName: "Superltd",
      onHand: 40,
      available: 40,
      reserved: 0,
      binLocation: "",
    },
  ]);


  const [thumbnailImages, setThumbnailImages] = useState([]); // State for storing thumbnail images.

const handleThumbnailImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const newThumbnail = URL.createObjectURL(file);
    setThumbnailImages([...thumbnailImages, newThumbnail]); // Add the new thumbnail image to the state
  }
};
useEffect(() => {
  const nameTab = queryParams.get('name');
  if (nameTab === 'orderTab') {
    setTabIndex(4); // Orders tab index
  }
}, [location.search]);


const handleRemoveThumbnailImage = (index) => {
  const updatedImages = thumbnailImages.filter((_, idx) => idx !== index);
  setThumbnailImages(updatedImages); // Remove the thumbnail at the specified index
};


const setProductDescription = (newDescription) => {
  setProduct(prevProduct => ({
    ...prevProduct,
    product_description: newDescription
  }));
};

const handleFeatureChange = (event, index) => {
  const updatedFeatures = [...product.features];
  updatedFeatures[index] = event.target.value;  // Update the feature at the specific index
  setProduct({ ...product, features: updatedFeatures });  // Update the product state
};



  useEffect(() => {
    console.log('MarketplaceImage',MarketplaceImage)

                const currentParams = JSON.stringify({
id     });

        // Only fetch if parameters have actually changed
        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
           fetchProductDetails(); // Fetch products when page or rowsPerPage change
       }

  }, [id]);
  
  
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        let userIds = "";
  
        if (userData) {
          const data = JSON.parse(userData);
          userIds = data.id;
        }
  
        const response = await axios.get(`${process.env.REACT_APP_IP}fetchProductDetails/`, {
          params: {
            product_id: id,
            user_id: userIds
          }
        });
  
        console.log("Full Response:", response);
        console.log("Response Data:", response.data.data.marketplace_image_url);
        console.log("Product Details:", response.data?.data?.attributes);
         if (response.data?.data) {
          setProduct(response.data.data); // Assign first item
          setAttributes(response.data?.data?.attributes)
          setMarketplaceImage(response.data.data)
 
        } else {
          setProduct({});
        }
  
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
  
  const handleSave = async () => {
    // Construct the update_obj with editable values
    const update_obj = {
      vendor_discount: product.vendor_discount ? product.vendor_discount :0, // Corrected typo: product.vendor_discount -> product.vendor_discount
      vendor_funding: product.vendor_funding ? product.vendor_funding : 0,
    };

    const payload = {
      user_id: userIds,
      product_id: id,
      update_obj: update_obj,
    };
    console.log('iphone', payload);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateProductDetails/`,
        payload
      );

      // Check if the request was successful based on Axios response status
      if (response.status === 200 || response.status === 201) { // Common success statuses
        console.log('Product details updated successfully!', response.data);
        setSnackbarMessage('Product details updated successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);

        // Optionally, if the API returns the updated product, you can update your local state
        // setProduct(response.data.updatedProduct); // Adjust based on your API response structure
      } else {
        // Handle API errors (e.g., non-2xx status codes)
        console.error('Failed to update product details:', response.data);
        setSnackbarMessage(response.data.message || 'Failed to update product details.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error sending update request:', error);
      setSnackbarMessage('Error updating product details. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

    const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  if (!product) {
    return <p>No product details found.</p>;
  }

  const handleWarehouseChange = (event) => {
    setSelectedWarehouse(event.target.value);
  };


    const handleStartDateChange = (newDate) => {
    setStartDateHelium(newDate);
  };

  const handleEndDateChange = (newDate) => {
    setEndDateHelium(newDate);
  };
  const handleOnHandChange = (index, value) => {
    let updatedInventory = [...inventory];
    updatedInventory[index].onHand = value;
    updatedInventory[index].available = value - updatedInventory[index].reserved;
    setInventory(updatedInventory);
  };

  const handleBinLocationChange = (index, value) => {
    let updatedInventory = [...inventory];
    updatedInventory[index].binLocation = value;
    setInventory(updatedInventory);
  };

  const handleRemoveRow = (index) => {
    let updatedInventory = [...inventory];
    updatedInventory.splice(index, 1);
    setInventory(updatedInventory);
  };


  // Handle file selection
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file)); // Create a URL for the uploaded image
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page whenever rows per page changes
  };

  const startIndex = page * rowsPerPage;  // Index of the first item to display
  const endIndex = startIndex + rowsPerPage; // Index of the last item to display
  const currentOrders = ordersData.slice(startIndex, endIndex);  // Get the orders for the current page

  const handleBackClick = () => {
    // Correct syntax for query params
    navigate(`/Home/products?page=${currentPage}&&rowsPerPage=${rowsPerPageURL}`);
  };
  


  // Handle image removal
  const handleRemoveImage = () => {
    setUploadedImage(null); // Clear the uploaded image state
  };
  return (
    <Box sx={{ maxWidth: '100%' ,margin: 'auto', padding: '45px' }}>

           {/* Back and Title Section */}
            <Box sx={{ display: "flex",marginLeft: '-43px', alignItems: "center", padding: "20px" }}>
              <IconButton sx={{ marginLeft: "-3%" }} onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Typography gutterBottom sx={{ fontSize: "18px", marginTop: "7px" }}>
               Back to Products
              </Typography>
            </Box>
      <Typography variant="h5" sx={{ mb: 2, marginTop:'2%', color: '#000080' }}>Edit Product</Typography>
      <Tabs
  value={tabIndex}
  onChange={(e, newIndex) => setTabIndex(newIndex)}
  className="custom-tabs" // Add custom class name
  sx={{
    '& .MuiTab-root': {
      color: '#000080',
      fontWeight: 700,
      fontSize: '16px',
      textTransform: 'capitalize'
    },
    '& .Mui-selected': {
      color: '#000080',
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#000080',
    },
    marginBottom: 2
  }}
>
  <Tab label="Product Info" />
  <Tab label="Description" />
  <Tab label="Images" />
  {/* <Tab label="Inventory" /> */}
  <Tab label="Listings" />
  <Tab label="Orders" />
  <Tab label="Attributes" />
  <Tab label="Variants" />
</Tabs>



      {/* Save and Save & Close buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button sx={{ backgroundColor: '#000080', color: "#fff", mr: 2, textTransform: 'capitalize' }} variant="contained"   onClick={handleSave}>Save</Button>
        {/* <Button sx={{ backgroundColor: '#000080', color: "#fff", textTransform: 'capitalize' }} variant="outlined">Save & Close</Button> */}
      </Box>

{/* Content Based on Selected Tab */}
{tabIndex === 0 && (
  <Paper sx={{ padding: 3 }}>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Product Name"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.product_title || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="SKU"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.sku || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Category"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.category || ""} // Bind to category
        />
      </Grid>

      {/* Brand Select Field */}
      <Grid item xs={6}>
        <TextField
          label="Brand"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.brand_name || ""} // Bind to brand_name
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Manufacturer"
          fullWidth
          size="small"
          disabled
          sx={{ mb: 2 }}
          value={product.manufacturer_name || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Model Number"
          fullWidth
          size="small"
          disabled
          sx={{ mb: 2 }}
          value={product.model_number || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Price ($)"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          type="number"
          value={product.price || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="MSRP ($)"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          type="number"
          value={product.msrp || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Currency"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
         disabled
          value={product.currency || ""}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Quantity"
          fullWidth
          size="small"
          disabled
          sx={{ mb: 2 }}
          value={product.quantity || ""}
        />
      </Grid>
         <Grid item xs={6}>
              <TextField
                label="Vendor Funding"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                value={product.vendor_funding ?? "0"}
                placeholder="0"
                onChange={(e) => setProduct({ ...product, vendor_funding: e.target.value })}
              />
      </Grid>
         <Grid item xs={6}>
              <TextField
                label="Vendor Discount"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                value={product.vendor_discount ?? "0"}
                placeholder="0"
                onChange={(e) => setProduct({ ...product, vendor_discount: e.target.value })}
              />
      </Grid>

              <Grid item xs={6}>
        <TextField
          label=" Amazon Product Cost"
          fullWidth
          size="small"
          disabled
          sx={{ mb: 2 }}
          value={product.product_cost || "0"}
        />
      </Grid>

              <Grid item xs={6}>
        <TextField
          label="Amazon Fee"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.referral_fee || "0"}
        />
      </Grid>
             <Grid item xs={6}>
        <TextField
          label="Amazon Shipping Cost"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.a_shipping_cost || "0"}
        />
      </Grid>

             <Grid item xs={6}>
        <TextField
          label="Amazon Total COGS"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.total_cogs || "0"}
        />
      </Grid>

              <Grid item xs={6}>
        <TextField
          label="Walmart Product Cost"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.w_product_cost || "0"}
        />
      </Grid>

              <Grid item xs={6}>
        <TextField
          label="Walmart Fee"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.walmart_fee || "0"}
        />
      </Grid>
    <Grid item xs={6}>
        <TextField
          label="Walmart Shipping Cost"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.w_shiping_cost || "0"}
        />
      </Grid>
          <Grid item xs={6}>
        <TextField
          label="Walmart Total COGS"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.w_total_cogs || "0"}
        />
      </Grid>
       <Grid item xs={6}>
        <TextField
          label="Pack Size"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          disabled
          value={product.pack_size || "0"}
        />
      </Grid>

    <LocalizationProvider dateAdapter={AdapterDayjs} locale="en"> {/* Wrap with LocalizationProvider */}
      <Grid item xs={6} sx={{ display: 'flex' }}>
        <Box sx={{ paddingRight: '4px', width: '300px' }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            views={["year", "month", "day"]}
            disableFuture
            maxDate={endDate}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                sx={{
                  minWidth: 90,
                  pr: '5px', // Padding right applied here
                  '& .MuiInputBase-root': { height: 30, fontSize: '12px' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                }}
              />
            )}
          />
        </Box>
        {/* End Date Picker */}
        <Box sx={{ width: '300px' }}>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            views={["year", "month", "day"]}
            minDate={startDate}
            shouldDisableDate={(date) => date.isBefore(startDate, 'day')}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                sx={{
                  minWidth: 90,
                  pr: '5px', // Padding right applied here
                  '& .MuiInputBase-root': { height: 30, fontSize: '12px' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                }}
              />
            )}
          />
        </Box>
      </Grid>
    </LocalizationProvider>
    </Grid>
  </Paper>
)}

{tabIndex === 1 && (
  <Paper sx={{ padding: 3 }}>
    <Grid container spacing={2}>
      {/* Description Field */}
      <Grid item xs={12}>
        <Typography fontWeight="bold">Description</Typography>
        <TextField
          fullWidth
          multiline
          rows={4} // Reduced height
          variant="outlined"
          size="small"
          sx={{ fontSize: 14 }}
          value={product.product_description || ""}  // Bind the product description here
          onChange={(e) => setProductDescription(e.target.value)}  // Optional: Update state if needed
        />
      </Grid>

      {/* Feature Fields */}
      {product.features && product.features.length > 0 ? (
        product.features.map((feature, index) => (
          <Grid item xs={12} key={index}>
            <Typography fontWeight="bold">{`Feature ${index + 1}`}</Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small" // Reduces field height
              sx={{ height: 40 }} // Additional height control
              value={feature}  // Bind the feature text here
              onChange={(e) => handleFeatureChange(e, index)}  // Optional: Update state for specific feature
            />
          </Grid>
        ))
      ) : (
        <Grid item xs={12}>
          <Typography>No features available</Typography>
        </Grid>
      )}
    </Grid>
  </Paper>
)}



{tabIndex === 2 && (
    <Paper sx={{ padding: 3 }}>
    <Typography variant="h6">Upload Image</Typography>

    {/* Main Image Upload */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Main Image</Typography>
      {product.image_url ? (
        <Box sx={{ mb: 2 }}>
          <img
            src={product.image_url}
            alt="Main Image"
            style={{ width: '100%', maxHeight: 300, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }}
          />
        </Box>
      ) : (
        <Box>
          <TextField
            type="file"
            fullWidth
            onChange={handleImageUpload}
            sx={{ mb: 2 }}
            inputProps={{ accept: 'image/*' }}
          />
          <Typography variant="body2" color="textSecondary">
            Upload the main product image. Recommended dimensions: 1000x1000 px.
          </Typography>
        </Box>
      )}
    </Box>

    {/* Thumbnail Images Upload */}
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Thumbnail Images</Typography>
      {product.image_urls && product.image_urls.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {product.image_urls.map((imageUrl, index) => (
            <Box key={index} sx={{ position: 'relative', borderRadius: 4,  }}>
              <img
                src={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                style={{ width: 100, height: 100, objectFit: 'contain' }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  color: '#f44336',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                }}
                onClick={() => handleRemoveThumbnailImage(index)} // Function to remove thumbnail image
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No thumbnails uploaded. Please upload thumbnail images.
        </Typography>
      )}

      {/* <Box sx={{ mt: 2 }}>
        <TextField
          type="file"
          fullWidth
          onChange={handleThumbnailImageUpload} // Function to handle thumbnail image upload
          sx={{ mb: 2 }}
          inputProps={{ accept: 'image/*' }}
        />
        <Typography variant="body2" color="textSecondary">
          Upload additional thumbnail images. Recommended dimensions: 150x150 px.
        </Typography>
      </Box> */}
    </Box>
  </Paper>
)}

      {/* {tabIndex === 3 && (
        <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Add Warehouse Quantity to Product:
          </Typography>
          <Select
  value={selectedWarehouse}
  onChange={handleWarehouseChange}
  displayEmpty
  sx={{
    width: "200px", // Dropdown width reduced
    height: "40px", // Dropdown height reduced
    fontSize: "14px", // Font size slightly smaller
    marginBottom: 2,
  }}
>
  <MenuItem value="" disabled>
    Select a Warehouse
  </MenuItem>
  <MenuItem value="warehouse1">Warehouse 1</MenuItem>
  <MenuItem value="warehouse2">Warehouse 2</MenuItem>
</Select>

          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {[
                    "Priority",
                    "Warehouse Name",
                    "On Hand",
                    "Available",
                    "Reserved",
                    // "Bin Location",
                    "Actions",
                  ].map((head) => (
                    <TableCell key={head} sx={{ fontWeight: "bold", fontSize: "15px" }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.onHand}
                        onChange={(e) => handleOnHandChange(index, parseInt(e.target.value, 10))}
                        size="small"
                        sx={{ width: "80px" }}
                      />
                    </TableCell>
                    <TableCell>{item.available}</TableCell>
                    <TableCell>{item.reserved}</TableCell>
                 
                    <TableCell>
                      <IconButton onClick={() => handleRemoveRow(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "#f9f9f9", fontWeight: "bold" }}>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell>
                    {inventory.reduce((sum, item) => sum + item.onHand, 0)}
                  </TableCell>
                  <TableCell>
                    {inventory.reduce((sum, item) => sum + item.available, 0)}
                  </TableCell>
                  <TableCell>
                    {inventory.reduce((sum, item) => sum + item.reserved, 0)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )} */}
{tabIndex === 3 && (
  <Paper sx={{ padding: 3 }}>
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
           
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              Channel
            </TableCell>
             <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              Listing Status
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
              Quantity
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {product && (
            <TableRow key={product.id}>
    <TableCell
  align="center"
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" alignItems="center">
    {product.marketplace_image_url && product.marketplace_image_url.length > 0 ? (
      product.marketplace_image_url.map((imageUrl, imgIndex) => (
        <Box
          key={imgIndex}
          sx={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <img
            src={imageUrl}
            alt={`${product.product_title} - Marketplace Image ${imgIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      ))
    ) : (
      <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', width: '100%' }}>
        N/A
      </Typography>
    )}
  </Box>
</TableCell>


              <TableCell align="center">
              <Chip
  label="Active"
  color="success"
  sx={{ fontWeight: "bold" }}
/>

              </TableCell>
             
              <TableCell align="center">
                <Chip label={product.quantity} color={product.quantity > 10 ? "primary" : "error"} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
)}


{tabIndex === 4 && (
<ProductOrdersDetailTab/>

)}


{tabIndex === 5 && (
<ProductAttributes productAttribute={attributes} />
)}

{tabIndex === 6 && (

  <DetailVarient/>
)}


<Snackbar
  open={openSnackbar}
  autoHideDuration={6000} // How long the Snackbar stays open (in milliseconds)
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Positioned at the bottom-right
>
  <Alert
    onClose={handleCloseSnackbar}
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
    </Box>

    
  
  );
};

export default ProductDetails;
