import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Card,
  Grid,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import CustomBarChart from "./CustomBarChart";
import DottedCircleLoading from "../../Loading/DotLoading";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { format } from "date-fns";
import DonutChart from "./DonutChart";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

const TotalOrdersGraph = ({
  widgetData,
  marketPlaceId,
  DateStartDate,
  DateEndDate,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel
}) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState({});
  const [market, setMarket] = useState("");
  const [shipping, setShipping] = useState({});
  const [fulfillment, setFulfillment] = useState({});
  const [categories, setCategories] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filter, setFilter] = useState("all");
  const [salesData, setSalesData] = useState([]);
  const [chartOffset, setChartOffset] = useState(0);
  const chartContainerRef = useRef(null);

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

      if (direction === "left") {
        chartContainerRef.current.scrollLeft -= scrollAmount;
        setChartOffset((prevOffset) => Math.max(0, prevOffset - scrollAmount));
      } else {
        chartContainerRef.current.scrollLeft += scrollAmount;
        setChartOffset((prevOffset) => prevOffset + scrollAmount);
      }
    }
  };

  const fetchData = async () => {
    console.log("verA", marketPlaceId);
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
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_IP}salesAnalytics/`,
        {
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          marketplace_id: marketPlaceId.id,
          date_range: filter,
          start_date: DateStartDate,
          end_date: DateEndDate,
          user_id: userIds,
          timezone: "US/Pacific",
        }
      );

      if (orderResponse.data?.data) {
        setOrder(orderResponse.data.data);

        // Map the data to format it for the chart
        const formattedData = orderResponse.data.data.order_days.map(
          (item) => ({
            date: zonedTimeToUtc(item.date,"US/Pacific"), // Convert date string to Date object
            revenue: item.order_value,
            orderCount: item.order_count, // Add order count
          })
        );

        setSalesData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchData();
}, [
  widgetData,
  marketPlaceId?.id,
  DateStartDate,
  DateEndDate,
  filter,
  JSON.stringify(brand_id),
  JSON.stringify(product_id),
  JSON.stringify(manufacturer_name),
  fulfillment_channel
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6">
          <DottedCircleLoading />
        </Typography>
      </Box>
    );
  }

  const formatDateTick = (tickItem) => {
    return format(tickItem, "MMM dd"); // Format date as "Month Day" (e.g., "Jan 01")
  };

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {/* Custom Bar Chart */}
      </Grid>
      <Grid item xs={12} sm={12}>
        <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              mb: 2,
              width: "101%",
              maxWidth: 1500,
              position: "relative",
              marginLeft: "-10px",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                💲 Total Sales
              </Typography>

              {/* <FormControl
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    minWidth: 100,
                    '& .MuiOutlinedInput-root': {
                        height: 30,
                        padding: '5px',
                    },
                    '& .MuiSelect-icon': {
                        fontSize: '1rem',
                    },
                }}
            >
                <InputLabel id="filter-label">Range</InputLabel>
                <Select
                    labelId="filter-label"
                    id="filter-select"
                    value={filter}
                    label="Filter"
                    onChange={handleFilterChange}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="month">This Month</MenuItem>
                    <MenuItem value="year">This Year</MenuItem>
                </Select>
            </FormControl> */}

              <Typography
                variant="h4"
                align="right"
                fontWeight="bold"
                sx={{ fontSize: "18px", marginBottom: 1 }}
              >
                ${order?.total_sales ? order.total_sales.toFixed(2) : 0}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* <IconButton onClick={() => handleScroll('left')} disabled={chartOffset === 0}>
                    <ArrowBackIosIcon />
                </IconButton> */}

                <div
                  ref={chartContainerRef}
                  style={{
                    width: "calc(100% - 100px)",
                    scrollBehavior: "smooth",
                  }}
                >
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={235}>
                      <LineChart data={salesData}>
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const pacificTime = utcToZonedTime(
                              value,
                              "US/Pacific"
                            );
                            return format(pacificTime, "MMM dd"); // e.g., "Jul 17"
                          }}
                        />

                        <YAxis />
                        <Tooltip
                          formatter={(value) => `$${value.toFixed(2)}`}
                          labelFormatter={(label) => {
                            const pacificTime = utcToZonedTime(
                              label,
                              "US/Pacific"
                            );
                            return format(pacificTime, "MMM dd");
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8A56AC"
                          strokeWidth={2}
                          dot={false} // no initial dots
                          activeDot={{ r: 4 }} // dot appears on hover
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 225,
                        width: "100%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: "center",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#888",
                        }}
                      >
                        No total sales found
                      </Typography>
                    </Box>
                  )}
                </div>

                {/* <IconButton onClick={() => handleScroll('right')}>
                    <ArrowForwardIosIcon />
                </IconButton> */}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TotalOrdersGraph;
