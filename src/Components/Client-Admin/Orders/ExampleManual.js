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
  Select,
  MenuItem,
  InputLabel,
  Divider,
  IconButton,Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Autocomplete } from "@mui/material";
import { toast } from "react-toastify"; // Import toastify functions


const MannualOrder = ({ handleClose }) => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productId, setProductId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const autocompleteRef = useRef(null);

  const [totalPrice, setTotalPrice] = useState("");
  const [taxes, setTaxes] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [shipped, setShipped] = useState(false);
  const [paid, setPaid] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSKU, setSelectedSKU] = useState("");
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [skip, setSkip] = useState(0);
  const limit = 50;

  const [errors, setErrors] = useState({
    productTitle: "",
    sku: "",
    quantity: "",
    unitPrice: "",
    customerName: "",
    address: "",
  });

  const handleBackClick = () => {
    handleClose();
    navigate("/Home/orders");
  };

  const fetchProductTitle = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductListForOrdercreation/`,
        {
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
          setProductList(response.data.data);
        } else {
          setProductList((prevList) => [...prevList, ...response.data.data]);
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
    fetchProductTitle();
  }, [searchQuery, skip]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleScroll = (e) => {
    const target = e.target;
    if (target.scrollHeight - target.scrollTop === target.clientHeight && !loading) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

//   const handleProductChange = (event, newValue) => {
//     setSelectedProduct(newValue);
//     if (newValue) {
//       const product = productList.find(
//         (item) => item.product_title === newValue
//       );
//       if (product) {
//         setProductId(product?.id);
//         setSelectedSKU(product.sku);
//         setUnitPrice(product.price);
//         setErrors({...errors, productTitle: ""})
//       } else {
//         setSelectedSKU("");
//         setUnitPrice(0);
//       }
//     } else {
//       setSelectedSKU("");
//       setUnitPrice(0);
//     }
//   };

//   const handleInputChange = (event, newInputValue) => {
//     setInputValue(newInputValue);
//   };

  const validateFields = () => {
    const newErrors = {};
    if (!selectedProduct) newErrors.productTitle = "Product Title is required";
    if (!selectedSKU) newErrors.sku = "SKU is required";
    if (!quantity || quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (!customerName) newErrors.customerName = "Customer Name is required";
    if (!address) newErrors.address = "Address is required";
    return newErrors;
  };



  useEffect(() => {
    // Calculate total price when quantity or unitPrice changes
    if (quantity && unitPrice && !isNaN(quantity) && !isNaN(unitPrice)) {
      setTotalPrice((parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2));
    } else {
      setTotalPrice(''); // Clear total price if quantity or unitPrice is invalid
    }
  }, [quantity, unitPrice]);

//   const handleQuantityChange = (e) => {
//     const value = e.target.value;
//     setQuantity(value);
//     if (value && value > 0) {
//       setErrors({ ...errors, quantity: '' });
//     } else {
//       setErrors({ ...errors, quantity: 'Quantity must be greater than 0' });
//     }
//   };

//   const handleUnitPriceChange = (e) => {
//     const value = e.target.value;
//     setUnitPrice(value);
//   };
 

  const handleCustomerNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    if(value) {
      setErrors({...errors, customerName: ""})
    } else {
      setErrors({...errors, customerName: "Customer Name is required"})
    }
  };


  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if(value) {
      setErrors({...errors, address: ""})
    } else {
      setErrors({...errors, address: "Address is required"})
    }
  };

    const handleCreateOrder = async () => {
      const validationErrors = validateFields();
      setErrors(validationErrors);
  
      if (Object.keys(validationErrors).length > 0) {
        return; // Stop further processing if validation fails
      }
  
      const orderData = {
        product_id: productId,  // Assuming `selectedProduct` contains the product ID
        product_title: selectedProduct,
        sku: selectedSKU,
        customer_name: customerName,
        to_address: address,
        quantity: quantity,
        total_price: unitPrice * quantity, // Assuming total price is unit price * quantity
        taxes: 0, // Placeholder if taxes need to be added
        phone_number: poNumber,  // Add PO number or any other field you need
        purchase_order_date: new Date(),  // Assuming current date as PO date
        supplier_name: "",  // Add supplier name if needed
        expected_delivery_date: expectedDeliveryDate,  // Assuming empty if not provided
        tags: "",  // Add tags if needed
        notes: "",  // Add notes if needed
        unit_Price: unitPrice,
      };
  
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_IP}createManualOrder/`,
          orderData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status === 200) {
          toast.success("Order created successfully!");  // Show success toast
          
          navigate("/Home/orders");
          handleClose();
        } else {
          toast.error("Failed to create order. Please try again.");  // Show error toast
          handleClose();
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred. Please try again.");  // Show error toast
        handleClose();
      }
    };


    
  const handleProductChange = (event, newValue) => {
    // Handle selection of multiple products
    if (newValue) {
      const selectedProductDetails = newValue.map((productTitle) => {
        const product = productList.find((item) => item.product_title === productTitle);
        return {
          productId: product?.id,
          productTitle: product?.product_title,
          sku: product?.sku,
          unitPrice: product?.price,
          quantity: 1,
          totalPrice: product?.price,  // Initialize total price as unit price * quantity
        };
      });
      setSelectedProducts(selectedProductDetails);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleQuantityChange = (index, e) => {
    const value = e.target.value;
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = value;
    updatedProducts[index].totalPrice = value * updatedProducts[index].unitPrice;
    setSelectedProducts(updatedProducts);
  };

  const handleUnitPriceChange = (index, e) => {
    const value = e.target.value;
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].unitPrice = value;
    updatedProducts[index].totalPrice = value * updatedProducts[index].quantity;
    setSelectedProducts(updatedProducts);
  };
  

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, overflow: "auto", maxHeight: "85vh" }}>
        <Typography variant="h5" gutterBottom sx={{ fontSize: "18px", fontWeight: 600, marginBottom: "15px", color: "#000080" }}>
          <IconButton sx={{ paddingRight: "3%", marginLeft: "-8px" }} onClick={handleBackClick}>
            <ArrowBack />
          </IconButton>
          Create Order
        </Typography>

        {/* <Box mb={3}>
  <Grid container alignItems="center" spacing={2}>
  <Grid item xs={6} sx={{ paddingLeft: "7px", paddingRight: "10px" }}>
    <InputLabel sx={{ width: "150px" }}>Product Title:</InputLabel>
    <Autocomplete
        ref={autocompleteRef}
        value={selectedProduct}
        onChange={handleProductChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={productList.map((option) => option.product_title)}
        error={!!errors.productTitle}
        helperText={errors.productTitle}
        renderInput={(params) => (
            <TextField
                {...params}
                variant="outlined"
                fullWidth
                size="small"
                error={!!errors.productTitle} // Add error prop here
                helperText={errors.productTitle} // Add helperText prop here
            />
        )}
        onOpen={(e) => {
            if (autocompleteRef.current && autocompleteRef.current.querySelector('.MuiAutocomplete-listbox')) {
                autocompleteRef.current.querySelector('.MuiAutocomplete-listbox').addEventListener('scroll', handleScroll);
            }
        }}
        onClose={() => {
            if (autocompleteRef.current && autocompleteRef.current.querySelector('.MuiAutocomplete-listbox')) {
                autocompleteRef.current.querySelector('.MuiAutocomplete-listbox').removeEventListener('scroll', handleScroll);
            }
        }}
        ListboxProps={{
            style: { maxHeight: 300 },
        }}
    />
</Grid>
<Grid item xs={6} sx={{ paddingLeft: "10px", paddingRight: "7px" }}>
    <InputLabel sx={{ width: "150px" }}>SKU:</InputLabel>
    <TextField
        value={selectedSKU}
        onChange={(e) => {
            setSelectedSKU(e.target.value);
            if (e.target.value) {
                setErrors({ ...errors, sku: "" });
            } else {
                setErrors({ ...errors, sku: "SKU is required" });
            }
        }}
        fullWidth
        variant="outlined"
        size="small"
        inputProps={{ readOnly: true }}
      
    />
</Grid>
  </Grid>
</Box> */}



        {/* Product Selection */}
        <Box mb={3}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12}>
              <InputLabel sx={{ width: "150px" }}>Product Title:</InputLabel>
              <Autocomplete
                multiple
                value={selectedProducts.map((product) => product.productTitle)}
                onChange={handleProductChange}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                options={productList.map((option) => option.product_title)}
                renderInput={(params) => <TextField {...params} variant="outlined" fullWidth size="small" />}
                onOpen={(e) => {
                  if (autocompleteRef.current && autocompleteRef.current.querySelector('.MuiAutocomplete-listbox')) {
                    autocompleteRef.current.querySelector('.MuiAutocomplete-listbox').addEventListener('scroll', handleScroll);
                  }
                }}
                onClose={() => {
                  if (autocompleteRef.current && autocompleteRef.current.querySelector('.MuiAutocomplete-listbox')) {
                    autocompleteRef.current.querySelector('.MuiAutocomplete-listbox').removeEventListener('scroll', handleScroll);
                  }
                }}
                ListboxProps={{ style: { maxHeight: 300 } }}
              />
            </Grid>
          </Grid>
        </Box>



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
              <TableCell>Actions</TableCell> {/* For actions like edit/remove */}
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
                    value={product.unitPrice}
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
                    onClick={() => removeProduct(index)} // Remove product function
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={customerName}
                onChange={handleCustomerNameChange}
                error={!!errors.customerName}
                helperText={errors.customerName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="To Address"
                value={address}
                onChange={handleAddressChange}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={handleQuantityChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
              />
            </Grid>
            <Grid item xs={12} md={4}>
            <TextField
                fullWidth
                type="number"
                label="Unit Price"
                value={unitPrice}
                inputProps={{ readOnly: true }}
                
                onChange={handleUnitPriceChange}
               
            />
        </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Total Price"
                value={totalPrice}
                inputProps={{ readOnly: true }} 
                onChange={(e) => setTotalPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Taxes"
                value={taxes}
                onChange={(e) => setTaxes(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                size="small"
                InputLabelProps={{ style: { fontSize: 14 } }}
                inputProps={{ style: { fontSize: 14 } }}
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
            <Grid item xs={12} md={4}>
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

<Grid item xs={12} md={4}>
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


          </Grid>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Advanced Information */}
        <Box mb={3}>
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
        </Box>

        {/* Actions */}
        <Grid container justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            sx={{ textTransform: 'capitalize', backgroundColor: '#000080' }}
            onClick={handleCreateOrder} // Call handleCreateOrder on button click
          >
            Create
          </Button>
        </Grid>
      </Paper>
    </Container>
  );
};

export default MannualOrder;