import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Tooltip as MuiTooltip,
    IconButton,
} from "@mui/material";
import { format, subDays } from 'date-fns';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip as RechartTooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import dayjs from 'dayjs';
import DateRangeSelector from '../../DateRange/DateRange';
import { styled } from '@mui/system';

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    color: '#485E75',
    fontSize: '16px',
}));

const dateFormatter = (tickItem) => dayjs(tickItem).format("MMM D");
const rateFormatter = (tick) => tick ? tick.toFixed(2) : '0.00';

const TrafficCard = ({ widgetData, newAsin }) => {
    const [dateRange, setDateRange] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trafficData, setTrafficData] = useState({
        total_sessions: 0,
        average_sessions: 0,
        sessions_graph: [],
        total_page_views: 0,
        average_page_views: 0,
        page_views_graph: [],
        total_units_sold: 0,
        average_units_sold: 0,
        units_sold_graph: [],
    });
    const { id } = useParams();

    const initialDate = () => {
        const today = new Date();
        if (widgetData === 'Today') {
            return { startDate: today, endDate: today, text: format(today, 'MMM dd, yyyy') };
        } else if (widgetData === 'Yesterday') {
            const yesterday = subDays(today, 1);
            return { startDate: yesterday, endDate: yesterday, text: format(yesterday, 'MMM dd, yyyy') };
        } else {
            const last7DaysStart = subDays(today, 6);
            return { startDate: last7DaysStart, endDate: today, text: `${format(last7DaysStart, 'MMM dd, yyyy')} - ${format(today, 'MMM dd, yyyy')}` };
        }
    };

    const [selectedDateRange, setSelectedDateRange] = useState(initialDate());

    const fetchTrafficConversion = async (params) => {
        setLoading(true);
        setError(null);
 try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';

    const finalParams = {
        product_id: id,
        user_id: userId,
        ...(params ? params : { preset: 'Last 7 days' })
    };

    const response = await axios.get(
        `${process.env.REACT_APP_IP}productsTrafficandConversions/`,
        {
            params: finalParams,
        }

            );

            if (response.data.status) {
                setTrafficData(response.data.data);
                setSelectedDateRange({
                    startDate: new Date(response.data.data.start_date),
                    endDate: new Date(response.data.data.end_date),
                    text: response.data.data.date,
                });
                setDateRange(response.data.data.date);
            } else {
                setError(response.data.message || 'Failed to fetch data');
            }

        } catch (err) {
            console.error("Fetch failed:", err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      
            fetchTrafficConversion();
        },
    [id, widgetData]);

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange.text);
        console.log('welcome',newRange)
        fetchTrafficConversion({
            preset: newRange.preset,
            start_date: newRange.startDate,
            end_date: newRange.endDate,
          
        });
    };

    const sessionsChartData = trafficData.sessions_graph.map(item => ({
        date: item.date, // keep it raw
    formattedDate: dayjs(item.date).format("MMM D"), // for x-axis display if needed
       sessions: item.sessions,
        rate: item.average,
    }));

    const pageViewsChartData = trafficData.page_views_graph.map(item => ({
         date: item.date, // keep it raw
    formattedDate: dayjs(item.date).format("MMM D"), // for x-axis display if needed
    views: item.page_views,
        rate: item.average,
    }));

 const ordersChartData = trafficData.units_sold_graph.map(item => ({
    date: item.date, // keep it raw
    formattedDate: dayjs(item.date).format("MMM D"), // for x-axis display if needed
    orders: item.units,
    rate: item.average,
}));


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
        const rawDate = payload[0].payload.date; // full ISO date
        const formattedDate = dayjs(rawDate).format("MMMM D, YYYY");

        return (
            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <Typography>{formattedDate}</Typography>
                {payload.map((item, index) => {
                    const isRate = item.name === 'rate' || item.dataKey === 'rate';
                    const valueDisplay = isRate ? `${item.value}%` : item.value;

                    return (
                        <Typography key={`item-${index}`} style={{ color: '#485E75' }}>
                            {item.name}: {valueDisplay}
                        </Typography>
                    );
                })}
            </div>
        );
    }
    return null;
};



    return (
        <Card variant="outlined" sx={{ borderRadius: 2, ml: -3 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <StyledTypography variant="h6" fontWeight={700} sx={{fontSize:'20px', color:'#121212'}}>
                        Traffic and Conversions
                        <MuiTooltip
                            title={
                                <>
                                    Traffic measures which products customers are discovering most frequently. Products with higher session and page view numbers are being found most frequently. Conversion measures how effective you are at convincing a customer to add your product to their shopping cart.
                                </>
                            }
                            placement="top"
                            arrow
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, 8],
                                            },
                                        },
                                    ],
                                },
                            }}
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        color: '#485E75',
                                        backgroundColor: '#1A2E42',
                                        color: '#fff',
                                        fontSize: '13px',
                                        borderRadius: '6px',
                                        fontFamily: "'Nunito Sans', sans-serif",
                                        maxWidth: 280,
                                        whiteSpace: 'normal',
                                        lineHeight: 1.5,
                                    },
                                },
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height: '16px', width: '16px', color: '#485E75' }} />
                        </MuiTooltip>
                    </StyledTypography>
                  <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
  <Box display="flex" alignItems="center" gap={1} px={1.5} py={0.8}
    sx={{ backgroundColor: '#E2E8F0', borderRadius: '8px', mr: '3px' }}>
    <StyledTypography fontSize="16px" fontWeight={400}>
      {trafficData?.asin}
    </StyledTypography>
    <ArrowDropDownIcon sx={{ color: '#4A5568' }} />
  </Box>

  <DateRangeSelector
  reflectDate={dateRange}
    onDateChange={handleDateRangeChange}
    initialDateRange={{
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate,
      text: selectedDateRange.text,
    }}
  />
