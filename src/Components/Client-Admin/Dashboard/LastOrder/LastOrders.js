import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Avatar,
    Paper,
    IconButton,
    Tooltip as MuiTooltip,
    Skeleton,
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/en-in";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CustomizeTooltip from "../../CustomTooltip/CustomTooltip";
import LatestOrdersSkeleton from "./LastOrderLoading";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.locale("en-in");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);



const CustomTooltip = React.memo(({ active, payload }) => {
    if (active && payload && payload.length && payload[0].value > 0) {
        const hour = parseInt(payload[0].payload.hour);
        const date = dayjs().hour(hour).minute(0);
        const startTime = date.format("h A");
        const endTime = date.add(1, "hour").format("h A");
        const orders = payload[0].value;
        const units = payload[0].payload.units || 0;

        return (
            <Paper
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    boxShadow: 'none',
                    minWidth: 180,
                    border: '1px solid rgb(161, 173, 184)',
                }}
            >
                <Typography variant="body2" sx={{
                    color: '#485E75',
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                }} align="left">
                    {startTime} - {endTime} {date.format('MMM D,')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }} align="left">
                    <Box component="span" fontWeight="bold">
                        {orders} {orders === 1 ? 'Order' : 'Orders'}
                    </Box>{' '}
                    <Box component="span" color="black">
                        ({units} {units === 1 ? 'unit' : 'units'})
                    </Box>
                </Typography>
            </Paper>
        );
    }
    return null;
});

