import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  MoreVert,
  Download,
  Delete
} from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { saveAs } from 'file-saver';
import CustomizeTooltip from '../CustomTooltip/CustomTooltip';

const SalesIncreasing = ({
  userId,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate
}) => {
  const [products, setProducts] = useState([]);
  const [tooltipText, setTooltipText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const lastParamsRef = useRef("");

  // Get dates for display
  const today = new Date();
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(today.getDate() - 1);

  const dayBeforeYesterdayDate = new Date(today);
  dayBeforeYesterdayDate.setDate(today.getDate() - 2);

  const formatDate = (date) => {
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const yesterday = formatDate(yesterdayDate);
  const dayBeforeYesterday = formatDate(dayBeforeYesterdayDate);

  // Menu handlers
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Download handlers
  const handleDownloadCSV = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadProductPerformanceCSV/`,
        {
          action: "top",
          user_id: userId,
          marketplace_id: marketPlaceId.id,
          brand_id,
          product_id,
          manufacturer_name,
          fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'increasing_sales_products.csv');
    } catch (error) {
      console.error('CSV Download Error:', error);
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadProductPerformanceSummary/`,
        {
          action: "top",
          user_id: userId,
          marketplace_id: marketPlaceId.id,
          brand_id,
          product_id,
          manufacturer_name,
          fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'increasing_sales_products.xlsx');
    } catch (error) {
      console.error('XLS Download Error:', error);
    }
  };

  // Fetch product data
  const fetchSalesIncreasing = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductPerformanceSummary/`,
        {
          user_id: userId,
          target_date: dayjs().format('DD/MM/YYYY'),
          marketplace_id: marketPlaceId.id,
          brand_id,
          product_id,
          manufacturer_name,
          fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
      setProducts(response.data.top_3_products || []);
    } catch (error) {
      console.error('Failed to fetch sales increasing data:', error);
    }
  };

  // Effect to fetch data when parameters change
  useEffect(() => {
    const currentParams = JSON.stringify({
      userId,
      marketPlaceId,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate
    });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchSalesIncreasing();
    }
    // eslint-disable-next-line
  }, [userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate]);

  // Copy ASIN handler
  const handleTooltipOpen = (value) => {
    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? 'WPID' : 'ASIN';
    setTooltipText(`Copy ${label}`);
  };

  const handleCopy = async (value) => {
    if (!value) return;
    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? 'WPID' : 'ASIN';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setTooltipText(`${label} Copied!`);
    } catch (err) {
      console.error('Copy failed', err);
      setTooltipText('Copy Failed');
    }

    setTimeout(() => {
      setTooltipText(`Copy ${label}`);
    }, 1500);
  };

  return (
    <Box sx={{ borderRadius: 3, border: '1px solid #E0E0E0' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '10px', mb: 2 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1E293B',
              fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              mb: 0.5,
            }}
          >
            Sales Trends: Increasing
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              color: '#485E75',
              fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            }}
          >
            {`${dayBeforeYesterday} - ${yesterday}`}
          </Typography>
        </Box>
        <Box>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? 'long-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            size="small"
          >
            <MoreVert />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                width: 200,
                borderRadius: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleDownloadCSV();
                handleClose();
              }}
              sx={{
                color: '#485E75',
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <ListItemIcon sx={{ color: '#485E75', minWidth: 36 }}>
                <InsertDriveFileIcon sx={{ color: 'rgb(72, 94, 117)', fontSize: '16px' }} />
              </ListItemIcon>
              <ListItemText sx={{
                fontSize: '16px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }} primary="Download CSV" />
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDownloadXLS();
                handleClose();
              }}
              sx={{
                color: '#485E75',
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <ListItemIcon sx={{ color: '#485E75', minWidth: 36 }}>
                <Download sx={{ color: 'rgb(72, 94, 117)', fontSize: '16px' }} />
              </ListItemIcon>
              <ListItemText sx={{
                fontSize: '16px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }} primary="Download XLS" />
            </MenuItem>
            <MenuItem
              onClick={handleClose}
              sx={{
                color: '#485E75',
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 14,
              }}
            >
              <ListItemIcon sx={{ color: '#485E75', minWidth: 36 }}>
                <Delete sx={{ color: 'rgb(72, 94, 117)', fontSize: '16px' }} />
              </ListItemIcon>
              <ListItemText sx={{
                fontSize: '16px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }} primary="Remove" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{
                fontSize: '12px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }}>
                Product
              </TableCell>
              <TableCell sx={{
                fontSize: '12px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }}>
                Gross Revenue
              </TableCell>
              <TableCell sx={{
                fontSize: '12px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }}>
                Net Profit
              </TableCell>
              <TableCell sx={{
                fontSize: '12px',
                color: '#485E75',
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontWeight: 600
              }}>
                Units Sold
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length > 0 ? (
              products.map((item, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box display="flex" alignItems="center" sx={{ width: '600px' }} gap={2}>
                      <Avatar src={item.images || ''} variant="square" sx={{ width: 40, height: 40 }} />
                      <Box>
                        <a
                          href={`/Home/sales-detail/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", width: '40px', height: '40px' }}
                        >
                          <CustomizeTooltip title={item.product_name}>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                color: "#0A6FE8",
                                fontWeight: 500,
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
                              }}
                            >
                              {item.product_name}
                            </Typography>
                          </CustomizeTooltip>
                        </a>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <img
                            src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                            alt="Country Flag"
                            width={27}
                            height={16}
                            style={{ marginRight: 6 }}
                          />
                          <Typography
                            sx={{
                              pr: '7px',
                              fontSize: '14px',
                              color: '#121212',
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
                            {`• ${item.fulfillmentChannel}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{
                            mr: 1,
                            fontSize: '14px',
                            color: '#485E75',
                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif'",
                          }}>
                            {item?.asin}
                          </Typography>
                          <Tooltip
                            title={tooltipText}
                            onOpen={() => handleTooltipOpen(item.asin)}
                            arrow
                          >
                            <IconButton onClick={() => handleCopy(item.asin)} size="small" sx={{ mr: 0.5 }}>
                              <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
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
                    {item.grossRevenue < 0
                      ? `-$${Math.abs(item.grossRevenue).toFixed(2)}`
                      : `$${item.grossRevenue.toFixed(2)}`}
                  </TableCell>
                  <TableCell sx={{
                    fontSize: '14px',
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    color: '#485E75'
                  }}>
                    {item.netProfit < 0
                      ? `-$${Math.abs(item.netProfit).toFixed(2)}`
                      : `$${item.netProfit.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography sx={{
                        fontSize: '14px',
                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        color: '#485E75'
                      }}>
                        {item.unitsSold}
                      </Typography>
                      <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ fontSize: '14px', color: '#485E75' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalesIncreasing;