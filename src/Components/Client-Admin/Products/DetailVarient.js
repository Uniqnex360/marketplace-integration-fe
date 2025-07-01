import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Table, TableHead, TableContainer, TableBody, TableCell, Typography, Tooltip, TableRow, IconButton, Avatar } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import soon from "../../assets/soon.png"; // Fallback image
import CustomizeTooltip from '../CustomTooltip/CustomTooltip';

function DetailVarient() {
  const { id } = useParams(); // Extract product ID from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltipText, setTooltipText] = useState('Copy ASIN');
  let lastParamsRef = useRef(""); // Ref to store last API call parameters to prevent unnecessary fetches

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
            is_duplicate: 'true',
            product_id: id,
            user_id: userId,
          },
        }
      );

      if (response.data && response.data.status && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (response.data && response.data.status && response.data.product_list) {
        const formattedProducts = response.data.product_list.map((product) => ({
          id: product.id,
          product_title: product.product_title || "N/A",
          brand_name: product.brand_name || "N/A",
          currency: product.currency || "N/A",
          image_url: product.image_url || soon,
          grossRevenue: product.gross_revenue || 0,
          netProfit: product.net_profit || 0,
          unitsSold: product.units_sold || 0,
          product_id: product.product_id || "N/A",
          sku: product.sku || "N/A",
          images: product.image_url || soon,
          marketplace_image_url: product.marketplace_image_url || [], // Ensure it's an array, default to empty
          price: product.price || 0,
        }));
        setProducts(formattedProducts);
      } else {
        console.error("Invalid product data:", response.data);
        setError("Failed to load product details.");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setError("Failed to load product details.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentParams = JSON.stringify({}); // If no params change, this will stay the same

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchProducts();
    }
  }, [id]); // Add 'id' to the dependency array to refetch when product ID changes

  const handleCopyAsin = (asin) => {
    navigator.clipboard.writeText(asin);
    setTooltipText('ASIN Copied!');
    setTimeout(() => {
      setTooltipText('Copy ASIN');
    }, 1500);
  };

  if (loading) {
    return <Typography>Loading product details...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <TableContainer sx={{ borderRadius: '6px', border: 'solid 1px #ddd' }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
          <TableRow>
            <TableCell sx={{
              fontSize: '12px', color: '#485E75', fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
            }}>
              Product
            </TableCell>
            <TableCell sx={{
              fontSize: '12px', color: '#485E75', fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
            }}>
              Marketplace
            </TableCell>
            <TableCell sx={{
              fontSize: '12px', color: '#485E75', fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
            }}>
              Price
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length > 0 ? (
            products.map((item, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ width: '550px' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={item.image_url || soon} variant="square" sx={{ width: 40, height: 40 }} />
                    <Box>
                      <CustomizeTooltip title={item.product_title}>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: "#0A6FE8",
                            fontWeight: 500,
                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
                          }}
                        >
                          {item.product_title}
                        </Typography>
                      </CustomizeTooltip>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <img
                          src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                          alt="Country Flag"
                          width={27}
                          height={16}
                          style={{ marginRight: 6 }}
                        />

                        <Typography variant="caption" color="textSecondary" sx={{
                          mr: 1, fontSize: '14px',
                          color: '#485E75',
                          fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif'"
                        }}>
                          {item?.product_id}
                        </Typography>

                        <Tooltip title={tooltipText}>
                          <IconButton onClick={() => handleCopyAsin(item?.product_id)} size="small" sx={{ mr: 0.5 }}>
                            <ContentCopyIcon sx={{ fontSize: 'inherit', color: '#757575' }} />
                          </IconButton>
                        </Tooltip>

                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: '#485E75',
                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif'",
                            position: 'relative',
                            pl: 1.5,
                            '&::before': {
                              content: '"•"',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              color: '#485E75',
                              fontSize: '14px',
                              lineHeight: '1.5',
                            },
                          }}
                        >
                          {`• ${item.sku}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{
                  fontSize: '14px',
                  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  color: '#485E75'
                }}>
           <Box display="flex" flexWrap="wrap" gap={1}>
  {item.marketplace_image_url && item.marketplace_image_url.length > 0 ? (
    item.marketplace_image_url.map((imageUrl, imgIndex) => (
      <Box
        key={imgIndex}
        sx={{
          width: "30px",
          height: "30px",
          // border: "1px solid #ddd",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <img
          src={imageUrl}
          alt={`${item.product_title} - Marketplace Image ${imgIndex + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    ))
  ) : (
    <Typography variant="caption" color="textSecondary">No marketplace images</Typography>
  )}
</Box>

                </TableCell>
                <TableCell sx={{
                  fontSize: '14px',
                  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  color: '#485E75'
                }}>
                  ${item.price?.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ fontSize: '14px', color: '#485E75' }}>
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DetailVarient;