const OrderCard = React.memo(({ order }) => {
    const [tooltipText, setTooltipText] = useState('');
    const [loading, setLoading] = useState(false);
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleTooltipOpen = useCallback((value) => {
        const isNumberOnly = /^\d+$/.test(value);
        const label = isNumberOnly ? 'WPID' : 'ASIN';
        setTooltipText(`Copy ${label}`);
    }, []);

    const handleCopy = useCallback(async (value) => {
        if (!value) return;

        const isNumberOnly = /^\d+$/.test(value);
        const label = isNumberOnly ? 'WPID' : 'ASIN';

        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
        setTimeout(() => {
            setTooltipText(`Copy ${label}`);
        }, 1500);
    }, []);

    return (
        <Card
            sx={{
                mb: 1,
                borderRadius: 1,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                fontFamily: `"Segoe UI", Roboto, sans-serif`,
            }}
        >
            <CardContent
                sx={{
                    padding: "8px 12px",
                    "&:last-child": { paddingBottom: "8px" },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                    }}
                >
                    <Typography variant="caption" sx={{ fontSize: "11.5px", color: "#555" }}>
{/* {dayjs(order.purchaseDate+ 'Z').utc().tz(dayjs.tz.guess()).format("h:mm A")} */}


{order.purchaseDate ? (
  new Date(`${order.purchaseDate.replace(' ', 'T')}Z`).toLocaleString(('en-GB'), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: systemTimeZone,
  })
) : 'N/A'}
  {/* {order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString('en-GB') : 'N/A'} */}

                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ fontSize: "12px", fontWeight: 500 }}
                    >
                        Price: <Box component="span" sx={{ color: 'grey' }}>${order.price}</Box>{' '}
                        Quantity: <Box component="span" sx={{ color: 'grey' }}>{order.quantityOrdered}</Box>
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Avatar
                        variant="rounded"
                        src={order.imageUrl}
                        sx={{ width: 30, height: 30, mt: 0.5 }}
                    />

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <CustomizeTooltip title={order?.title}>
                            <a
                                href={`/Home/product-detail/${order.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none" }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    sx={{
                                        fontSize: "14px",
                                        lineHeight: 1.4,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 1,
                                        whiteSpace: "normal",
                                        color: "#0A6FE8",
                                        fontFamily:
                                            'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                                        cursor: "pointer",
                                    }}
                                >
                                    {order.title}
                                </Typography>
                            </a>
                      </CustomizeTooltip>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 0.5,
                            }}
                        >
                            <Box>
                                <img src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                                    alt="Country Flag"
                                    width={27}
                                    height={16}
                                    style={{ marginRight: 6 }}
                                /> <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '14px',
                                        color: '#485E75',
                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                        lineHeight: 1.3
                                    }}
                                >
                                    {order.asin}
                                </Typography>
                                <MuiTooltip
                                    title={tooltipText}
                                    onOpen={() => handleTooltipOpen(order.asin)}
                                    arrow
                                >
                                    <IconButton onClick={() => handleCopy(order.asin)} size="small" sx={{ mr: 0.5, }}>
                                        <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
                                    </IconButton>
                                </MuiTooltip>
                                <MuiTooltip title={`SKU: ${order.sellerSku}`} placement="top" arrow>
                                    <IconButton
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    >
                                        • <InfoOutlinedIcon fontSize="inherit" sx={{ paddingLeft: '3px', height: '16px', width: '16px' }} />
                                    </IconButton>
                                </MuiTooltip>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});



const LastOrders = React.memo(({ marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel }) => {
    const [latestOrders, setLatestOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastParamsRef = useRef("");

    const fetchLatestOrders = useCallback(async () => {
        try {
            setLoading(true);
            const userData = localStorage.getItem("user");
            const userId = userData ? JSON.parse(userData).id : "";
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const response = await axios.post(
                `${process.env.REACT_APP_IP}LatestOrdersTodayAPIView/`,
                {
                    user_id: userId,
                    timezone: userTimezone,
                    marketplace_id: marketPlaceId?.id,
                    brand_id: brand_id || '',
                    product_id: product_id || '',
                    manufacturer_name: manufacturer_name || '',
                    fulfillment_channel: fulfillment_channel || '',
                }
            );

            if (response.data.status) {
                const orders = response.data.data.orders || [];
                const hourlyRaw = response.data.data.hourly_order_count || [];

                const hourlyMap = {};
                hourlyRaw.forEach((entry) => {
                    const hour = new Date(entry.hour).getHours();
                    hourlyMap[hour] = {
                        order_count: entry.ordersCount || 0,
                        total_units: entry.unitsCount || 0,
                    };
                });

                const allHours = Array.from({ length: 24 }, (_, i) => i);
                const formattedChartData = allHours.map((hour) => {
                    const displayHour = dayjs().hour(hour).minute(0);
                    return {
                        time: displayHour.format("h A"),
                        orders: hourlyMap[hour]?.order_count || 0,
                        units: hourlyMap[hour]?.total_units || 0,
                        hour: hour,
                    };
                });

                setLatestOrders(orders);
                setChartData(formattedChartData);
            } else {
                console.error("Error fetching orders:", response.data.message);
                setLatestOrders([]);
                setChartData([]);
            }
        } catch (error) {
            console.error("Error fetching latest orders:", error);
            setLatestOrders([]);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    }, [marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel]);

    useEffect(() => {
        const currentParams = JSON.stringify({marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel
  });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
     fetchLatestOrders();
    }
     
    }, [marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel]);

    return (
        <Grid container spacing={3} sx={{ p: 2 }}>
            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                        width: '100%',
                    }}
                >
                    <LatestOrdersSkeleton />
                </Box>
            ) : (
                <>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" sx={{ fontSize: "20px" }} mb={2}>
                            {chartData.length > 0 ? "Latest Orders" : null}
                        </Typography>

                        <Typography variant="h6" sx={{ fontSize: "14px" }} mb={2}>
                            Showing all orders from the last 24 hours
                        </Typography>
                        <Paper elevation={2} sx={{ borderRadius: 2, boxShadow: "none" }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={chartData} barCategoryGap="20%">
                                        <CartesianGrid vertical={false} horizontal={true} stroke="#e0e0e0" />

                                        <XAxis
                                            dataKey="time"
                                            tick={{ fontSize: "12px" }}
                                            tickLine={false}
                                            interval={0}
                                            tickFormatter={(value, index) => {
                                                const hour = chartData[index]?.hour;
                                                return hour % 4 === 1 ? value : "";
                                            }}
                                        />

                                        <YAxis
                                            tick={{ fontSize: "12px" }}
                                            allowDecimals={false}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="orders" fill="#8A2BE2" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                    No order data available for the last 24 hours.
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Product Cards - Right Side */}
                    <Grid item xs={12} md={4} >
                        <Typography sx={{ mb: 1, fontSize: '16px', color: 'grey', fontWeight: 600 }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </Typography>
                        <Paper
                            elevation={2}
                            sx={{
                                boxShadow: "none",
                                maxHeight: "400px",
                                overflowY: "auto",
                                borderRadius: 2,
                                "&::-webkit-scrollbar": {
                                    height: "2px",
                                    width: "2px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "#888",
                                    borderRadius: "10px",
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: "#555",
                                },
                                "&::-webkit-scrollbar-track": {
                                    backgroundColor: "#f1f1f1",
                                    borderRadius: "10px",
                                },
                            }}
                        >
                            {latestOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                />
                            ))}
                        </Paper>
                    </Grid>
                </>
            )}
        </Grid>
    );
});

export default LastOrders;