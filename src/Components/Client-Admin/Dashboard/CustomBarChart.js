import React, { useEffect, useState ,useRef} from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell, LabelList } from 'recharts';
import { Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, Typography, Card, CardContent } from '@mui/material';

const colors = ["#0F67B1", "#64bef0"]; // Green for current and Orange for previous

const CustomBarChart = ({ marketPlaceId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rangeType, setRangeType] = useState('year'); // Default range type is 'year'
    const [trendPercentage, setTrendPercentage] = useState(null); // To store trend percentage value
    const [currentPercentage, setCurrentPercentage] = useState(null); // To store trend percentage value
    const lastParamsRef = useRef("");

    const userData = localStorage.getItem("user");
    let userIds = "";

    if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
    }

    // Fetch the sales trend data based on the selected range (day, week, month, year)
    useEffect(() => {
  const currentParams = JSON.stringify({

   marketPlaceId, rangeType    });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
  fetchTrendsReport();
    }
          
    }, [marketPlaceId, rangeType]);

        const fetchTrendsReport = async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_IP}getSalesTrendPercentage/`,
                    {
                        marketplace_id: marketPlaceId.id,
                        range_type: rangeType, // Using the selected rangeType
                        user_id: userIds,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }
                );

                // Check if response contains the trend_percentage data
                if (response.data && response.data.data && response.data.data.trend_percentage) {
                    const trendData = response.data.data.trend_percentage[0]; // Assuming data contains a single item

                    // Map the trend_percentage data to the format required for the chart
                    const chartData = [{
                        name: trendData.id, // Set name as id (like "all")
                        current_range_sales: trendData.current_range_sales, // The current sales value
                        previous_range_sales: trendData.previous_range_sales, // The previous sales value
                        trend_percentage: trendData.trend_percentage, // The percentage change
                        current_percentage: trendData.current_percentage
                    }];

                    setData(chartData); // Set the mapped data for the chart
                    setTrendPercentage(trendData.trend_percentage); // Set trend percentage to display at the top
                    setCurrentPercentage(trendData.current_percentage);
                } else {
                    console.error("Invalid response from API or missing trend_percentage data");
                }
            } catch (error) {
                console.error("Error fetching sales trends:", error);
            } finally {
                setLoading(false);
            }
        };

      

    // Handle range type change (dropdown selection)
    const handleRangeChange = (event) => {
        setRangeType(event.target.value); // Set the selected range type
    };

    // Loading spinner while data is being fetched
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Card sx={{ width: "100%", maxWidth: "800px", margin: "auto", border: "1px solid #ccc", height: 330, position: "relative" }}>
            <CardContent sx={{ height: '100%', padding: 2 }}>
                <Box sx={{ position: 'absolute', top: 16, right: 16, left: 16, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    {trendPercentage !== null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', paddingRight: '5px' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: trendPercentage < 100 ? 'red' : 'green',
                                    marginRight: 1
                                }}
                            >
                                Trend Percentage: {Math.abs(trendPercentage.toFixed(2))}%
                            </Typography>
                            {trendPercentage < 100 ? (
                                <Typography sx={{ color: 'red', fontSize: '18px' }}>
                                    &#8595; {/* Down arrow */}
                                </Typography>
                            ) : (
                                <Typography sx={{ color: 'green', fontSize: '18px' }}>
                                    &#8593; {/* Up arrow */}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Dropdown for time range on the right side */}
                    {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControl sx={{
                            minWidth: 100,
                            '& .MuiOutlinedInput-root': {
                                height: 30, // Adjust height
                                padding: '5px', // Adjust padding for a more compact look
                            },
                            '& .MuiSelect-icon': {
                                fontSize: '1rem', // Adjust icon size if needed
                            },
                        }}>
                            <InputLabel id="range-select-label">Range</InputLabel>
                            <Select
                                labelId="range-select-label"
                                value={rangeType}
                                onChange={handleRangeChange} // Handle the change for range
                                label="Range"
                            >
                                <MenuItem value="day">Day</MenuItem>
                                <MenuItem value="week">Week</MenuItem>
                                <MenuItem value="month">Month</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                            </Select>
                        </FormControl>
                    </Box> */}
                </Box>

                {/* Bar Chart Container */}
                <Box sx={{ width: "100%", height: 'calc(100% - 70px)', marginTop: '40px', position: "relative" }}> {/* Adjust height and marginTop */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}> {/* Add top margin */}
                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                            <XAxis dataKey="name" axisLine={true} tick={{ fill: "#333", fontWeight: "bold" }} />
                            <YAxis axisLine={true} tick={{ fill: "#666" }} />

                            <Tooltip
                                cursor={{ fill: "rgba(0,0,0,0.1)" }}
                                formatter={(value, name) => {
                                    if (name === "trend_percentage") {
                                        return `${value}%`; // Format trend percentage in Tooltip
                                    }
                                    return `$${value.toFixed(2)}`;
                                }}
                                contentStyle={{
                                    fontSize: "12px", // Set tooltip font size to 12px
                                    backgroundColor: "rgba(255, 255, 255, 0.9)", // Optional: Adjust background color
                                    borderRadius: "4px", // Optional: Optional border radius for the tooltip
                                    border: "1px solid #ccc", // Optional: Optional border color for the tooltip
                                }}
                            />
                            <Legend />

                            {/* Grouped Bar Chart */}
                            {/* Previous Sales - Positioned to the left */}
                            <Bar dataKey="previous_range_sales" fill={colors[1]} name="Previous Year Sales" barSize={30} layout="vertical">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[1]} />
                                ))}
                            </Bar>

                            {/* Current Sales - Positioned to the right */}
                            <Bar dataKey="current_range_sales" fill={colors[0]} name="Current Year Sales" barSize={30} layout="vertical">
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[0]} />
                                ))}
                                {/* Add trend_percentage as label for current sales */}
                                <LabelList
                                    dataKey="current_percentage"
                                    position="top"
                                    content={({ x, y, value }) => (
                                        <text
                                            x={x + 10}  // Adjust position
                                            y={y - 5}   // Move slightly above the bar
                                            textAnchor="middle"
                                            fill="#333"
                                            fontSize="10px" // Reduce font size
                                        >
                                            {value !== undefined ? `${value.toFixed(1)}%` : ''}
                                        </text>
                                    )}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>

    );
};

export default CustomBarChart;