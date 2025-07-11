import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    Box, Typography, Grid, ToggleButtonGroup, ToggleButton,
    Card, CardContent, Switch, IconButton, Button, TextField, Tooltip as MuiTooltip
} from "@mui/material";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from "recharts";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { fontSize, styled } from '@mui/system';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import DateRangeSelector from "../../DateRange/DateRange";

import { subDays } from 'date-fns';
import DateRangeSalesOverview from "../../DateRange/DateRangeSalesOverview";

import { format, parseISO, isSameDay } from 'date-fns';
import { enIN } from 'date-fns/locale';
import DateRangeSales from "../../DateRange/DateRangeSalesOverview";

// Custom styled Switch component
const CustomSwitch = styled(Switch)(({ theme }) => ({
    width: 33,
    height: 18,
    padding: 0,
    display: 'flex',
    top: 0,
    margin:'6px 0px 0px 0px',
    '& .MuiSwitch-switchBase': {
        padding: 3,
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#fff',
            '& .MuiSwitch-thumb': {
                color: '#fff', // white when checked
                margin: '0px 0px 0px -4px',
            },
            '& + .MuiSwitch-track': {
                backgroundColor: 'rgb(10, 111, 232)', // blue color when enabled
                opacity: 1,
                color: '#fff',
                border: '2px solid rgb(10, 111, 232)',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 12,
        height: 12,
        boxShadow: 'none',
        color: 'rgb(72, 94, 117)',
        margin: '0px 0px 0px 0px',
    },
    '& .MuiSwitch-track': {
        borderRadius: 24 / 2,
        opacity: 1,
        color: 'rgb(72, 94, 117)', // light grey when off
        backgroundColor: '#fff', // grey when off
        boxSizing: 'border-box',
        border: '1px solid rgb(72, 94, 117)',
    },
}));
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: '#E3EAF2',
    borderRadius: '20px',
    padding: '4px',
    '& .MuiToggleButton-root': {
        border: 'none',
        borderRadius: '20px !important',
        padding: '6px 16px',
        color: '#333',
fontWeight: 500,
        fontFamily:
            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

        textTransform: 'capitalize',
        '&.Mui-selected': {
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
            fontWeight: 'bold', // Make the active tab's font bold
        },
        '&:hover': {
            backgroundColor: '#f0f0f0',
        },
    },
}));

