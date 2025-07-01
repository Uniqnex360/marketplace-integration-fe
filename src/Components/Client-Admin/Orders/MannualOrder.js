import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,

  MenuItem,
  InputLabel,
  Divider,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, FormControl
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Autocomplete } from "@mui/material";
import { toast } from "react-toastify"; // Import toastify functions
import InputAdornment from '@mui/material/InputAdornment';


const MannualOrder = ({ handleClose, order ,detialId}) => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(order?.customerName || "");
  const [address, setAddress] = useState(order?.address || "");
  const [quantity, setQuantity] = useState(order?.quantity || "");
  const [unitPrice, setUnitPrice] = useState(order?.unitPrice || "");
  const [productId, setProductId] = useState(order?.productId || "");
  const [totalPrice, setTotalPrice] = useState(order?.totalPrice || "");
  const [tags, setTags] = useState(order?.tags || "");
  const [notes, setNotes] = useState(order?.notes || "");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(order?.expectedDeliveryDate || "");
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "");
  const [shipmentCost, setShipmentCost] = useState(order?.shipmentCost || "");
  const [shipmentSpeed, setShipmentSpeed] = useState(order?.shipmentSpeed || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);  // Track selected products
  const [taxes, setTaxes] = useState("");
  const [currency, setCurrency]=useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [shipped, setShipped] = useState(false);
  const [paid, setPaid] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shipmentType, setShipmentType] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [discount, setDiscount] = useState('0');
  const [mail, setMail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [packageDimensions, setPackageDimensions] = useState("");
  const [weight, setWeight] = useState();
  const [shipmentMode, setShipmentMode] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [channelName, setChannelName] = useState("All");
  const [channelOrderId, setChannelOrderId] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState("");

  const [weightValue, setWeightValue] = React.useState('0');
  const [weightUnit, setWeightUnit] = React.useState('lbs'); // Default to lbs
const [orderId, setOrderId] =useState("")

  useEffect(() => {
    console.log(detialId, 'jjjjjj');  
    if (order) {
      const formattedProducts = order?.ordered_products?.map(product => ({
        id: product.product_id || "",
        productTitle: product.product_title || "Unknown Product",
        sku: product.sku || "Unknown SKU",
        unitPrice: product.price || 0,
        quantity: product.quantity || 1,
        totalPrice: product.quantity_price ?? (product.price || 0) * (product.quantity || 1),
      }));
      
      console.log('Formatted Products:', formattedProducts);
      setSelectedProducts(formattedProducts);
      
      setOrderId(order?.id)
      setCustomerName(order.customer_name || "");
      setAddress(order.shipping_address || "");
      setQuantity(order.total_quantity || "");
      setTotalPrice(order.total_price || "");
      setTags(order.tags || "");
      setCustomerNote(order.customer_note || "");
      if (order?.expected_delivery_date) {
        // Convert the ISO string into a date and format it as YYYY-MM-DD
        const formattedDate = new Date(order.expected_delivery_date).toISOString().split("T")[0];
        setExpectedDeliveryDate(formattedDate);
      }

      if (order?.purchase_order_date) {
        // Convert the ISO string into a date and format it as YYYY-MM-DD
        const formattedDate = new Date(order.purchase_order_date).toISOString().split("T")[0];
        setPoDate(formattedDate);
      }

      setPaymentStatus(order.payment_status || "");
      setShipmentCost(order.shipment_cost || "");
      setShipmentSpeed(order.shipment_speed || "");
      setTaxes(order.tax || "");
      setCurrency(order.currency || "");
      setPoNumber(order.order_id || "");
      setWeightValue(order.weight)
      setWeightUnit(order.weight_value)
      setSupplierName(order.supplier_name || "");
      setShipmentType(order.shipment_type || "");
      setOrderStatus(order.order_status || "");
      setPaymentMode(order.payment_mode || "");
      setTransactionId(order.transaction_id || "");
      setDiscount(order.discount || 0);
      setMail(order.mail || "");
      setPackageDimensions(order.package_dimensions || "");
      setWeight(order.weight || "");
      setShipmentMode(order.shipment_mode || "");
      setCarrier(order.carrier || "");
      setTrackingNumber(order.tracking_number || "");
      setChannelName(order.channel_name || "All");
      setChannelOrderId(order.channel_order_id || "");
      setFulfillmentType(order.fulfillment_type || "");

      // **Set Product Details if Available**
      if (order.ordered_products?.length > 0) {
        const product = order.ordered_products[0]; // Taking first product
        setProductId(product.product_id || "");
        setUnitPrice(product.unit_price || "");
      }
    }
  }, [order]);


  const handleWeightChange = (event) => {
    setWeightValue(event.target.value);
  };

  const handleUnitChange = (event) => {
    setWeightUnit(event.target.value);
  };

  const [skip, setSkip] = useState(0);
  const limit = 50;
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  const [errors, setErrors] = useState({
    productId:"",
    productTitle: "",
    sku: "",
    quantity: "",
    unitPrice: "",
    customerName: "",
    address: "",
  });

  const handleBackClick = () => {
    handleClose();
    if (orderId) {
    //   // Use template literals correctly to inject detailId
      navigate(`/Home/orders/customList/${orderId}`);
    } else {
      navigate("/Home/orders");
    }
  };
  


  // const removeProduct = (index) => {
  //   const updatedProducts = [...selectedProducts];
  //   updatedProducts.splice(index, 1); // Remove product from array
  //   setSelectedProducts(updatedProducts);
  // };

  const fetchProductTitle = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductListForOrdercreation/`,
        {
          user_id: userIds,
          search_query: searchQuery,
          skip: skip.toString(),
          limit: limit.toString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && Array.isArray(response.data.data)) {
        if (skip === 0) {
          setProductList(response.data.data); // Set the product list if it's the first fetch
        } else {
          setProductList((prevList) => [...prevList, ...response.data.data]); // Append products on subsequent fetch
        }
      } else {
        console.error("Failed to fetch products or invalid response data.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log('909090',order)
       fetchProductTitle(); // Fetch when searchQuery is at least 3 characters long or when skipping
    // }
  }, [searchQuery, skip]); // Dependencies: searchQuery and skip


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleScroll = (e) => {
    const target = e.target;
     if (target.scrollHeight - target.scrollTop === target.clientHeight && !loading) {
      setSkip((prevSkip) => prevSkip + limit); // Increment skip value to load more data
    }
  };


  const debounceSearch = useRef(null);

  useEffect(() => {
    
  // console.log('Updated Selected Products:', order.ordered_products);

     clearTimeout(debounceSearch.current);
    debounceSearch.current = setTimeout(() => {
      if (searchQuery.length >= 3) {  // Only trigger search if search query length is more than 3 characters
        fetchProductTitle();
      }
    }, 500); // Delay in ms

    return () => clearTimeout(debounceSearch.current); // Cleanup on component unmount
  }, [searchQuery]);


  const validateFields = () => {
    const newErrors = {};
    if (!customerName) newErrors.customerName = "Customer Name is required";
    if (!address) newErrors.address = "Address is required";
    if(!shipmentCost) newErrors.shipmentCost ="Shipment Cost is required"
    return newErrors;
  };



  useEffect(() => {
    // Calculate total price when quantity or unitPrice changes
    if (quantity && unitPrice && !isNaN(quantity) && !isNaN(unitPrice)) {
      const calculatedTotal = parseFloat(quantity) * parseFloat(unitPrice);
      setTotalPrice(calculatedTotal === 0 ? '0.00' : calculatedTotal.toFixed(2)); // Show 0 if total is 0
    } else {
      setTotalPrice('0.00'); // Show 0 when quantity or unitPrice is invalid
    }
  }, [quantity, unitPrice]);
  


  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    if (value) {
      setErrors({ ...errors, customerName: "" })
    } else {
      setErrors({ ...errors, customerName: "Customer Name is required" })
    }
  };


  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (value) {
      setErrors({ ...errors, address: "" })
    } else {
      setErrors({ ...errors, address: "Address is required" })
    }
  };

  const handleCreateOrder = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Stop further processing if validation fails
    }
 
    const orderedProducts = selectedProducts.map((product) => ({
      product_id: product.productId || product.id,
      title: product.productTitle,
      sku: product.sku,
      unit_price: product.unitPrice,
      quantity: product.quantity,
      quantity_price: product.totalPrice, // This will be unit_price * quantity
    }));

      const customProductObj = {
      total_quantity: selectedProducts.reduce((acc, product) => acc + product.quantity, 0),
      total_price: selectedProducts.reduce((acc, product) => acc + product.totalPrice, 0), 
      shipment_type: shipmentType,  
      order_status: orderStatus, 
      payment_status: paymentStatus,  
      payment_mode: paymentMode,  
      transaction_id: transactionId, 
      discount: discount, 
      mail: mail,
      package_dimensions: packageDimensions,  
      weight:weightValue,
      weight_value:weightUnit,
      shipment_cost: shipmentCost ? shipmentCost : '', 
      shipment_speed: shipmentSpeed, 
      shipment_mode: shipmentMode, 
      carrier: carrier,  
      tracking_number: trackingNumber, 
    
      channel_order_id: channelOrderId, 
      fulfillment_type: fulfillmentType, 
      tax: taxes || 0,  
      currency: currency || '',
      contact_number: poNumber || "", 
      purchase_order_date: poDate || new Date(),  
      supplier_name: supplierName || "",  
      expected_delivery_date: expectedDeliveryDate || "",  
      tags: tags || "",  
      customer_note: customerNote || "",  
      customer_name: customerName || "",  
      shipping_address: address || "",  
    };
    try {
      const requestData = {
        user_id: userIds,
        ordered_products: orderedProducts, // The products array
        custom_product_obj: customProductObj, // The custom object with order details
      };
  
      // orderId இருந்தால் `update` API, இல்லையென்றால் `create` API call
      const apiUrl = orderId 
        ? `${process.env.REACT_APP_IP}updateManualOrder/` 
        : `${process.env.REACT_APP_IP}createManualOrder/`;
  
      // orderId இருந்தால் `order_id` data-வில் சேர்க்க வேண்டும்
      if (orderId) {
        requestData.order_id = orderId;
      }
  
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 200) {
        toast.success(`Order ${orderId ? "updated" : "created"} successfully!`);
        navigate("/Home/orders");  // Navigate to the orders list page
     
  // Fetch orders after creating/updating
        handleClose();  // Close the modal
      } else {
        toast.error(`Failed to ${orderId ? "update" : "create"} order. Please try again.`);
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
      handleClose();
    }
  };
  
// Handle product change (when a product is selected)
// const handleProductChange = (event, newValue) => {
//   console.log('Selected Products:', newValue);

//   if (!newValue || newValue.length === 0) {
//     return; // Prevent updating state with empty data
//   }

//   // Ensure newValue has valid product details and avoid duplicates
//   const selectedProductDetails = newValue.map((product) => {
//     if (!product || (!product.id && !product.productId)) {
//       console.warn("Invalid product data:", product);
//       return null; // Skip invalid product entries
//     }

//     return {
//       productId: product.id || product.productId || "", // Ensure productId exists
//       productTitle: product.product_title || product.productTitle || "Unknown Product",
//       sku: product.sku || "Unknown SKU",
//       unitPrice: product.price || 0,
//       quantity: 1,
//       totalPrice: (product.price || 0) * 1,
//     };
//   }).filter(Boolean); // Remove null values from the array

//   console.log('Updated Selected Products:', selectedProductDetails);

//   // Avoid adding duplicate products
//   setSelectedProducts((prevState) => {
//     const newProducts = [...prevState];
//     selectedProductDetails.forEach((newProduct) => {
//       // Check if the product already exists based on its productId
//       const isDuplicate = newProducts.some((product) => product.productId === newProduct.productId);
//       if (!isDuplicate) {
//         newProducts.push(newProduct);
//       }
//     });
//     return newProducts;
//   });
// };


const handleProductChange = (event, newValue) => {
  console.log('Selected Products:', newValue);

  if (!newValue || newValue.length === 0) {
    return; // Prevent updating state with empty data
  }

  const selectedProductDetails = newValue.map((product) => {
    if (!product || (!product.id && !product.product_id)) {
      console.warn("Invalid product data:", product);
      return null; // Skip invalid product entries
    }

    return {
      id: product.id || product.product_id || "",  // Ensure product ID is assigned
      productTitle: product.product_title || product.title || "Unknown Product",
      sku: product.sku || "Unknown SKU",
      unitPrice: product.unit_price || product.price || 0,
      quantity: product.quantity || 1,
      totalPrice: (product.unit_price || product.price || 0) * (product.quantity || 1),
    };
  }).filter(Boolean); // Remove null values from the array

  // Avoid adding duplicate products
  setSelectedProducts((prevState) => {
    const newProducts = [...prevState];
    selectedProductDetails.forEach((newProduct) => {
      const isDuplicate = newProducts.some((product) => product.id === newProduct.id);
      if (!isDuplicate) {
        newProducts.push(newProduct);
      }
    });
    return newProducts;
  });
};


const handleInputChange = (event, newInputValue) => {
  setInputValue(newInputValue);  // Update search query state
};

const handleQuantityChange = (index, e) => {
  const value = parseInt(e.target.value, 10);  // Ensure value is an integer
  const updatedProducts = [...selectedProducts];

  // Update the quantity and total price
  updatedProducts[index].quantity = value;
  updatedProducts[index].totalPrice = updatedProducts[index].unitPrice * value;

  setSelectedProducts(updatedProducts);  // Update state with modified products
};

const handleUnitPriceChange = (index, e) => {
  const value = parseFloat(e.target.value);  // Ensure value is a float (for prices)
  const updatedProducts = [...selectedProducts];

  // Update unit price and recalculate total price
  updatedProducts[index].unitPrice = value;
  updatedProducts[index].totalPrice = value * updatedProducts[index].quantity;

  setSelectedProducts(updatedProducts);  // Update state with modified products
};

const removeProduct = (index) => {
  const updatedProducts = selectedProducts.filter((_, i) => i !== index);
  setSelectedProducts(updatedProducts);  // Remove product from the list
};

const removeProductTitle = (index) => {
  setSelectedProducts((prevState) => {
    const newProducts = [...prevState];
    newProducts.splice(index, 1); // Remove the product at the given index
    return newProducts;
  });
};


  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, overflow: "auto", maxHeight: "85vh" }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: "18px", fontWeight: 600, marginBottom: "15px", color: "#000080" }}>
          <IconButton sx={{ paddingRight: "3%", marginLeft: "-8px" }} onClick={handleBackClick}>
            <ArrowBack />
          </IconButton>
       {orderId ? "Edit Order" : "Create Order"}
        </Typography>




        {/* Product Selection */}
        <Box mb={3}>
          <Grid container alignItems="center" spacing={2}>
          {/* <Grid item xs={12}>
          <InputLabel sx={{ fontSize: 14, color: "black" }}>
    Product Title <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <Autocomplete
    multiple
    value={selectedProducts} // Ensure value format matches options
    onChange={handleProductChange}
    inputValue={inputValue}
    onInputChange={handleInputChange}
    options={productList.filter((option) => {
      // Ensure product_title or productTitle exists and is a string
      const productTitle = option.product_title || option.productTitle || "";
      return productTitle.toLowerCase().includes(inputValue.toLowerCase());
    })}
    loading={loading}
    getOptionLabel={(option) => option.product_title || option.productTitle || "Unknown Title"}
    isOptionEqualToValue={(option, value) => option.id === value.id} // Ensure consistent comparison
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        fullWidth
        size="small"
        value={inputValue}
        onChange={handleSearchChange}
        placeholder="Search for product"
      />
    )}
    ListboxProps={{
      style: { maxHeight: 300 },
    }}

    
  />
</Grid> */}


<Grid item xs={12}>
  <InputLabel sx={{ fontSize: 14, color: "black" }}>
    Product Title <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <Autocomplete
    multiple
    value={selectedProducts} // Ensure value format matches options
    onChange={handleProductChange}
    inputValue={inputValue}
    onInputChange={handleInputChange}
    options={productList.filter((option) => {
      // Ensure product_title or productTitle exists and is a string
      const productTitle = option.product_title || option.productTitle || "";
      return productTitle.toLowerCase().includes(inputValue.toLowerCase());
    })}
    loading={loading}
    getOptionLabel={(option) => option.product_title || option.productTitle || "Unknown Title"}
    isOptionEqualToValue={(option, value) => option.id === value.id} // Ensure consistent comparison
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        fullWidth
        size="small"
        value={inputValue}
        onChange={handleSearchChange}
        placeholder="Search for product"
      />
    )}
    ListboxProps={{
      style: { maxHeight: 300 },
    }}
    renderTags={(value, getTagProps) => {
      return value.map((option, index) => (
        <span key={option.id} style={{ display: "flex", alignItems: "center", marginRight: "8px", marginTop:'3px', backgroundColor: "#f0f0f0", borderRadius: "16px", fontSize:'13px', padding: "2px 8px" }}>
          {option.productTitle}
          <button
            onClick={() => removeProduct(index)}
            style={{
              marginLeft: "4px",
              cursor: "pointer",
              color: "red",
              background: "none",
              border: "none",
              fontSize: "12px",
            }}
          >
            X
          </button>
        </span>
      ));
    }}
  />
</Grid>






          </Grid>
        </Box>

        {/* Display Selected Products */}
        <Box mb={3}>
          <Grid container spacing={2}>
          <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {selectedProducts.map((product, index) => (
    <TableRow key={index}>
      <TableCell>{product.sku}</TableCell>
      <TableCell>
        <TextField
          type="number"
          value={product.quantity}
          onChange={(e) => handleQuantityChange(index, e)}
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={product.unitPrice} // Unit Price சரியாக bind செய்யப்பட்டுள்ளது
          onChange={(e) => handleUnitPriceChange(index, e)}
          size="small"
          fullWidth
        />
      </TableCell>
      <TableCell>{product.totalPrice}</TableCell> 
      <TableCell>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => removeProduct(index)}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
            </Table>
          </TableContainer>
        </Grid>
          </Grid>
        </Box>

        {/* Other Input Fields for Order Information */}
        <Box mb={3}>
          <Grid container spacing={2}>
       
          <Grid item xs={12} md={4}>
  <InputLabel sx={{ fontSize: 14, color: "black" }}>
    Customer Name <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <TextField
    fullWidth
    size="small"
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    error={!!errors.customerName}
    helperText={errors.customerName || ""}
    InputProps={{ style: { fontSize: 14 } }}
    inputProps={{ style: { fontSize: 14 }, autoComplete: "off" }}
  />
</Grid>

<Grid item xs={12} md={4}>
  <InputLabel sx={{ fontSize: 14, color: "black" }}>
    Email <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <TextField
    fullWidth
    size="small"
    value={mail}
    onChange={(e) => setMail(e.target.value)}

    error={!!errors.mail}
    helperText={errors.mail}
    InputProps={{ style: { fontSize: 14 } }}
    inputProps={{ style: { fontSize: 14 },autoComplete: "off" }}
  />
</Grid>


            <Grid item xs={12} md={4}>
  <InputLabel sx={{ fontSize: 14, color: "black" }}>
  Shipment Cost <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <TextField
    fullWidth
    value={shipmentCost}
    onChange={(e) => setShipmentCost(e.target.value)}
    size="small"
    type="number"
    error={!!errors.shipmentCost}
    helperText={errors.customerName || ""}
    InputProps={{ style: { fontSize: 14 } }}
    inputProps={{ style: { fontSize: 14 }, autoComplete: "off" }}
  />
</Grid>



<Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Purchase Order Date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true, style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14, height: 10, padding: "10px" } }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
  <TextField
    fullWidth
    type="date"
    label="Expected Delivery Date"
    value={expectedDeliveryDate}
    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
    error={errors.expectedDeliveryDate}
    helperText={errors.expectedDeliveryDate ? "Expected Delivery Date is required" : ""}
    size="small"
    InputLabelProps={{ shrink: true, style: { fontSize: 14 } }}
    inputProps={{ style: { fontSize: 14, height: 10, padding: "10px" } }}
    variant="outlined"
  />
</Grid>


            {/* <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Expected Delivery Date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                error={errors.expectedDeliveryDate}
                helperText={errors.expectedDeliveryDate ? "Expected Delivery Date is required" : ""}
                size="small"
                InputLabelProps={{ shrink: true, style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14, height: 10, padding: "10px" } }}
                variant="outlined"
              />
            </Grid> */}


<Grid item xs={12} md={12}>
  <InputLabel sx={{ fontSize: 14, color: "black" }}>
    To Address <Typography component="span" sx={{ color: "red" }}>*</Typography>
  </InputLabel>
  <TextField
    fullWidth
    value={address}
    onChange={handleAddressChange}
    error={!!errors.address}
    helperText={errors.address}
  />
</Grid>



<Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                 type="number"
                value={poNumber}
    onChange={(e) => setPoNumber(e.target.value)}
                   size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>
    
     
            {/* <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid> */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Taxes"
                value={taxes}
                onChange={(e) => setTaxes(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
    

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>


                  {/* <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Fulfillment Type</InputLabel>
                <Select
                  value={fulfillmentType}
                  onChange={(e) => setFulfillmentType(e.target.value)}
                  label="Fulfillment Type"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                  <MenuItem value="FBA">FBA</MenuItem>
                  <MenuItem value="FBM">FBM</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Shipment Method</InputLabel>
                <Select
                  value={shipmentType}
                  onChange={(e) => setShipmentType(e.target.value)}
                  label="Shipment Method"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                  <MenuItem value="Standard">Standard (2-4 days)</MenuItem>
                  <MenuItem value="Express">Express (1-2 days)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Order Status</InputLabel>
                <Select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  label="Order Status"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Payment Status</InputLabel>
                <Select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  label="Payment Status"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Payment Mode</InputLabel>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  label="Payment Mode"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                <MenuItem value="Cash" style={{ fontSize: 14 }}>Cash</MenuItem>
      <MenuItem value="Credit Card" style={{ fontSize: 14 }}>Credit Card</MenuItem>
      <MenuItem value="Debit Card" style={{ fontSize: 14 }}>Debit Card</MenuItem>
      <MenuItem value="Net Banking" style={{ fontSize: 14 }}>Net Banking</MenuItem>
      <MenuItem value="UPI" style={{ fontSize: 14 }}>UPI</MenuItem>
      <MenuItem value="Mobile Wallets" style={{ fontSize: 14 }}>Mobile Wallets</MenuItem>
      <MenuItem value="Cheques" style={{ fontSize: 14 }}>Cheques</MenuItem>
      <MenuItem value="Prepaid Cards" style={{ fontSize: 14 }}>Prepaid Cards</MenuItem>
      <MenuItem value="Buy Now, Pay Later" style={{ fontSize: 14 }}>Buy Now, Pay Later (BNPL)</MenuItem>
      <MenuItem value="PayPal" style={{ fontSize: 14 }}>PayPal</MenuItem>
      <MenuItem value="Cash on Delivery" style={{ fontSize: 14 }}>Cash On Delivery</MenuItem>

                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
  <TextField
    fullWidth
    label="Discount"
    value={discount}
    onChange={(e) => setDiscount(e.target.value)}
    size="small"
    type="number"
    InputLabelProps={{ style: { fontSize: 14 } }}
    inputProps={{ style: { fontSize: 14 } }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">%</InputAdornment>
      ),
    }}
  />
</Grid>

        
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Customer Note"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Package Dimensions"
                value={packageDimensions}
                onChange={(e) => setPackageDimensions(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>
            <Grid item xs={12} md={6} container spacing={2} alignItems="center">
  <Grid item xs={6}> {/* Container for the TextField */}
    <TextField
      fullWidth
      label="Weight"
      value={weightValue}
      onChange={handleWeightChange}
      size="small"
      type="number"
      InputLabelProps={{ style: { fontSize: 14 } }}
      inputProps={{ style: { fontSize: 14 } }}
    />
  </Grid>
  <Grid item xs={6}> {/* Container for the FormControl */}
    <FormControl fullWidth size="small">
      <InputLabel id="weight-unit-label" style={{ fontSize: 14 }}>Unit</InputLabel>
      <Select
        labelId="weight-unit-label"
        id="weight-unit"
        value={weightUnit}
        label="Unit"
        onChange={handleUnitChange}
        MenuProps={{ style: { fontSize: 14 } }}
        inputProps={{ style: { fontSize: 14 } }}
      >
        <MenuItem value="lbs" style={{ fontSize: 14 }}>Pounds (lb)</MenuItem>
        <MenuItem value="kg" style={{ fontSize: 14 }}>Kilograms (kg)</MenuItem>
        <MenuItem value="g" style={{ fontSize: 14 }}>Grams (g)</MenuItem>
        <MenuItem value="mt" style={{ fontSize: 14 }}>Metric Ton (mt)</MenuItem>
        <MenuItem value="oz" style={{ fontSize: 14 }}>Ounces (oz)</MenuItem>
        <MenuItem value="mg" style={{ fontSize: 14 }}>Milligrams (mg)</MenuItem>
        <MenuItem value="st" style={{ fontSize: 14 }}>Stone (st)</MenuItem>
      </Select>
    </FormControl>
  </Grid>
</Grid>

        
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Shipment Speed"
                value={shipmentSpeed}
                onChange={(e) => setShipmentSpeed(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>

            {/* <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel style={{ fontSize: 14 }}>Channel Name</InputLabel>
                <Select
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  label="Channel Name"
                  inputProps={{ style: { fontSize: 14 } }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Amazon">Amazon</MenuItem>
                  <MenuItem value="Shopify">Shopify</MenuItem>
                 
                </Select>
              </FormControl>
            </Grid> */}

          </Grid>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Advanced Information */}
        {/* <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Advanced Information
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={shipped} onChange={(e) => setShipped(e.target.checked)} />}
            label="Mark order as shipped"
            sx={{
              '& .MuiTypography-root': { fontSize: 14 },
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={paid} onChange={(e) => setPaid(e.target.checked)} />}
            label="Mark order as paid"
            sx={{
              '& .MuiTypography-root': { fontSize: 14 },
            }}
          />
          <TextField
            fullWidth
            label="Add tags to order"
            variant="outlined"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ style: { fontSize: 14 } }}
            inputProps={{ style: { fontSize: 14 } }}
          />
          <TextField
            fullWidth
            label="Add a note to order"
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ style: { fontSize: 14 } }}
            inputProps={{ style: { fontSize: 14 } }}
          />
        </Box> */}

        {/* Actions */}
        <Grid container justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            sx={{ textTransform: 'capitalize', backgroundColor: '#000080' }}
            onClick={handleCreateOrder} // Call handleCreateOrder on button click
          >
           {orderId ? "Update" : "Create "}  
          </Button>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MannualOrder;