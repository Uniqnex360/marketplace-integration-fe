import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Table,Button, TableCell, TableBody, TableRow, TableContainer, Paper, TableHead, Tooltip, Grid, Box, Modal,
  Slide, Menu, IconButton } from "@mui/material";
import axios from "axios";
import AddIcon from '@mui/icons-material/Add'; // Import the AddIcon
import MannualOrder from "./MannualOrder";
import EditIcon from '@mui/icons-material/Edit';

import {
  Storefront,
  CalendarToday,
  LocalShipping,
  CreditCard,
  Person,
  Email,
  Phone, 
  CheckCircle, 
  AttachMoney, 
  ConfirmationNumber,
  ArrowBack
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useNavigate,useLocation } from "react-router-dom";

function CustomOrderList() {
    const navigate = useNavigate();
    const { id } = useParams();  // Capture the order ID from the URL parameter
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const userData = localStorage.getItem("user");

    const subtotal = order?.ordered_products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
const discount = order?.discount || 0;
const afterDiscountTotal = subtotal - discount;
const tax = order?.tax || 0;
const shippingCost = order?.shipment_cost || 0;
const totalOrderValue = afterDiscountTotal + tax + shippingCost;
      const [open, setOpen] = useState(false);
    let userIds = "";
  const location = useLocation();
    if (userData) {
      const data = JSON.parse(userData);
      userIds = data.id;
    }
      const queryParams = new URLSearchParams(location.search);
      const detailsPage = queryParams.get('detail');
      const productId = queryParams.get('productId');
    const handleBackClick = () => {
         const currentPage = queryParams.get('page') || 1; // Ensure current page is retrieved
    const rowsPerPageURL = queryParams.get('rowsPerPage');        
    if (detailsPage === 'detail-name') {
        navigate(`/Home/products/details/${productId}?page=${currentPage}&rowsPerPage=${rowsPerPageURL}&name=orderTab`);
    }
    else{
    navigate(`/Home/orders?page=${currentPage}&rowsPerPage=${rowsPerPageURL}`);
    
    }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  

    // Fetch Order Details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_IP}fetchManualOrderDetails/`, {
                    params: { order_id: id, user_id:userIds },
                });

                // Bind the response to the state
                if (response.data && response.data.data && response.data.data.order_details) {
                    setOrder(response.data.data.order_details); // Set the order details from the response
                } else {
                    setOrder(null); // Handle case where no order is found or data is missing
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
                setOrder(null); // Ensure the UI can handle errors gracefully
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    const formatDate = (timestamp) => {
      if (timestamp) {
        return new Date(timestamp).toLocaleDateString();
      }
      return "";
    };
  

    if (!order) {
        return <div>No order details found</div>;
    }

    // Destructure the order object fields
    const { 
        product_title, sku, customer_name, shipping_address, total_price, customer_order_id,shipment_cost,shipment_type,
        phone_number, purchase_order_date, expected_delivery_date, product_image,created_at, order_id,
        mail, contact_number, fulfillment_type, channel_name, order_status, ordered_products,shipment_mode
    } = order;

    return (
 <Box sx={{ p: 3, backgroundColor: "#f4f6f8" }}>
      <div style={{ padding: "20px", fontSize: "14px" }}>
        {/* Back and Title Section */}
        <Box sx={{ display: "flex", alignItems: "center", padding: "20px" }}>
          <IconButton sx={{ marginLeft: "-3%" }} onClick={handleBackClick}>
            <ArrowBack />
          </IconButton>
          <Typography gutterBottom sx={{ fontSize: "18px", marginTop: "7px" }}>
            Back to Orders
          </Typography>
        </Box>

  <Box
  sx={{
    display: "flex",
    alignItems: "center",
    marginRight:'20px',
    justifyContent: "end", // Pushes items apart
    // padding: "16px",
  }}
>

  {/* Edit Order Button - Aligned to Right */}
  <Tooltip title="Edit Order" arrow>
  <Button
    variant="text"
    color="primary"
    sx={{
      backgroundColor: "#000080",
      fontSize: "14px",
      color: "white",
      fontWeight: 400,
      minWidth: "auto",
      padding: "8px 17px",
      textTransform: "capitalize",
      height: "30px",
      width:'40px',
      "&:hover": {
        backgroundColor: "darkblue",
      },
    }}
    onClick={handleOpen}
  >
    <EditIcon sx={{ marginRight: "3px" }} />
  </Button>
  </Tooltip>
</Box>

        <Grid container spacing={3} style={{ paddingLeft: '22px', paddingRight: '20px', marginTop: "10px" }}>
         {/* Fulfillment Status */}
                <Grid item xs={12} md={4}>
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Order Details
      </Typography>

      {/* Marketplace */}
      {/* <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Tooltip title="Channel" arrow>
            <Storefront sx={{ color: "#000080" }} />
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography>{channel_name || "Not Available"}</Typography>
        </Grid>
      </Grid> */}

      {/* Order Date */}
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Tooltip title="Order Date" arrow>
            <CalendarToday sx={{ color: "#000080" }} />
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography>{formatDate(purchase_order_date)}</Typography>
        </Grid>
      </Grid>

      {/* Order Status */}
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Tooltip title="Order Status" arrow>
            <CheckCircle sx={{ color: "#000080" }} />
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography>{order_status || "Not Applicable"}</Typography>
        </Grid>
      </Grid>

      {/* Order Total */}
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <Tooltip title="Order Total" arrow>
            <AttachMoney sx={{ color: "#000080" }} />
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography>{total_price ? `$${total_price.toFixed(2)}` : "Not Applicable"}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>



   <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Details
                </Typography>

                {/* Customer Name */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Customer Name" arrow>
                      <Person sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography >
                    {customer_name || 'Not Applicable'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Customer Order ID */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Customer Order ID" arrow>
                      <ConfirmationNumber sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography >
                      { customer_order_id ? customer_order_id : "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Customer Email */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Customer Email" arrow>
                      <Email sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography >
                    {mail || 'Not Applicable'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Customer Phone */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Customer Phone" arrow>
                      <Phone sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography >
                      {contact_number || "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

                  <Grid item xs={12} md={4}>
                      <Card sx={{ height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Fulfillment Details
                          </Typography>
                          <Grid container spacing={1} justifyContent="space-between" sx={{ marginLeft: '2px', paddingTop: '6px' }}>
                            <Typography>Fulfillment Type</Typography>
                            <Typography sx={{ color: "#000080", paddingRight: '10px' }}>
                            {fulfillment_type || 'Not Applicable'}
                            </Typography>
                          </Grid>
                          <Grid container spacing={1} justifyContent="space-between" sx={{ marginLeft: '2px', paddingTop: '6px' }}>
                            <Typography>Shipping Method</Typography>
                            <Typography sx={{ color: "#000080", paddingRight: '10px' }}>
                            {shipment_type || 'Not Applicable'}
                            </Typography>
                          </Grid>
            
                            <Grid container spacing={1} justifyContent="space-between" sx={{ marginLeft: '2px', paddingTop: '6px' }}>
                              <Typography>Ship Date</Typography>
                              <Typography sx={{ color: "#000080", paddingRight: '10px' }}>
                                {new Date( expected_delivery_date).toLocaleString() || "Not Applicable"}
                              </Typography>
                            </Grid>
                            <Grid container spacing={1} justifyContent="space-between" sx={{ marginLeft: '2px', paddingTop: '6px' }}>
  <Typography>Shipping Cost</Typography>
  <Typography sx={{ color: "#000080", paddingRight: '10px' }}>
    {shipment_cost ? `$${shipment_cost}` : 'Not Applicable'}
  </Typography>
</Grid>

                          
                   
                          {/* Add more fulfillment details as needed based on your API response */}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Customer Information */}



                {/* Shipping Address */}
                <Grid item xs={12} md={12}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Shipping Address
                            </Typography>
                            <Typography variant="body2">
                                {shipping_address || "Not Applicable"}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

                <Card style={{ margin: "20px", padding: "10px" }}>
    <CardContent>
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>Image</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>SKU</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>Quantity</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>Unit Price</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {order.ordered_products?.length > 0 ? (
                        order.ordered_products.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">
                                    <img src={product.product_image}  style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                </TableCell>
                                <TableCell align="center" style={{ minWidth: 300, 
                width: 300, }}>{product.product_title || "N/A"}</TableCell>
                                <TableCell align="center">{product.sku || "N/A"}</TableCell>
                                <TableCell align="center">{product.quantity || 0}</TableCell>
                                <TableCell align="center">
                                    {product.price ? `$${product.price.toFixed(2)}` : "N/A"}
                                </TableCell>
                                <TableCell align="center">
                                    {(product.price * product.quantity).toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center">No Order Items Available</TableCell>
                        </TableRow>
                    )}

                    {/* Subtotal, Discount, Tax, Shipping, Total */}
                    {/* <TableRow>
                        <TableCell colSpan={5} align="right"><strong>Product Total:</strong></TableCell>
                        <TableCell align="center">{`$${subtotal.toFixed(2)}`}</TableCell>
                    </TableRow> */}
                 <TableRow>
    <TableCell colSpan={5} align="right"><strong>Discount:</strong></TableCell>
    <TableCell align="right">{`${order.discount_amount.toFixed(2)}`}({order.discount}%)</TableCell>
</TableRow>

<TableRow>
    <TableCell colSpan={5} align="right"><strong> Tax:</strong></TableCell>
    <TableCell align="right">{`${order.tax_amount.toFixed(2)}`}({order.tax}%)</TableCell>
</TableRow>
                    <TableRow>
                        <TableCell colSpan={5} align="right"><strong>Shipping Cost:</strong></TableCell>
                        <TableCell align="center">{`$${shippingCost.toFixed(2)}`}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}><strong>Total Value of Order:</strong></TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>{`$${order.total_price.toFixed(2)}`}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </CardContent>
</Card>

            <Modal open={open} onClose={handleClose}>
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 900,
                        height: '100vh',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 3,
                    }}
                >
                    {/* Passing order to MannualOrder */}
                    <MannualOrder handleClose={handleClose} order={order} detailId={id} />
                    </Box>
            </Slide>
        </Modal>


        </div>
        </Box>
    );
}

export default CustomOrderList;
