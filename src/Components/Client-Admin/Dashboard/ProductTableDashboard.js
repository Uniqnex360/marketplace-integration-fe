import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Box, Typography } from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import DottedCircleLoading from "../../Loading/DotLoading";

const ProductTableDashboard = ({ marketPlaceId, DateStartDate, DateEndDate }) => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${process.env.REACT_APP_IP}mostSellingProducts/`, {
          params: { 
            marketPlaceId: marketPlaceId.id,   
            start_date: DateStartDate || '',
            end_date: DateEndDate || '' ,
            user_id: userIds
          },
        });

        if (response.data?.data?.top_products?.length) {
          setProductData(response.data.data.top_products);
        } else {
          setProductData([]); // No products found
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setProductData([]);
      } finally {
        setLoading(false);
      }
    };

    if (marketPlaceId) {
      fetchData();
    }
  }, [marketPlaceId, DateStartDate, DateEndDate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <DottedCircleLoading />
      </Box>
    );
  }

  return (
    <Box sx={{ marginBottom: 2, marginRight: '15px', marginLeft:'5px'}}>
      
      {productData.length === 0 ? (
        <Typography sx={{ textAlign: "center", marginTop: 3, color: "gray" }}>
          No products found
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: "100%",
            maxHeight: "500px",
            margin: "auto",
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
            "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1", borderRadius: "10px" },
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f6f6f6" }}>
                <TableCell sx={{ textAlign: "start" }}>Image</TableCell>
                           <TableCell sx={{ textAlign: "center" }}>SKU</TableCell>
                           <TableCell sx={{ textAlign: "center" }}>Product Title</TableCell>
  
                <TableCell sx={{ textAlign: "center" }}>Channel Name</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Price</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Sales Count</TableCell>
                <TableCell sx={{ textAlign: "center" }}>Revenue</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {productData.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell sx={{ textAlign: "start" }}>
                    <Link to={`/Home/products/details/${product.product_id}`} style={{ textDecoration: "none", color: "black" }}>
                      <Avatar src={product.product_image} variant="rounded" sx={{ width: 40, height: 40 }} />
                    </Link>
                  </TableCell>
                 
                  <TableCell sx={{ textAlign: "center" }}>
                    <Link to={`/Home/products/details/${product.product_id}`} style={{ textDecoration: "none", color: "black" }}>
                      {product.sku}
                    </Link>
                  </TableCell>

                  <TableCell sx={{ textAlign: "center", minWidth: 380, width: 120, whiteSpace: "normal", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <Link to={`/Home/products/details/${product.product_id}`} style={{ textDecoration: "none", color: "black" }}>
                      {product.product_title}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {product.channel_name ? product.channel_name : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {product.price ? `$${product.price}` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{product.sales_count}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {product.revenue ? `$${product.revenue}` : '0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductTableDashboard;
