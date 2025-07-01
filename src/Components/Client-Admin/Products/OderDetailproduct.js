import React, { useState, useEffect } from 'react';  
import axios from 'axios';
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Tooltip } from '@mui/material';
import { useParams } from "react-router-dom";

function OrderDetailProduct() {
  const [ordersData, setOrdersData] = useState([]);  
  const [loading, setLoading] = useState(false);  
  const { id } = useParams(); 
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true); 
        const response = await axios.get(`${process.env.REACT_APP_IP}getOrdersBasedOnProduct`, {
          params: { product_id: id , user_id: userIds}
        });

        if (response.data && response.data.orders) {
          setOrdersData(response.data.orders); 
        } else {
          setOrdersData([]); 
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

  return (
    <Paper sx={{ padding: 2, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1300 }}> 
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Order Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ordered Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Channel</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ships From</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Item Purchased</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Shipping Method</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">Loading...</TableCell>
              </TableRow>
            ) : (
              ordersData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.skuId}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.orderStatus}
                      color={
                        order.orderStatus === 'Shipped'
                          ? 'success'
                          : order.orderStatus === 'Pending'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>{order.orderedDate}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>{order.shipsFrom}</TableCell>
                  <TableCell>
                    <Tooltip title={order.itemPurchases}>
                      <span>{order.itemPurchases}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{order.shippingMethod}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default OrderDetailProduct;
