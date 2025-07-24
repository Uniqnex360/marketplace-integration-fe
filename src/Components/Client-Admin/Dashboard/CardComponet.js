import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, Grid, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import CustomBarChart from "./CustomBarChart";
import DottedCircleLoading from "../../Loading/DotLoading";
import { format } from 'date-fns';
import DonutChart from "./DonutChart";

const CardComponent = ({widgetData, marketPlaceId, DateStartDate, DateEndDate, brand_id, product_id,manufacturer_name }) => {
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState({});
    const [market, setMarket] = useState("");
    const [shipping, setShipping] = useState({});
    const [fulfillment, setFulfillment] = useState({});
    const [categories, setCategories] = useState([]);
    const [orderData, setOrderData] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [filter, setFilter] = useState('all');
    const [salesData, setSalesData] = useState([]);
    const [chartOffset, setChartOffset] = useState(0);
    const chartContainerRef = useRef(null);
    const lastFetchParamsRef = useRef(null);

    const userData = localStorage.getItem("user");
    let userIds = "";

    if (userData) {
      const data = JSON.parse(userData);
      userIds = data.id;
    }
    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleScroll = (direction) => {
        if (chartContainerRef.current) {
            const containerWidth = chartContainerRef.current.offsetWidth;
            const scrollAmount = containerWidth * 0.8; // Scroll 80% of the container width

            if (direction === 'left') {
                chartContainerRef.current.scrollLeft -= scrollAmount;
                setChartOffset(prevOffset => Math.max(0, prevOffset - scrollAmount));
            } else {
                chartContainerRef.current.scrollLeft += scrollAmount;
                setChartOffset(prevOffset => prevOffset + scrollAmount);
            }
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch marketplace categories
            const marketplaceResponse = await axios.get(
                `${process.env.REACT_APP_IP}getMarketplaceList/`, 
                { params: { user_id: userIds } }
              );
              const categoryData = marketplaceResponse.data.data.map((item) => ({
                id: item.id,
                name: item.name,
                imageUrl: item.image_url,
                
            }));
            setCategories(categoryData);

            // Fetch sales analytics
            const orderResponse = await axios.post(`${process.env.REACT_APP_IP}salesAnalytics/`, {
                  preset:widgetData,
                marketplace_id: marketPlaceId.id,
                date_range: filter,
                start_date:DateStartDate,
                end_date :DateEndDate,
                user_id: userIds,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            if (orderResponse.data?.data) {
                setOrder(orderResponse.data.data);

                // Map the data to format it for the chart
                const formattedData = orderResponse.data.data.order_days.map(item => ({
                    date: new Date(item.date), // Convert date string to Date object
                    revenue: item.order_value,
                    orderCount: item.order_count,  // Add order count
                }));

                setSalesData(formattedData);
            }



    const orderSam = await axios.get(`${process.env.REACT_APP_IP}ordersCountForDashboard/`, {
        params: {
            preset:widgetData,
            marketplace_id: marketPlaceId.id,
            start_date: DateStartDate,
            end_date: DateEndDate,
            user_id: userIds,
            brand_id: brand_id,
            product_id: product_id,
            manufacturer_name: manufacturer_name,
            timezone: "US/Pacific",
        },
    });

    if (orderSam.data?.data) {
        const { total_order_count, ...marketplaces } = orderSam.data.data;
        setTotalOrders(total_order_count?.value || 0);

        if (marketPlaceId.id === "all") {
            const pieData = Object.entries(marketplaces).map(([name, data]) => {
                let color;
                if (name === "Amazon") color = "#0b3954";
                else if (name === "Walmart") color = "#ff6663";
                else if (name === "custom") color = "#9381ff";
                else color = getRandomColor();

                return {
                    name,
                    value: data?.count || 0,
                    percentage: parseFloat(data?.percentage || 0).toFixed(2),
                    color: color,
                    orderValue: data?.order_value || 0 // Bind orderValue here
                };
            });
            setOrderData(pieData);
        } else {
            const marketplaceName = Object.keys(marketplaces)[0];
            const marketplaceData = marketplaces[marketplaceName];

            if (marketplaceData) {
                console.log('000banu',marketplaceData)
                let color = "#000000"; // Default color
                if (marketplaceName === "Amazon") color = "#0b3954";
                else if (marketplaceName === "Walmart") color = "#ff6663";
                else if (marketplaceName === "custom") color = "#9381ff";

                setOrderData([{
                    name: marketplaceName,
                    value: marketplaceData.value || marketplaceData.count,
                    percentage: parseFloat(marketplaceData.percentage || 0).toFixed(2),
                    color: color,
                    orderValue: marketplaceData?.order_value || 0, // Bind orderValue here
                }]);
            } else {
                setOrderData([]);
            }
        }
    }
} catch (error) {
    console.error("Error fetching data:", error);
} finally {
    setLoading(false);
}
};

    useEffect(() => {
       const currentParams = JSON.stringify({
        preset:widgetData,
            marketplace_id: marketPlaceId?.id,
            start_date: DateStartDate,
            end_date: DateEndDate,
            filter,
            brand_id,
            product_id,
            manufacturer_name,
            user_id: userIds,
        });

        // Only fetch if params have changed
        if (lastFetchParamsRef.current !== currentParams) {
            lastFetchParamsRef.current = currentParams;
            fetchData();
        }
    }, [widgetData,marketPlaceId?.id, DateStartDate, DateEndDate, filter ,brand_id, product_id,manufacturer_name,JSON.stringify(product_id),
]);

    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h6"><DottedCircleLoading /></Typography>
            </Box>
        );
    }

    const formatDateTick = (tickItem) => {
        return format(tickItem, 'MMM dd'); // Format date as "Month Day" (e.g., "Jan 01")
    };

    return (
        <Box p={2}>
            <Grid container spacing={2}>
            <Grid item xs={12} sm={6} > 



<Card sx={{ mb: 2, maxWidth: 600, marginLeft: "-10px", minHeight: 330, display: "flex", flexDirection: "column", justifyContent: "center",    border: "1px solid #ccc", // ✅ Adds the border
    borderRadius: 2,          // Optional: rounded corners
    boxShadow: "none",  }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem', margin: 0 }}>
                        🛒 Total Orders
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ marginBottom: 0 }}>
                        {totalOrders}
                    </Typography>
                </Box>

                {totalOrders > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={orderData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={35}
                                outerRadius={60}
                                label={({ name }) => name}
                            >
                                {orderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const { payload } = props;
                                    let additionalInfo = "";

                                    if (payload) {
                                        // Find the corresponding marketplace data
                                        const marketplaceData = orderData.find(item => item.name === payload.name);
                                        if (marketplaceData) {
                                            const orderValue = marketplaceData.orderValue || 0;
                                            additionalInfo = `
                                                Order Count: ${marketplaceData.value} |
                                                Order Value: $${orderValue.toFixed(2)}
                                            `;
                                        }
                                    }

                                    return [
                                        additionalInfo, // Show additional info (Order Count & Value)
                                    ];
                                }}
                                contentStyle={{ fontSize: '14px' }}
                            />
                            <Legend
                                formatter={(value, entry) => (
                                    <span style={{ fontSize: "0.8rem", color: entry.color }}>
                                        {value} ({entry.payload.percentage}%)
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
                        <Typography variant="body2" sx={{ textAlign: "center", fontSize: "1rem", fontWeight: "bold", color: "#888" }}>
                            No total orders found
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>


        </Grid>



                {/* Custom Bar Chart */}
                {/* <Grid item xs={12} sm={6}>
                    <CustomBarChart marketPlaceId={marketPlaceId} />
                </Grid> */}

                
                        {/* <Grid item xs={12} sm={4}>
                       
                <DonutChart marketPlaceId={marketPlaceId}  DateStartDate={DateStartDate} DateEndDate={DateEndDate}/>
                 
                
                        </Grid> */}
            </Grid>
      

        </Box>
    );
};

export default CardComponent;

