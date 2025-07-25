import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Paper,
    IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { ArrowUpward, ArrowDownward, MoreVert, Download, Delete } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { saveAs } from 'file-saver';

import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Import Copy Icon
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CustomizeTooltip from '../CustomTooltip/CustomTooltip';
const SalesDecreasing = ({ userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate }) => {
    const [products, setProducts] = useState([]);
    const [tooltipText, setTooltipText] = useState('Copy ASIN');
    const [copied, setCopied] = useState(false);
    const today = new Date();
    let lastParamsRef = useRef("");

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

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleDownloadCSV = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}downloadProductPerformanceCSV/`, {
                user_id: userId,
                action: "least",
                marketplace_id: marketPlaceId.id,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                fulfillment_channel: fulfillment_channel,
                start_date: DateStartDate,
                end_date: DateEndDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
                {
                    responseType: 'blob',
                });
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'decreasing_sales_products.csv');
        } catch (error) {
            console.error('CSV Download Error:', error);
        }
    };

    const handleDownloadXLS = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}downloadProductPerformanceSummary/`, {
                user_id: userId,
                action: "least",
                marketplace_id: marketPlaceId.id,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                fulfillment_channel: fulfillment_channel,
                start_date: DateStartDate,
                end_date: DateEndDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
                {
                    responseType: 'blob',
                });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'decreasing_sales_products.xlsx');
        } catch (error) {
            console.error('XLS Download Error:', error);
        }
    };


    // Fetch function to get product data from API
    const fetchSalesDecreasing = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_IP}getProductPerformanceSummary/`,
                {
                    action: "least",
                    user_id: userId, // Include userId if needed
                    marketplace_id: marketPlaceId.id,
                    brand_id: brand_id,
                    product_id: product_id,
                    manufacturer_name: manufacturer_name,
                    fulfillment_channel: fulfillment_channel,
                    start_date: DateStartDate,
                    end_date: DateEndDate,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Get the user's timezone
                }
            );
            console.log('res', response.data.least_3_products);
            // Use 'top_3_products' instead of 'least_3_products' based on your request
            setProducts(response.data.least_3_products || []); // Safe check if least_3_products exists
        } catch (error) {
            console.error('Failed to fetch sales decreasing data:', error);
        }
    };

    useEffect(() => {

        const currentParams = JSON.stringify({

            userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate

        });

        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
            fetchSalesDecreasing();
        }

    }, [userId, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate]);



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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', mb: 2 }}>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#1E293B',
                            fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                            mb: 0.5,
                        }}
                    >
                        Sales Trends: Decreasing
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '14px',
                            color: '#485E75',
                            fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
                                fontSize: '16px', color: '#485E75', fontFamily:
                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
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
                                fontSize: '16px', color: '#485E75', fontFamily:
                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
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
                                fontSize: '16px', color: '#485E75', fontFamily:
                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: 600
                            }} primary="Remove" />
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
            <TableContainer component={Paper} sx={{ backgroundColor: '#F9FAFB' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontSize: '12px',
                                    color: '#485E75',
                                    fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: 600,
                                }}
                            >
                                Product
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontSize: '12px',
                                    color: '#485E75',
                                    fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: 600,
                                }}
                            >
                                Gross Revenue
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontSize: '12px',
                                    color: '#485E75',
                                    fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: 600,
                                }}
                            >
                                Net Profit
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontSize: '12px',
                                    color: '#485E75',
                                    fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: 600,
                                }}
                            >
                                Units Sold
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length > 0 ? (
                            products.map((item, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #E0E0E0',
                                            padding: '12px 16px',
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" sx={{ width: '600px' }} gap={2}>
                                            <Avatar src={item.images || ''} variant="square" sx={{ width: 40, height: 40 }} />
                                            <Box>
                                                <a
                                                    href={`/Home/sales-detail/${item.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "none", width: '40px', height: '40px' }}
                                                >   <CustomizeTooltip title={item.product_name}>  <Typography
                                                    sx={{
                                                        fontSize: '14px',
                                                        color: '#0A6FE8',
                                                        fontWeight: 500,
                                                        fontFamily:
                                                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                    }}
                                                >
                                                    {item.product_name}
                                                </Typography></CustomizeTooltip>
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
                                                            paddingRight: '7px',
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
                                                        mr: 1, fontSize: '14px',
                                                        color: '#485E75',
                                                        fontFamily:
                                                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif'",
                                                    }}>
                                                        {item?.asin}
                                                    </Typography>

                                                    <Tooltip
                                                        title={tooltipText}
                                                        onOpen={() => handleTooltipOpen(item.asin)}
                                                        arrow
                                                    >
                                                        <IconButton onClick={() => handleCopy(item.asin)} size="small" sx={{ mr: 0.5, }}>
                                                            <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '14px',
                                                            color: '#485E75',
                                                            fontFamily:
                                                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif'",
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
                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #E0E0E0',
                                            fontSize: '14px',
                                            fontFamily:
                                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            color: '#485E75',
                                        }}
                                    >
                                        {formatCurrency(item.grossRevenue)}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #E0E0E0',
                                            fontSize: '14px',
                                            fontFamily:
                                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            color: '#485E75',
                                        }}
                                    >
                                        {formatCurrency(item.netProfit)}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #E0E0E0',
                                            padding: '12px 16px',
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography
                                                sx={{
                                                    fontSize: '14px',
                                                    fontFamily:
                                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                    color: '#485E75',
                                                }}
                                            >
                                                {item.unitsSold?.toLocaleString("en-US")}

                                            </Typography>

                                            <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />

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

export default SalesDecreasing;