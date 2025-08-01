import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Tooltip,
  Grid,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
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
  ArrowBack,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [market, setMarket] = useState(null);
  const [shipping, setShipping] = useState({});
  const [fulfillment, setFulfillment] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const userData = localStorage.getItem("user");

  const [currentIndex, setCurrentIndex] = useState(0);
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 1;

  const { searchQuery } = location.state || {};
  console.log("searchQuery-Details:", searchQuery);
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  // const handleBackClick = () => {
  //   navigate('/Home/orders');
  // };
  const detailsPage = queryParams.get("detail");
  const productId = queryParams.get("productId");
  console.log();

  const handleBackClick = () => {
    const currentPage = queryParams.get("page") || 1; // Ensure current page is retrieved
    const rowsPerPageURL = queryParams.get("rowsPerPage");
    if (detailsPage !== "detail-name") {
      navigate(
        `/Home/orders?page=${currentPage}&rowsPerPage=${rowsPerPageURL}`
      ); // Navigate back with current page in query params
    }
    if (detailsPage === "detail-name") {
      navigate(
        `/Home/products/details/${productId}?page=${currentPage}&rowsPerPage=${rowsPerPageURL}&name=orderTab`
      );
    }
  };

  // Fetch Order Details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_IP}fetchOrderDetails/`,
          {
            params: { order_id: id, user_id: userIds },
          }
        );

        console.log("Full Response:", response);
        console.log(
          "Response Data 1111:",
          response.data.data.order_items.ProductDetails
        );

        if (response.data?.data) {
          setMarket(response.data.data.marketplace_name);
          setOrder(response.data.data);
          setShipping(response.data.data.shipping_information);
          const orderFulfill = response.data.data.order_items;
          if (orderFulfill && orderFulfill.length > 0) {
            setFulfillment(orderFulfill[0].Fulfillment); // Assuming the fulfillment details are inside each item
          }
        } else {
          setOrder({});
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const formatDate = (timestamp) => {
    if (timestamp) {
      return new Date(timestamp).toLocaleDateString();
    }
    return "";
  };

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

        {/* Cards Section */}
        <Grid
          container
          spacing={3}
          style={{
            paddingLeft: "22px",
            paddingRight: "20px",
            marginTop: "10px",
          }}
        >
          {/* Order Details Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>

                {/* Marketplace */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Channel" arrow>
                      <Storefront sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography>
                      {order?.marketplace_name || "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Order Date */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Order Date" arrow>
                      <CalendarToday sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography>
                      {formatDate(order?.order_date) || "Not Applicable"}
                    </Typography>
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
                    <Typography>
                      {order?.order_status || "Not Applicable"}
                    </Typography>
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
                    <Typography>
                      {order?.order_total || "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Details Card */}
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
                    <Typography sx={{ color: "#000080" }}>
                      {order?.customer_name || "Not Applicable"}
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
                    <Typography sx={{ color: "#000080" }}>
                      {order?.customer_order_id || "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item>
                    <Tooltip title="Customer Email" arrow>
                      <Email sx={{ color: "#000080", fontSize: 20 }} />
                    </Tooltip>
                  </Grid>
                  <Grid item xs>
                    <Typography
                      sx={{
                        color: "#000080",
                        wordBreak: "break-all", // Ensures proper breaking
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "4px",
                        gap: 1, // Adds space between icon and text
                      }}
                    >
                      {order?.customer_email_id || "Not Applicable"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* <Grid container spacing={1} alignItems="center">
  <Grid item>
    <Tooltip title={order?.customer_email_id || "Not Applicable"} arrow>
      <Email sx={{ color: "#000080", fontSize: 20 }} />
    </Tooltip>
  </Grid>
  <Grid item xs>
    <Tooltip title={order?.customer_email_id || "Not Applicable"} arrow>
      <Typography
        sx={{
          color: "#000080",
          wordBreak: "break-word",
          display: 'inline-block',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',  // Prevents the email from breaking onto a new line
          overflow: 'hidden',     // Ensures text is hidden if it overflows the container
          textOverflow: 'ellipsis', // Adds ellipsis if the text is too long
        }}
      >
        {order?.customer_email_id || "Not Applicable"}
      </Typography>
    </Tooltip>
  </Grid>
</Grid> */}

                {/* Customer Phone */}
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Customer Phone" arrow>
                      <Phone sx={{ color: "#000080" }} />
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: "#000080" }}>
                      {shipping?.phone || "Not Applicable"}
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
                <Grid
                  container
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ marginLeft: "2px", paddingTop: "6px" }}
                >
                  <Typography>Fulfillment Status</Typography>
                  <Typography sx={{ color: "#000080", paddingRight: "10px" }}>
                    {fulfillment?.FulfillmentOption || "Not Applicable"}
                  </Typography>
                </Grid>
                <Grid
                  container
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ marginLeft: "2px", paddingTop: "6px" }}
                >
                  <Typography>Shipping Method</Typography>
                  <Typography sx={{ color: "#000080", paddingRight: "10px" }}>
                    {fulfillment?.ShipMethod || "Not Applicable"}
                  </Typography>
                </Grid>
                {fulfillment?.ShipDateTime && (
                  <Grid
                    container
                    spacing={1}
                    justifyContent="space-between"
                    sx={{ marginLeft: "2px", paddingTop: "6px" }}
                  >
                    <Typography>Ship Date</Typography>
                    <Typography sx={{ color: "#000080", paddingRight: "10px" }}>
                      {new Date(fulfillment?.ShipDateTime).toLocaleString() ||
                        "Not Applicable"}
                    </Typography>
                  </Grid>
                )}
                {fulfillment?.Carrier && (
                  <Grid
                    container
                    spacing={1}
                    justifyContent="space-between"
                    sx={{ marginLeft: "2px", paddingTop: "6px" }}
                  >
                    <Typography>Carrier</Typography>
                    <Typography sx={{ color: "#000080", paddingRight: "10px" }}>
                      {fulfillment?.Carrier || "Not Applicable"}
                    </Typography>
                  </Grid>
                )}
                <Grid
                  container
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ marginLeft: "2px", paddingTop: "6px" }}
                >
                  <Typography>Fulfillment Channel</Typography>
                  <Typography sx={{ color: "#000080", paddingRight: "10px" }}>
                    {order?.fulfillment_channel
                      ? order?.fulfillment_channel
                      : "Not Applicable"}
                  </Typography>
                </Grid>
                {/* Add more fulfillment details as needed based on your API response */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card style={{ margin: "20px", padding: "10px" }}>
          <CardContent>
            <Grid container spacing={2} justifyContent="space-between">
              {/* Shipping Address (Left Side) */}

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Shipping Address
                </Typography>

                <Typography variant="body2">
                  {order?.marketplace_name === "Walmart" ? (
                    <>
                      {shipping?.postalAddress?.name && (
                        <>
                          {shipping.postalAddress.name}
                          <br />
                        </>
                      )}
                      {shipping?.postalAddress?.address1 && (
                        <>
                          {shipping.postalAddress.address1}
                          <br />
                        </>
                      )}
                      {shipping?.postalAddress?.address2 && (
                        <>
                          {shipping.postalAddress.address2}
                          <br />
                        </>
                      )}
                      {shipping?.postalAddress?.city &&
                        shipping?.postalAddress?.state &&
                        shipping?.postalAddress?.postalCode && (
                          <>
                            {shipping.postalAddress.city},{" "}
                            {shipping.postalAddress.state}{" "}
                            {shipping.postalAddress.postalCode}
                            <br />
                          </>
                        )}
                      {shipping?.postalAddress?.country && (
                        <>
                          {shipping.postalAddress.country}
                          <br />
                        </>
                      )}
                      {shipping?.phone && <>{shipping.phone}</>}
                    </>
                  ) : order?.marketplace_name === "Amazon" ? (
                    <>
                      {order?.shipping_information?.City && (
                        <>
                          {order.shipping_information.City}
                          <br />
                        </>
                      )}
                      {order?.shipping_information?.StateOrRegion && (
                        <>
                          {order.shipping_information.StateOrRegion}
                          <br />
                        </>
                      )}
                      {order?.shipping_information?.PostalCode && (
                        <>
                          {order.shipping_information.PostalCode}
                          <br />
                        </>
                      )}
                      {order?.shipping_information?.CountryCode && (
                        <>
                          {order.shipping_information.CountryCode}
                          <br />
                        </>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No shipping details available.
                    </Typography>
                  )}
                </Typography>
              </Grid>
              {/* Has Regulated Items Section */}
              <Grid item xs={12} md={6}>
                <Grid
                  container
                  alignItems="center"
                  spacing={1}
                  justifyContent="flex-end"
                >
                  {" "}
                  {/* Added justifyContent */}
                  <Grid item>
                    <Typography variant="body2">Has Regulated Items</Typography>
                  </Grid>
                  <Grid item>
                    <Checkbox checked={order?.has_regulated_items} readOnly />
                  </Grid>
                </Grid>
              </Grid>

              {/* Fulfillment Details (Right Side) */}
              {/* <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Fulfillment Details
            </Typography>

            {fulfillment?.TrackingNumber && (
              <Grid container spacing={1} justifyContent="space-between" sx={{ paddingTop: '6px' }}>
                <Grid item>
                  <Typography variant="body2">Tracking Number</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: "#000080", textAlign: "right" }}>
                    {fulfillment.TrackingNumber || "Not Available"}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {fulfillment?.TrackingURL && (
              <Grid container spacing={1} justifyContent="space-between" sx={{ paddingTop: '6px' }}>
                <Grid item>
                  <Typography variant="body2">Tracking URL</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: "#000080", wordBreak: 'break-word', textAlign: "right" }}>
                    <a href={fulfillment.TrackingURL} target="_blank" rel="noopener noreferrer">
                      {fulfillment.TrackingURL}
                    </a>
                  </Typography>
                </Grid>
              </Grid>
            )}

            {fulfillment?.PickUpDateTime && (
              <Grid container spacing={1} justifyContent="space-between" sx={{ paddingTop: '6px' }}>
                <Grid item>
                  <Typography variant="body2">Pickup Date & Time</Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ color: "#000080", textAlign: "right" }}>
                    {new Date(fulfillment.PickUpDateTime).toLocaleString() || "Not Available"}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Grid> */}
            </Grid>
          </CardContent>
        </Card>

        {/* Product Details Table */}
        <Card style={{ margin: "20px", padding: "10px" }}>
          <CardContent>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Product</strong>
                    </TableCell>
                    <TableCell>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Quantity</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Unit Price</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Subtotal</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* Table Body for Order Items */}
                  {order?.order_items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.ProductDetails?.Title || "N/A"}
                      </TableCell>
                      <TableCell>{item.ProductDetails?.SKU || "N/A"}</TableCell>
                      <TableCell>
                        {item.ProductDetails?.QuantityOrdered || 0}
                      </TableCell>
                      <TableCell>
                        {item.Pricing?.ItemPrice?.Amount
                          ? item.Pricing.ItemPrice.CurrencyCode === "USD"
                            ? `$${item.Pricing.ItemPrice.Amount}`
                            : `${item.Pricing.ItemPrice.Amount} ${item.Pricing.ItemPrice.CurrencyCode}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {item?.Pricing?.ItemPrice?.Amount !== undefined &&
                        item?.Pricing?.ItemPrice?.Amount !== null
                          ? `$${Number(item.Pricing.ItemPrice.Amount).toFixed(
                              2
                            )}`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Subtotal, Shipping, and Total */}
                  {/* <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Subtotal:</strong>
                    </TableCell>
                    <TableCell>{order?.order_total || "N/A"}</TableCell>
                  </TableRow> */}
                   <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Tax:</strong>
                    </TableCell>
                    <TableCell>
                      {order?.order_items
                        ? `$${order.order_items
                            .reduce(
                              (total, item) =>
                                total + (item.Pricing?.ItemTax?.Amount || 0),
                              0
                            )
                            .toFixed(2)}`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Shipping:</strong>
                    </TableCell>
                    <TableCell>$0.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Shipping Tax:</strong>
                    </TableCell>
                    <TableCell>
                      {order?.shipping_price!==undefined && order?.shipping_price!==null ?
                     `$${Number(order.shipping_price).toFixed(2)}`:"N/A"}
                    </TableCell>
                  </TableRow>
                 
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell>
                      {order?.order_total !== undefined &&
                      order?.order_total !== null
                        ? `$${Number(order.order_total).toFixed(2)}`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </Box>
  );
};

export default OrderDetail;