const SalesOverview = () => {
    const { id } = useParams();
    const [tab, setTab] = useState("sales");
    const [alertsEnabled, setAlertsEnabled] = useState(false);
    const [salesData, setSalesData] = useState({});
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedPreset, setSelectedPreset] = useState('last_7_days'); // Initialize with a default preset
    const [selectedStartDate, setSelectedStartDate] = useState(dayjs().subtract(6, 'day'));
    const [selectedEndDate, setSelectedEndDate] = useState(dayjs());
    const [dateRangeText, setDateRangeText] = useState('');

  const [LableDate, setLableDate] = useState('');
 
    const [finalDateSales, setFinalDateSales] = useState('');
    const [finalDateUnit, setFinalDateUnit] = useState('');
    const lastParamsRef = useRef("");
    const isInitialMount = useRef(true);

    const initialDate = () => {
        const today = new Date();
        const last7DaysStart = subDays(today, 6);
        return {
            startDate: last7DaysStart,
            endDate: today,
            text: `${format(last7DaysStart, 'MMM dd, yyyy', { locale: enIN })} - ${format(today, 'MMM dd, yyyy', { locale: enIN })}`,
            preset: 'last_7_days'
        };
    };


    const [selectedDateRange, setSelectedDateRange] = useState(initialDate());

    // Function to format the date or time for the X-axis (now handled directly in XAxis tickFormatter)
    // const formatDateOrTime = (value) => { ... };

    // Function to format the date range for display
    const formatDateDisplay = (start, end) => {
        return `${format(start.toDate(), 'MMM dd, yyyy', { locale: enIN })} - ${format(end.toDate(), 'MMM dd, yyyy', { locale: enIN })}`;
    };

    useEffect(() => {
        if (salesData?.data?.sales?.yesterday?.value !== undefined && tab === 'sales') {
            setFinalDateSales(salesData.data.sales.yesterday.value);
        }
        if (salesData?.data?.units?.yesterday?.value !== undefined && tab === 'units') {
            setFinalDateUnit(salesData.data.units.yesterday.value);
        }
    }, [salesData, tab]);

    const handleTabChange = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    const handlePresetChange = (newPreset) => {
        setSelectedPreset(newPreset);
        let startDate = dayjs();
        let endDate = dayjs();

        switch (newPreset) {
            case 'today':
                break;
            case 'yesterday':
                startDate = dayjs().subtract(1, 'day');
                endDate = dayjs().subtract(1, 'day');
                break;
            case 'last_7_days':
                startDate = dayjs().subtract(6, 'day');
                break;
            case 'last_30_days':
                startDate = dayjs().subtract(29, 'day');
                break;
            case 'this_month':
                startDate = dayjs().startOf('month');
                break;
            case 'last_month':
                startDate = dayjs().subtract(1, 'month').startOf('month');
                endDate = dayjs().subtract(1, 'month').endOf('month');
                break;
            default:
                break;
        }
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
    };

    useEffect(() => {
        const currentParams = JSON.stringify({
            id,
            tab,
            startDate: selectedStartDate?.format('YYYY-MM-DD'),
            endDate: selectedEndDate?.format('YYYY-MM-DD'),
            preset: selectedPreset,
        });

        if (!isInitialMount.current && lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
            fetchSalesOverview({
                start_date: selectedStartDate?.format('YYYY-MM-DD'),
                end_date: selectedEndDate?.format('YYYY-MM-DD'),
                preset: selectedPreset,
            });
        }
        if (isInitialMount.current) {
            isInitialMount.current = false;
            lastParamsRef.current = currentParams;
            fetchSalesOverview({
                start_date: selectedStartDate?.format('YYYY-MM-DD'),
                end_date: selectedEndDate?.format('YYYY-MM-DD'),
                preset: selectedPreset,
            });
        }
    }, [id, tab, selectedStartDate, selectedEndDate, selectedPreset]); // Refetch on tab or date change

    const fetchSalesOverview = async (params) => {
        console.log('para', params);
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData?.id || '';
            const response = await axios.get(
                `${process.env.REACT_APP_IP}productsSalesOverview/`,
                {
                    params: {
                        product_id: id,
                        user_id: userId,
                        ...params,
                    },
                }
            );
            setSalesData(response.data || {});
            console.log('values console', response.data?.data);
            setLableDate(response.data?.data?.label)
            console.log('values', response.data?.data?.units);
            setGraphData(response.data?.data?.graph || []);
            setDateRangeText(formatDateDisplay(selectedStartDate, selectedEndDate));
            // The following lines were trying to access 'sales' and 'units' which were not directly present
            // at the top level of the 'data' object based on the provided JSON structure.
            // If you need to access values within 'sales' or 'units', you should target those nested objects.
            // For example:
            // setFinalDateSales(response.data?.data?.sales?.yesterday?.value || '');
            // setFinalDateUnit(response.data?.data?.units?.yesterday?.value || '');
        } catch (err) {
            console.error("Fetch failed:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };




    const getGraphData = () => {
        if (!graphData) {
            return [];
        }
        return graphData.map(item => {
            const date = parseISO(item.date);
            return {
                date: date,
                value: tab === "sales" ? parseFloat(item.total_price) : item.total_quantity,
            };
        });
    };
    const getGraphYAxisLabel = () => {
        return tab === "sales" ? "Gross Sales ($)" : "Units Sold";
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const getCardData = () => {
        if (tab === "sales") {
            return [
                 {
                    label: "Today",
                    value: `$${parseFloat(salesData?.data?.sales?.today?.value || 0.00).toFixed(2)}`,
                    change: `${parseFloat(salesData?.data?.sales?.today?.difference || 0.00).toFixed(2)}`,
                    isPositive: salesData?.data?.sales?.today?.difference >= 0,
                },
                {
                    label: "Yesterday",
                    value: `$${parseFloat(salesData?.data?.sales?.yesterday?.value || 0.00).toFixed(2)}`,
                    change: `${parseFloat(salesData?.data?.sales?.yesterday?.difference || 0.00).toFixed(2)}`,
                    isPositive: salesData?.data?.sales?.yesterday?.difference >= 0,
                },
                {
                    label: "Previous day",
                    value: `$${parseFloat(salesData?.data?.sales?.previous_day?.value || 0.00).toFixed(2)}`,
                    change: `${parseFloat(salesData?.data?.sales?.previous_day?.difference || 0.00).toFixed(2)}`,
                    isPositive: salesData?.data?.sales?.previous_day?.difference >= 0,
                },
                {
                    label: "Last 7 days",
                    value: `$${parseFloat(salesData?.data?.sales?.last_7_days?.value || 0.00).toFixed(2)}`,
                    change: `${parseFloat(salesData?.data?.sales?.last_7_days?.difference || 0.00).toFixed(2)}`,
                    isPositive: salesData?.data?.sales?.last_7_days?.difference >= 0,
                }
            ];
        } else if (tab === "units") {
            return [
                {
                    label: "Today",
                    value: `${salesData?.data?.units?.today?.value || 0}`,
                    change: `${salesData?.data?.units?.today?.difference || 0}`,
                    isPositive: salesData?.data?.units?.today?.difference >= 0,
                },
                {
                    label: "Yesterday",
                    value: `${salesData?.data?.units?.yesterday?.value || 0}`,
                    change: `${salesData?.data?.units?.yesterday?.difference || 0}`,
                    isPositive: salesData?.data?.units?.yesterday?.difference >= 0,
                },
                {
                    label: "Previous day",
                    value: `${salesData?.data?.units?.previous_day?.value || 0}`,
                    change: `${salesData?.data?.units?.previous_day?.difference || 0}`,
                    isPositive: salesData?.data?.units?.previous_day?.difference >= 0,
                },
                {
                    label: "Last 7 days",
                    value: `${salesData?.data?.units?.last_7_days?.value || 0}`,
                    change: `${salesData?.data?.units?.last_7_days?.difference || 0}`,
                    isPositive: salesData?.data?.units?.last_7_days?.difference >= 0,
                }
            ];
        }
        return [{}, {}, {}]; // Default empty array
    };
    const CustomTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} arrow placement="top" />
    ))(() => ({
        [`& .MuiTooltip-tooltip`]: {
            backgroundColor: '#1A2E42',
            color: '#fff',
            fontSize: '13px',
            padding: '10px',
            maxWidth: 300,
            fontFamily: "'Nunito Sans', sans-serif",
            borderRadius: '6px',
        },
        [`& .MuiTooltip-arrow`]: {
            color: '#1A2E42',
        },
    }));


    const handleDateRangeChange = (newRange) => {
        console.log('welcome', newRange);

        setSelectedPreset(newRange.preset || null);
        setSelectedStartDate(newRange.startDate ? dayjs(newRange.startDate) : null);
        setSelectedEndDate(newRange.endDate ? dayjs(newRange.endDate) : null);
    };

    const cardData = getCardData();
    const chartData = getGraphData();
    const yAxisLabel = getGraphYAxisLabel();


    return (
        <Box p={3} bgcolor="#fff" border="1px solid #E5E7EB" borderRadius={2} marginLeft={-3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>

                <Box display="flex" alignItems="center" sx={{ padding: '3px' }}>
                    <Box display="flex" flexDirection="column">
                        <Box display="flex" alignItems="center">
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                    fontFamily:
                                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                }}
                            >
                                Sales Overview
                            </Typography>

                            < MuiTooltip sx={{ fontSize: '14px' }}
                                title={
                                    <>
                                        The Sales Overview displays up-to-date sales statistics and alerts
                                        for the ASIN, including FBA and FBM, and allows you to filter results
                                        based on date, sales amount, and sales units.
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
                                <InfoOutlinedIcon sx={{ ml: 1, mt: 0.5, height: '16px', width: '16px', color: '#485E75', cursor: 'pointer' }} />
                            </ MuiTooltip>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#485E75',
                                fontSize: '16px',
                                fontFamily: "'Nunito Sans', sans-serif",
                            }}
                        >{LableDate}
                            {/* {tab === 'sales' && finalDateSales ? finalDateSales : (tab === 'units' && finalDateUnit ? finalDateUnit : dateRangeText)} */}
                        </Typography>
                    </Box>
                </Box>




            
                <Box display="flex" alignItems="center" gap={2}>
                 

  <DateRangeSales
  reflectDate={dateRangeText}
    onDateChange={handleDateRangeChange}
    initialDateRange={{
      startDate: selectedDateRange.startDate,
      endDate: selectedDateRange.endDate,
      text: selectedDateRange.text,
    }}
  />
                    {/* <TextField
                        size="small"
                        variant="outlined"
                        value={dateRangeText}
                        InputProps={{
                            startAdornment: <CalendarTodayIcon sx={{ fontSize: 18, mr: 1 }} />,
                            readOnly: true,
                        }}
                        sx={{ width: 220 }}
                    /> */}
                </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                {/* Tabs - Left aligned */}
                <Box>
                    <StyledToggleButtonGroup
                        value={tab}
                        exclusive
                        onChange={(e, newTab) => setTab(newTab)}
                        size="small"
                    >
                        <ToggleButton value="sales" sx={{fontSize:'14px',
                            textTransform: 'capitalize', fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        }}>Sales</ToggleButton>
                        <ToggleButton value="units" sx={{ fontSize:'14px',
                            textTransform: 'capitalize', fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        }}>Units</ToggleButton>
                    </StyledToggleButtonGroup>
                </Box>
                {/* Cards - Center aligned */}
                 {cardData.map((card, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card elevation={3} sx={{ borderRadius: '16px', p: 2, textAlign: 'center' }}>
                        <CardContent>
                            <Typography variant="subtitle2" sx={{
                                color: '#485E75',
                                fontSize: '16px',
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
                            }}>
                                {card.label}
                            </Typography>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Typography variant="h5" fontWeight="bold" sx={{
                                    fontSize: '28px',
                                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
                                }}>
                                    {card.value}
                                </Typography>
                            </Box>
                            <Box> {card.change && (
                                <Box display="flex" alignItems="center" justifyContent="center" color={card.isPositive ? 'green' : 'red'}>
                                    <Typography variant="body2" ml={0.5} sx={{
                                        color: '#485E75',
                                        fontSize: '16px',
                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
                                    }}>
                                        {card.change}
                                    </Typography>   {card.isPositive ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                </Box>
                            )}</Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}

                {/* Alerts - Right aligned */}
         
<Box display="flex" alignItems="center" height={40}>
      {/* <Switch
        checked={alertsEnabled}
        onChange={() => setAlertsEnabled(!alertsEnabled)}
        size="small"
      /> */}
<CustomSwitch
  checked={alertsEnabled}
  onChange={() => setAlertsEnabled(!alertsEnabled)}
  size="small"
/>

      <Typography
        variant="body2"
        sx={{
          fontSize: '16px',
          color: '#485E75',
          fontFamily:
            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
          marginLeft: 1,
        }}
      >
        Set Up Alerts
      </Typography>

      <MuiTooltip
        title={
          <>
            Enable ASIN monitoring to track changes<br />
            (All SKUs under the same ASIN will be enable monitoring).
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
        <InfoOutlinedIcon
          fontSize="small"
          sx={{ ml: 1, mt: 0.5, height: '16px', width: '16px', cursor: 'pointer', color: '#485E75' }}
        />
      </MuiTooltip>
    </Box>
            </Box>

       <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graphData}>
                    {/* Background grid with only horizontal lines */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                    <XAxis
                        sx={{ color: '#485E75' }}
                        dataKey="date"
 padding={{ left: 20, right: 20 }}
                    tickFormatter={(value) => {
   try {
    const date = parseISO(value);
    if (selectedPreset === 'Today' || selectedPreset === 'Yesterday') {
      return format(date, 'h:mm a', { locale: enIN }).toLowerCase(); // force lowercase am/pm
    } else {
      return format(date, 'MMM d, yyyy', { locale: enIN });
    }
    } catch (error) {
      console.error("Error formatting X-axis tick:", error);
      return value;
    }
  }}

                        stroke="#485E75"
                        tick={{ fontSize: 12, fill: '#485E75' }}
                        tickLength={15}
                    />

                    <YAxis
                        sx={{ color: '#485E75' }}
                        tick={{ fontSize: 12, color: '#485E75' }}
                        axisLine={false}
                        tickLine={false}
                        label={{
                            value: 'Values',
                            angle: -90,
                            position: 'insideLeft',
                        }}
                    />

                <Tooltip
  labelFormatter={(value) => {
    try {
      const date = parseISO(value);
      if (selectedPreset === 'Today' || selectedPreset === 'Yesterday') {
        return format(date, 'h:mm a', { locale: enIN }).toLowerCase(); // 12-hour format with lowercase am/pm
      } else {
        return format(date, 'MMM d, yyyy', { locale: enIN }); // e.g. Apr 2, 2025
      }
    } catch (error) {
      console.error("Error formatting tooltip label:", error);
      return value;
    }
  }}
/>

                    {/* Line Chart */}
                    <Line
                        type="monotone"
                         dataKey={tab === "sales" ? "total_price" : "total_quantity"}
                        stroke="#1E88E5"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />

                    {/* Reference horizontal line */}
                    {/* <ReferenceLine y={50} stroke="#B0BEC5" strokeDasharray="3 3" /> */}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default SalesOverview;