</Box>

                </Box>
                <StyledTypography variant="body2" color="textSecondary" mb={2} sx={{fontSize:'14px',}}>
                    {dateRange}
                </StyledTypography>
                <Grid container spacing={3}>
                    {/* Sessions */}
                    <Grid item xs={12} md={4}>
                        <StyledTypography variant="subtitle2"  sx={{ fontWeight: 400 }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#26a69a', marginRight: '8px' }}></span>
                            Sessions
                            <MuiTooltip
                                title={
                                    <>
                                        Visits to your product detail pages within a 24-hour period. A user might view your pages many times on a single visit, resulting in a higher number of page views than sessions. Storefront or browse node visits do not count as a session.
                                    </>
                                }
                                placement="top"
                                arrow
                                slotProps={{
                                    popper: {
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                        ],
                                    },
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            color: '#485E75',
                                            backgroundColor: '#1A2E42',
                                            color: '#fff',
                                            fontSize: '13px',
                                            borderRadius: '6px',
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            maxWidth: 280,
                                            whiteSpace: 'normal',
                                            lineHeight: 1.5,
                                        },
                                    },
                                }}
                            >
                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height: '16px', width: '16px', color: '#485E75' }} />
                            </MuiTooltip>
                        </StyledTypography>

                          <StyledTypography variant="h5"  sx={{fontSize:'28px',marginLeft: '17px',color:'#121212', fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{trafficData.total_sessions}</StyledTypography>
                        <StyledTypography variant="body2" color="textSecondary">
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a237e', marginRight: '8px', }}></span>
                            <strong style={{ color: "#121212" , fontSize:'16px',fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{rateFormatter(trafficData.average_sessions)}%</strong> Average Session Rate
                     <MuiTooltip
    title={
      <>
 The percentage of sessions that contain at least one page view relative to the total number of sessions for all products.    </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon fontSize="small"
      sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height:'16px' , width:'16px' ,color: '#485E75' }}
    />
  </MuiTooltip>     </StyledTypography>
                        <Box sx={{ height: '200px', width: '100%', ml: '-10%', pt: '10px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sessionsChartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="formattedDate"
                                        tickFormatter={(tick) => tick}
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="left"
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={rateFormatter}
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <RechartTooltip content={<CustomTooltip />} />
                                    <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#26a69a" strokeWidth={2}     dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Sessions" />
                                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#1a237e" strokeWidth={2}     dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Session Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* Page Views */}
                    <Grid item xs={12} md={4}>
                        <StyledTypography variant="subtitle2" sx={{ fontWeight: 400 }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef6c00', marginRight: '8px' }}></span>
                            Page Views
                            <MuiTooltip
                                title={
                                    <>
                                        Visits to your offer pages. A user may view your offer pages multiple times within a single time period, resulting in a higher number of page views than sessions. Child ASIN, storefront or browse node visits do not count as a page view.
                                    </>
                                }
                                placement="top"
                                arrow
                                slotProps={{
                                    popper: {
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                        ],
                                    },
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            color: '#485E75',
                                            backgroundColor: '#1A2E42',
                                            color: '#fff',
                                            fontSize: '13px',
                                            borderRadius: '6px',
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            maxWidth: 280,
                                            whiteSpace: 'normal',
                                            lineHeight: 1.5,
                                        },
                                    },
                                }}
                            >
                                <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height: '16px', width: '16px', color: '#485E75' }} />
                            </MuiTooltip>
                        </StyledTypography>

                                <StyledTypography variant="h5"  sx={{fontSize:'28px', marginLeft: '17px',color:'#121212', fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{trafficData.total_page_views}</StyledTypography>
                        <StyledTypography variant="body2" color="textSecondary">
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0277bd', marginRight: '8px' }}></span>
                            <strong style={{ color: "#121212" , fontSize:'16px',fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{rateFormatter(trafficData.average_page_views)}%</strong> Average Page View Rate
                        <MuiTooltip
    title={
      <>
 The percentage of page views that a particular SKU/ASIN receives relative to the total number of page views for all products.    </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon fontSize="small"
      sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height:'16px' , width:'16px' ,color: '#485E75' }}
    />
  </MuiTooltip>  </StyledTypography> 
                        <Box sx={{ height: '200px', width: '100%', ml: '-8%', pt: '10px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={pageViewsChartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                       dataKey="formattedDate"
                                        tickFormatter={(tick) => tick}
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="left"
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={rateFormatter}
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <RechartTooltip content={<CustomTooltip />} />
                                    <Line yAxisId="left" type="monotone" dataKey="views" stroke="#ef6c00" strokeWidth={2}     dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Page Views" />
                                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#0288d1" strokeWidth={2}    dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Page View Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>

                    {/* Units Ordered */}
                    <Grid item xs={12} md={4}>
                        <StyledTypography variant="subtitle2" sx={{ fontWeight: 400 }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2e7d32', marginRight: '8px' }}></span>
                            Units Ordered
                            <MuiTooltip
                                title={
                                    <>
                                        The number of individual units or items ordered.
                                    </>
                                }
                                placement="top"
                                arrow
                                slotProps={{
                                    popper: {
                                        modifiers: [
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                        ],
                                    },
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            color: '#485E75',
                                            backgroundColor: '#1A2E42',
                                            color: '#fff',
                                            fontSize: '13px',
                                            borderRadius: '6px',
                                            fontFamily: "'Nunito Sans', sans-serif",
                                            maxWidth: 280,
                                            whiteSpace: 'normal',
                                            lineHeight: 1.5,
                                        },
                                    },
                                }}
                            >
                                <InfoOutlinedIcon  sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height: '16px', width: '16px', color: '#485E75' }} />
                            </MuiTooltip>
                        </StyledTypography>
                                         <StyledTypography variant="h5" sx={{fontSize:'28px', color:'#121212',marginLeft: '17px',fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{trafficData.total_units_sold}</StyledTypography>
                        <StyledTypography variant="body2" color="textSecondary">
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8e24aa', marginRight: '8px' }}></span>
                            <strong style={{ color: "#121212" , fontSize:'16px',fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"}}>{rateFormatter(trafficData.average_units_sold)}%</strong> Average Order Session Rate
                        <MuiTooltip
    title={
      <>
The number of units purchased relative to the number of customers who viewed the products. Calculated by dividing the number of units by the number of sessions for a selected time period, and then expressed as a percentage.    </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon fontSize="small"
      sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height:'16px' , width:'16px' ,color: '#485E75' }}
    />
  </MuiTooltip>  </StyledTypography>
                        <Box sx={{ height: '200px', width: '100%', ml: '-7%', pt: '10px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ordersChartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                 <XAxis
  dataKey="formattedDate"
  tickFormatter={(tick) => tick}
  axisLine={false}
  tickLine={false}
  style={{ fontSize: '12px', color: '#485E75' }}
/>

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="left"
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={rateFormatter}
                                        style={{ fontSize: '12px', color: '#485E75' }}
                                    />
                                    <RechartTooltip content={<CustomTooltip />} />
                                    <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#2e7d32" strokeWidth={2}     dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Units Ordered" />
                                    <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#8e24aa" strokeWidth={2}     dot={false}           // Hide all dots
      activeDot={{ r: 6 }}  // Show bigger dot on hover (radius 6)
 name="Units Session Rate" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TrafficCard;