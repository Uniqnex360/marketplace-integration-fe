import React, { useEffect, useState,useRef } from 'react';
import {
    Tabs, Tab, TextField, Menu, Card, Dialog, DialogTitle,DialogContent,CardContent, Typography, Grid,
    Box, Select, MenuItem,IconButton, FormControl, InputLabel, Switch, Button, Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import SettingsIcon from '@mui/icons-material/Settings'; // or SettingsOutlined

import { Close as CloseIcon } from '@mui/icons-material';
import {
    ArrowDownward,
    ArrowUpward,
    BorderBottom,
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import axios from "axios";
import moment from 'moment';
import CheckIcon from '@mui/icons-material/Check';
import { parse,format, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import DottedCircleLoading from '../../../Loading/DotLoading';
import RevenueChooseMetrics from './RevenueChooseMetrics';
import NoteModel from '../NoteModel';
// Centralized color mapping for consistency
const metricColors = {
    gross_revenue: "#00b894",
    net_profit: "#6629b3",
    profit_margin: "#0984e3",
    orders: "#f14682",
    units_sold: "#000080",
    refund_amount: "#e6770d",
    refund_quantity: "#600101"
};


const initialMetricConfig = [
    { id: "gross_revenue", label: "Gross Revenue", value: null, change: null, isNegativeChange: false, color: "#00b894", show: false, isCurrency: true },
    { id: "net_profit", label: "Net Profit", value: null, change: null, isNegativeChange: true, color: "#6629b3", show: false, isCurrency: true },
    { id: "profit_margin", label: "Profit Margin", value: null, change: null, isNegativeChange: true, color: "#0984e3", show: false },
    { id: "orders", label: "Orders", value: null, change: null, isNegativeChange: true, color: "#f14682", show: false },
    { id: "units_sold", label: "Units Sold", value: null, change: null, isNegativeChange: true, color: "#000080", show: false },
    { id: "refund_amount", label: "Refund Amount", value: null, change: null, isNegativeChange: false, color: "#e6770d", show: false, isCurrency: true },
    { id: "refund_quantity", label: "Refund Quantity", value: null, change: null, isNegativeChange: false, color: "#600101", show: false },
];


const metricLabels = {
    gross_revenue: "Gross Revenue",
    net_profit: "Net Profit",
    profit_margin: "Profit Margin",
    orders: "Orders",
    units_sold: "Units Sold",
    refund_amount: "Refund Amount",
    refund_quantity: "Refund Quantity"
};

export default function RrvenueWidget({ startDate, endDate, widgetData,marketPlaceId, brand_id, product_id,manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate  }) {
    const [tab, setTab] = useState(0);
    const [compare, setCompare] = useState('Compare to past');
    const [events, setEvents] = useState(true);
    const [value, setValue] = useState([dayjs().startOf('month'), dayjs()]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [bindGraph, setBindGraph] = useState([]);
    const [openNote, setOpenNote] = useState(false);
 let lastParamsRef = useRef("");

    const [open, setOpen] = useState(false);
    const [visibleMetrics, setVisibleMetrics] = useState([]);
const [showComparisonPill, setShowComparisonPill] = useState(false);
const [comparisonText, setComparisonText] = useState('');

    const [selectedStartDate, setSelectedStartDate] = useState(() => {
        const saved = localStorage.getItem("selectedStartDate");
        return saved ? new Date(saved) : null;
    });

    const [selectedEndDate, setSelectedEndDate] = useState(() => {
        const saved = localStorage.getItem("selectedEndDate");
        return saved ? new Date(saved) : null;
    });

    const [selectedValue, setSelectedValue] = useState('');
    const [graphData, setGraphData] = useState([]);
    const [compareGraphData, setCompareGraphData] = useState([]);
    const [mergedGraphData, setMergedGraphData] = useState([]); // Unified data for the chart
    const [loading, setLoading] = useState(false);

    const [CompareGrpah, setCompareGrpah] = useState([]);
    
    const [compareFinalDate, setCompareFinalDate] = useState([]);
  const [currentFinalDate, setCurrentFinalDate] = useState([]);
 
  const [CompareDateFilter, setCompareDateFilter] = useState([]);

    const [CompareTotal, setCompareTotal] = useState([]);

    const options = [
        { key: 'previous_period', label: 'Previous period' },
        { key: 'previous_week', label: 'Previous week' },
        { key: 'previous_month', label: 'Previous month' },
        { key: 'previous_year', label: 'Previous year' },
    ];

    const handleClick = (event) => setAnchorEl(event.currentTarget);


    const handleMetricToggle = (metric) => {
        setVisibleMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    const handleReset = () => {
        setVisibleMetrics([]);
    };

    const handleApply = () => {
        // Logic to apply the selected metrics
        console.log('Applied Metrics:', visibleMetrics);
        handleClose();
    };


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        fetchRevenue()
    };

 
 const handleChange = async (event) => {
     const value = event.target.value;
     setSelectedValue(value);
   
     if (value !== 'custom') {
       const start = compareDropDown?.[value]?.start;
       const end = compareDropDown?.[value]?.end;
   
       if (start && end) {
         try {
           // Convert "Apr 28, 2025" -> 2025-04-28 format
           const parsedStart = format(parse(start, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
           const parsedEnd = format(parse(end, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
   
           setSelectedStartDate(parsedStart);
           setSelectedEndDate(parsedEnd);
   
           // API CALL AUTOMATIC
           await fetchRevenue(parsedStart, parsedEnd);
   
           // Only show the pill after the API call (or immediately if no API call)
           const selectedOption = options.find(opt => opt.key === value);
           if (selectedOption) {
             let formattedDate;
             if (widgetData === 'Today' || widgetData === 'Yesterday') {
               formattedDate = formatDate(compareDropDown?.[value]?.start);
             } else {
               formattedDate = formatDateRange(
                 compareDropDown?.[value]?.start,
                 compareDropDown?.[value]?.end
               );
             }
             setComparisonText(` ${formattedDate}`);
             setShowComparisonPill(true);
           } else {
             setShowComparisonPill(false);
             setComparisonText('');
           }
         } catch (error) {
           console.error("Error processing comparison value:", error);
           // Optionally handle the error (e.g., show an error message)
           setShowComparisonPill(false);
           setComparisonText('');
         }
       } else {
         setShowComparisonPill(false);
         setComparisonText('');
       }
     } else if (value === 'custom') {
       // Handle custom date range selection logic here
       setComparisonText('— Custom date range');
       setShowComparisonPill(true);
     } else {
       setShowComparisonPill(false);
       setComparisonText('');
     }
   };
 
   const handleClosePill = () => {
     setSelectedValue(null);
     setSelectedEndDate('')
     setSelectedStartDate('')
     console.log('kav',selectedStartDate)
     setShowComparisonPill(false);
     setComparisonText('');
   };
 
 
 
    const formatDateRange = (start, end) => {
        if (!start || !end) return '';
        return `${start} - ${end}`;
    };


    const [compareDropDown, setCompareDropDown] = useState('Compare to past');
// Comapre revenue

    const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

    const isTodayOrYesterday = (preset) => {
        const today = dayjs().format("YYYY-MM-DD");
        const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
        return preset === today || preset === yesterday;
    };
    const formatTime = (timestamp) => {
        const dateObj = dayjs(timestamp);

        // Log to check if timestamp is parsed correctly
        if (!dateObj.isValid()) {
            console.error("Invalid timestamp:", timestamp);
            return "Invalid Date";  // Return a fallback string if the timestamp is invalid
        }

        const today = dayjs().format("YYYY-MM-DD");
        const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
        const tickDate = dateObj.format("YYYY-MM-DD");

        // If it's today or yesterday, show time in 'h:mm A' format (e.g., 1:00 AM)
        if (widgetData === today || widgetData === yesterday) {
            return dateObj.format('h:mm A');
        }

        // Otherwise, show date in 'MMM D' format (e.g., Apr 11)
        return dateObj.format('MMM D');
    };

 const formatDate = (date) => {
        return date ? dayjs(date).format('MMM D, YYYY') : '';
    };
    const CustomTooltip = ({ active, payload, label,compareFinalDate,compareWiseData }) => {
        if (!active || !payload || payload.length === 0) {
            return null;
        }
        console.log('compare time',compareWiseData)

        const CompareTotal = payload[0]?.payload?.CompareTotal;

        // Collect all metric names (without 'Compare ' prefix)
        const allKeysSet = new Set();
        payload.forEach((item) => {
            const name = item.name?.replace("Compare ", "") || "";
            allKeysSet.add(name);
        });
        const allKeys = Array.from(allKeysSet);

        // Format utility
        const formatValue = (val, label) => {
            if (["Gross Revenue", "Net Profit", "Refund Amount"].includes(label)) {
                return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            } else if (["Profit Margin"].includes(label)) {
                return `${parseFloat(val || 0).toFixed(2)}%`;
            } else {
                return Number(val || 0).toLocaleString();
            }
        };
        // Format Dates for Header
        const safeFormatDate = (dateString) => {
            if (!dateString) return '';
            const parsedDate = parseISO(dateString);

            if (isValid(parsedDate)) {
                return format(parsedDate, 'MMM d, yy h:mm aa', { locale: enUS });
            }

            console.error("Invalid date string:", dateString);
            return 'Invalid Date';
        };

        const formattedLabelDateHeader = safeFormatDate(label);
        // Format Dates for Header

        // Format the timestamp from the first payload item
    const firstTimestamp = payload[0]?.payload?.timestamp;

if (firstTimestamp) {
  const date = new Date(firstTimestamp);

  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

  const formattedDate = date.toLocaleDateString('en-US', optionsDate);
  const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

  console.log(`${formattedDate}\n${formattedTime}`);
}
    const formattedFirstTimestampHeader = safeFormatDate(firstTimestamp);

        console.log('time two', firstTimestamp, formattedFirstTimestampHeader);

        return (
            <div
                className="custom-tooltip"
                style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #ccc',
                    minWidth: '320px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end', // Push content to right end
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        gap: '20px' // optional: spacing between the two date columns
                    }}
                >
                    {/* <Box sx={{ width: '100px' }}>
                        <Typography
                            style={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: '14px',
                                textAlign: 'right',
                            }}
                        >
                            {formattedLabelDateHeader}
                        </Typography>
                    </Box> */}

                    {/* {formattedFirstTimestampHeader && CompareGrpah && (
                        <Box sx={{ width: '100px' }}>
                            <Typography
                                style={{
                                    color: '#485E75',
                                    fontFamily: "'Nunito Sans', sans-serif",
                                    fontSize: '14px',
                                    textAlign: 'right',
                                }}
                            >
                                {formattedLabelDateHeader}
                            </Typography>
                        </Box>
                    )} */}
                </div>

                {/* Metric Rows */}
                {allKeys.map((key, index) => {
                    const currentItem = payload.find((p) => p.name === key);
                    const compareItem = payload.find((p) => p.name === `Compare ${key}`);

                    const currentValue = currentItem?.value ?? 0;
                    const compareValue = compareItem?.value ?? (CompareTotal ? 0 : 0);
                    const color = currentItem?.color || compareItem?.color || '#000';

                    // Extract and format dates from the payload for each value
                    const currentDate = currentItem?.payload?.timestamp
                        ? format(new Date(currentItem.payload.timestamp), 'MMMM d, yy')
                        : '';
                    const compareDate = compareItem?.payload?.timestamp
                        ? format(new Date(compareItem.payload.timestamp), 'MMMM d, yy')
                        : '';

                    return (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '5px',
                            }}
                        >
                            {/* Label */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    minWidth: '130px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: color,
                                    }}
                                ></span>
                                <Typography
                                    style={{
                                        color: '#485E75',
                                        fontFamily: "'Nunito Sans', sans-serif",
                                        fontSize: '14px',
                                    }}
                                >
                                    {key}
                                </Typography>
                            </div>


                            {/* Values with Dates */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'flex-start', // Stack value and date
                                    justifyContent: 'flex-end',

                                }}
                            >
                                {/* Current Value */}
                                <div style={{ textAlign: 'right',  minWidth: '100px', }}>
                                    <Typography
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            color: '#333',
                                        }}
                                    >
                                        {formatValue(currentValue, key)}
                                    </Typography>
                                </div>

                                {/* Compare Value — Only show if it's non-zero and CompareGraph exists */}
                                {CompareGrpah  && (
                                    <div style={{ textAlign: 'right' ,minWidth: '100px'}}>
                                        <Typography
                                            style={{
                                                color: '#888',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {formatValue(compareValue, key)}
                                        </Typography>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        );
    };


    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';
    const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

    // useEffect(() => {
    //     fetchRevenue(widgetData);
    // }, [widgetData, marketPlaceId, selectedStartDate, selectedEndDate,selectedValue]);

    const handleOpenMenu = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleSelectPreset = (range) => {
        setValue(range);
        setAnchorEl(null);
    };

  
    const xAxisTickFormatter = (timestamp, widgetData) => {
      const dateObj = dayjs(timestamp);
      if (!dateObj.isValid()) {
        return '';
      }
    
      if (widgetData === 'Today' || widgetData === 'Yesterday') {
        return dateObj.format('h:00 a'); // Format as "2:00 am", "5:00 am", "12:00 pm"
      } else {
        return dateObj.format('MMM DD'); // Default format for other cases
      }
    };


const getYAxisConfig = (metricId) => {
  const metric = metrics.find(m => m.id === metricId);
  if (!metric) {
      return { yAxisId: "left", formatter: (value) => value }; // Default
  }

  let yAxisId = "left";
  let formatter = (value) => value;

  if (metric.isPercentage) {
      yAxisId = "right-percentage";
      formatter = (value) => `${Number(value).toFixed(2)}%`;
  } else if (!metric.isCurrency) {
      yAxisId = "right-number";
      formatter = (value) => Number(value).toLocaleString();
  } else {
      formatter = (value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  return { yAxisId, formatter };
}

const fetchRevenue = async (customStartDate = null, customEndDate = null) => {
    setLoading(true);
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_IP}RevenueWidgetAPIView/`,
            {
                preset: widgetData,
                marketplace_id: marketPlaceId.id,
                user_id: userId,
                compare_startdate: selectedStartDate,
                compare_enddate: selectedEndDate,
                brand_id: brand_id,
                product_id: product_id,
                manufacturer_name: manufacturer_name,
                fulfillment_channel: fulfillment_channel,
                start_date: DateStartDate,
                end_date: DateEndDate,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
        );

        const data = response.data.data;
        setCompareDropDown(data.comapre_past);
        setCompareTotal(data.compare_total);
        setCompareGrpah(!!data.compare_graph);
console.log('kkrss', CompareTotal)
        const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;
        const formatNumber = (value) => Number(value || 0).toLocaleString();

        const availableMetrics = Object.keys(data.total);
        const updatedMetricConfig = initialMetricConfig.map(metric => ({
            ...metric,
            show: availableMetrics.includes(metric.id),
        }));

        setMetrics(updatedMetricConfig.filter(m => m.show).map(metric => ({
            label: metricLabels[metric.id],
            value: metric.isCurrency
                ? formatCurrency(data.total[metric.id])
                : (metric.isPercentage
                    ? formatPercentage(data.total[metric.id])
                    : formatNumber(data.total[metric.id])),
            compareValue: data.compare_total?.[metric.id] !== undefined
                ? (metric.isCurrency
                    ? formatCurrency(data.compare_total[metric.id])
                    : (metric.isPercentage
                        ? formatPercentage(data.compare_total[metric.id])
                        : formatNumber(data.compare_total[metric.id])))
                : null,
            color: metricColors[metric.id],
            colorCompare: metricColors[metric.id],
            id: metric.id,
            isPercentage: metric.isPercentage,
            isCurrency: metric.isCurrency,
        })));
        setVisibleMetrics(updatedMetricConfig.filter(m => m.show).map(m => m.id));

        const transformedGraphData = Object.entries(data.graph || {}).map(
            ([timestamp, values]) => ({
                timestamp,
                date: dayjs(timestamp).toDate(), // Ensure date is a Date object for consistency
                gross_revenue: values.gross_revenue,
                net_profit: values.net_profit,
                profit_margin: values.profit_margin,
                orders: values.orders,
                units_sold: values.units_sold,
                refund_amount: values.refund_amount,
                refund_quantity: values.refund_quantity,
            })
        );
    // Set the graph data
setCurrentFinalDate(transformedGraphData);

const localGraphData = transformedGraphData;

if (localGraphData && localGraphData.length > 0) {
  const startDate = new Date(localGraphData[0].date);
  const endDate = new Date(localGraphData[localGraphData.length - 1].date);

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' };
    const dayMonth = date.toLocaleDateString('en-US', options);
    const year = date.getFullYear(); // Full year (e.g., 2025)
    return `${dayMonth}, ${year}`;
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  // Show only start date for "Today" or "Yesterday", else show range
  const displayDate = (widgetData === 'Today' || widgetData === 'Yesterday')
    ? formattedStart
    : `${formattedStart} - ${formattedEnd}`;

  setCompareDateFilter(displayDate);
  console.log('Formatted Display Date:', displayDate);
}





        const transformedCompareGraphData = Object.entries(data.compare_graph || {}).map(
            ([timestamp, values]) => ({
                timestamp,
                date: dayjs(timestamp).toDate(), // Ensure date is a Date object for consistency
                gross_revenue: values.gross_revenue,
                net_profit: values.net_profit,
                profit_margin: values.profit_margin,
                orders: values.orders,
                units_sold: values.units_sold,
                refund_amount: values.refund_amount,
                refund_quantity: values.refund_quantity,
            })
        );
        setCompareFinalDate(transformedCompareGraphData);

        const mergeGraphDataByOffset = (currentData, compareData) => {
            if (currentData.length === 0 || compareData.length === 0) return [];

            const dateDiff = currentData[0].date.getTime() - compareData[0].date.getTime();
            const compareMap = new Map();

            compareData.forEach(item => {
                const shiftedDate = new Date(item.date.getTime() + dateDiff);
                compareMap.set(shiftedDate.toISOString().split('T')[0], item);
            });

            return currentData.map(item => {
                const dateStr = item.date.toISOString().split('T')[0];
                const compareItem = compareMap.get(dateStr);

                return {
                    date: item.date,
                    gross_revenue: item.gross_revenue ?? 0,
                    net_profit: item.net_profit ?? 0,
                    profit_margin: item.profit_margin ?? 0,
                    orders: item.orders ?? 0,
                    units_sold: item.units_sold ?? 0,
                    refund_amount: item.refund_amount ?? 0,
                    refund_quantity: item.refund_quantity ?? 0,

                    compare_gross_revenue: compareItem?.gross_revenue ?? null,
                    compare_net_profit: compareItem?.net_profit ?? null,
                    compare_profit_margin: compareItem?.profit_margin ?? null,
                    compare_orders: compareItem?.orders ?? null,
                    compare_units_sold: compareItem?.units_sold ?? null,
                    compare_refund_amount: compareItem?.refund_amount ?? null,
                    compare_refund_quantity: compareItem?.refund_quantity ?? null,
                };
            });
        };

        let processedGraphData = [];

        if (transformedGraphData.length > 0 && transformedCompareGraphData.length > 0) {
            processedGraphData = mergeGraphDataByOffset(transformedGraphData, transformedCompareGraphData);
        } else if (transformedGraphData.length > 0) {
            processedGraphData = transformedGraphData.map(item => ({
                ...item,
                compare_gross_revenue: null,
                compare_net_profit: null,
                compare_profit_margin: null,
                compare_orders: null,
                compare_units_sold: null,
                compare_refund_amount: null,
                compare_refund_quantity: null,
            }));
        }

        const isTodayOrYesterday = widgetData === 'Today' || widgetData === 'Yesterday';

        if (isTodayOrYesterday && transformedGraphData.length > 0) {
            const baseDate = widgetData === 'Today'
                ? dayjs().startOf('hour') // Start of the hour for "Today"
                : dayjs().subtract(1, 'day').startOf('hour'); // Start of the hour for "Yesterday"

            const hourlyData = Array.from({ length: 24 }, (_, i) => {
                const ts = baseDate.add(i, 'hour');
                const tsString = ts.toISOString();
                const existingCurrent = transformedGraphData.find(item => dayjs(item.date).isSame(ts, 'hour'));
                const existingCompare = transformedCompareGraphData.find(item => dayjs(item.date).isSame(ts, 'hour'));

                return {
                    timestamp: tsString,
                    date: ts.toDate(),
                    gross_revenue: existingCurrent?.gross_revenue ?? 0,
                    net_profit: existingCurrent?.net_profit ?? 0,
                    profit_margin: existingCurrent?.profit_margin ?? 0,
                    orders: existingCurrent?.orders ?? 0,
                    units_sold: existingCurrent?.units_sold ?? 0,
                    refund_amount: existingCurrent?.refund_amount ?? 0,
                    refund_quantity: existingCurrent?.refund_quantity ?? 0,

                    compare_gross_revenue: existingCompare?.gross_revenue ?? null,
                    compare_net_profit: existingCompare?.net_profit ?? null,
                    compare_profit_margin: existingCompare?.profit_margin ?? null,
                    compare_orders: existingCompare?.orders ?? null,
                    compare_units_sold: existingCompare?.units_sold ?? null,
                    compare_refund_amount: existingCompare?.refund_amount ?? null,
                    compare_refund_quantity: existingCompare?.refund_quantity ?? null,
                };
            });
            setBindGraph(hourlyData);
        } else {
            setBindGraph(processedGraphData);
        }

    } catch (error) {
        console.error('Error fetching metrics:', error);
    } finally {
        setLoading(false);
    }
};



    
useEffect(() => {
    console.log('comparisonText',comparisonText)
    // Combine and merge graph data for both periods
    const allDates = new Set([...(graphData || []).map(item => item.date), ...(compareGraphData || []).map(item => item.date)]);
    const sortedDates = Array.from(allDates).filter(Boolean).sort((a, b) => new Date(a) - new Date(b)); // Filter out null/undefined and sort
    const mergedData = sortedDates.map(date => {
        const currentData = (graphData || []).find(item => item.date === date);
        const compareData = (compareGraphData || []).find(item => item.date === date);
        return {
            date: date ? format(new Date(date), 'MMM dd, HH:mm') : null, // Format for display only if date is valid
            gross_revenue: currentData?.gross_revenue || 0,
            compare_gross_revenue: compareData?.compare_gross_revenue || 0,
            net_profit: currentData?.net_profit || 0,
            compare_net_profit: compareData?.compare_net_profit || 0,
            profit_margin: currentData?.profit_margin || 0,
            compare_profit_margin: compareData?.compare_profit_margin || 0,
            orders: currentData?.orders || 0,
            compare_orders: compareData?.compare_orders || 0,
            units_sold: currentData?.units_sold || 0,
            compare_units_sold: compareData?.compare_units_sold || 0,
            refund_amount: currentData?.refund_amount || 0,
            compare_refund_amount: compareData?.compare_refund_amount || 0,
            refund_quantity: currentData?.refund_quantity || 0,
            compare_refund_quantity: compareData?.compare_refund_quantity || 0,
        };
    }).filter(item => item.date); // Filter out items with null date
    setMergedGraphData(mergedData);
}, [graphData, compareGraphData]);


const formatTimeForData = (timestamp) => {
    const dateObj = dayjs(timestamp);

    if (!dateObj.isValid()) {
        console.error("Invalid timestamp:", timestamp);
        return null; // Return null for invalid dates
    }

    return dateObj.toISOString(); // Keep the full ISO string for data
};




// const xAxisTickFormatter = (value) => {
//     const dateObj = dayjs(value);
//     const today = dayjs().format("YYYY-MM-DD");
//     const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
//     const valueDate = dateObj.format("YYYY-MM-DD");

//     if (!dateObj.isValid()) {
//         return "Invalid Date";
//     }

//     // If the value's date is today or yesterday, return time in 'h:mm A' format
//     if ((valueDate === today && widgetData === 'Today') || (valueDate === yesterday && widgetData === 'Yesterday')) {
//         return dateObj.format('h:mm A');
//     }

//     // Otherwise, return date in 'MMM D' format
//     return dateObj.format('MMM D');
// };

useEffect(() => {
             const currentParams = JSON.stringify({
          
value, widgetData, marketPlaceId, selectedEndDate,selectedValue, selectedStartDate, userId, brand_id, product_id,manufacturer_name, fulfillment_channel , DateStartDate, DateEndDate  });

        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
          
    fetchRevenue();

        }
      
}, [value, widgetData, marketPlaceId, selectedEndDate,selectedValue, selectedStartDate, userId, brand_id, product_id,manufacturer_name, fulfillment_channel , DateStartDate, DateEndDate]); // Add dependencies that might trigger a refetch

 
  const handleCheckboxChange = (event) => {
      const { name, checked } = event.target;
      setVisibleMetrics(prev => {
          if (checked) {
              return [...prev, name];
          } else {
              return prev.filter(item => item !== name);
          }
      });
  };
  const handleOnDateChange = (startDate, endDate) => {
      // Format the dates before sending them to the parent
      const formattedStartDate = startDate.format('YYYY-MM-DD');
      const formattedEndDate = endDate.format('YYYY-MM-DD');

      // Log the formatted dates to the console
      console.log('Formatted Start Date:', formattedStartDate);
      console.log('Formatted End Date:', formattedEndDate);

      // Set the selected dates in the state
      setSelectedStartDate(formattedStartDate);
      setSelectedEndDate(formattedEndDate);

      // Send formatted dates (e.g., as part of an API request or state)
      const compareDates = {
          compare_startdate: formattedStartDate,
          compare_enddate: formattedEndDate,
      };

      // Example: Sending the formatted dates to an API or another function
      // Example API call (replace with actual function)
      // api.sendCompareDates(compareDates);
  };


  return (
      <Box sx={{ p: 2 }}>
          {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, width: '100%' }}>
                  <DottedCircleLoading />
              </Box>
          ) : (
              <Grid container spacing={2} mt={2}>

                  {/* Metrics Grid */}
                  <Grid
                      item
                      xs={12}
                      md={3}
                      sx={{
                          maxHeight: 450,
                          overflowY: 'auto',
                          overflowX: 'hidden',
                          pr: 1,
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
                   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            {metrics.map((metric, index) => {
                console.log('oppo111', metric);
                const isSelected = visibleMetrics.includes(metric.id);
                const isProfitMargin = metric.id === 'profitMargin'; // Assuming 'profitMargin' is the id for profit margin

                return (
                    <Card
                        key={index}
                        sx={{
                            width: '300px',
                            ml: '-28px',
                            p: 1.2,
                            borderRadius: '10px',
                            boxShadow: 'none',
                            cursor: 'pointer',
                            transition: '0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                checked={isSelected}
                                onChange={handleCheckboxChange}
                                name={metric.id}
                                sx={{
                                    p: 0.3,
                                    '& svg': {
                                        fontSize: 16,
                                    },
                                }}
                                icon={
                                    <span
                                        style={{
                                            width: 14,
                                            height: 14,
                                            display: 'block',
                                            borderRadius: 4,
                                            border: `2px solid ${metric.color}`,
                                        }}
                                    />
                                }
                                checkedIcon={
                                    <span
                                        style={{
                                            width: 14,
                                            height: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 4,
                                            backgroundColor: metric.color,
                                            border: `2px solid ${metric.color}`,
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        <CheckIcon sx={{ fontSize: 14 }} />
                                    </span>
                                }
                            />
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontSize: '14px',
                                    ml: 1,
                                    color: '#485E75',
                                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                                }}
                            >
                                {metricLabels[metric.id]}
                            </Typography>
                        </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', ml: 3.5, mt: 1 }}>
<Typography
    variant="h6"
    sx={{
        fontSize: '24px',
        fontWeight: 600,
        color: '#13191',
        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    }}
>
    {metric.id === 'profit_margin'
        ? `${Number(metric.value).toFixed(2)}%`
        : metric.value}
</Typography>



    {metric.compareValue !== undefined && CompareTotal && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mt: 2 }}>
            {(() => {
                const cleanCompareValue = parseFloat(
                    String(metric.compareValue).replace(/[$,%]/g, '').replace(/,/g, '')
                );
                const isPositive = cleanCompareValue > 0;
                const isNegative = cleanCompareValue < 0;

                return (
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isPositive ? 'green' : isNegative ? '#e14d2a' : 'gray',
                            display: 'flex',
                            alignItems: 'center',
                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                        }}
                    >
                        {Math.abs(cleanCompareValue).toFixed(2)}%
                        {isPositive && <ArrowUpward sx={{ color: 'green', fontSize: 16, ml: 0.3 }} />}
                        {isNegative && <ArrowDownward sx={{ color: '#e14d2a', fontSize: 16, ml: 0.3 }} />}
                        {isProfitMargin && `%`}
                    </Typography>
                );
            })()}
        </Box>
    )}
</Box>

                    </Card>
                );
            })}
            <Box
                onClick={handleOpen}
                sx={{
                    marginTop: '-1px',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    p: 1,
                    height: '65px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#485E75'
                }}
            >
                <SettingsIcon sx={{ fontSize: 18 }} />
                Choose Metrics
            </Box>

                          <Dialog open={open} onClose={handleClose}  maxWidth='600'>
                              <DialogContent dividers>
                                  <RevenueChooseMetrics
                                      selectedMetrics={visibleMetrics}
                                      onChange={handleMetricToggle}
                                      onReset={handleReset}
                                      onClose={handleClose}
                                      onApply={handleApply}

                                  />
                              </DialogContent>
                          </Dialog>

                      </Box>
                  </Grid>

{ visibleMetrics.length > 0 && (

                  <Grid item xs={12} md={9}>

                  <Box sx={{ display: 'flex',marginBottom:'10px', justifyContent: 'space-between', alignItems: 'center', }}>
   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    {!showComparisonPill ? (
      <Box sx={{ minWidth: 160 }}>
        <Select
          fullWidth
          value={selectedValue}
          onChange={handleChange}
          displayEmpty
          sx={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 500,
            height: 40,
          }}
          renderValue={(selected) => {
            if (!selected) {
              return 'Compare to past';
            }
            const selectedOption = options.find(opt => opt.key === selected);
            return selectedOption ? selectedOption.label : 'Custom';
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.key} value={option.key}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 500 }}>{option.label}</Typography>
                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                  {(widgetData === 'Today' || widgetData === 'Yesterday')
                    ? formatDate(compareDropDown?.[option.key]?.start)
                    : formatDateRange(
                        compareDropDown?.[option.key]?.start,
                        compareDropDown?.[option.key]?.end
                      )}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <MenuItem value="custom">
         <Box>
              <Typography sx={{ fontWeight: 500 }}>Select custom date range</Typography>
            </Box>
           
          </MenuItem>
        </Select>
      </Box>
    ) : (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#e0f2f7', // Example background color
          borderRadius: '20px',
          padding: '8px 12px',
          fontWeight: 500,
          color: '#1e88e5', // Example text color
        }}
      >
        <Typography sx={{ fontSize: 16, color: 'rgb(43, 57, 72)'}}>{`Comparing to ${options.find(opt => opt.key === selectedValue)?.label || 'Custom period'}`}</Typography>
        <IconButton size="small" onClick={handleClosePill} sx={{ ml: 1 }}>
          <CloseIcon sx={{ fontSize: 16, color: '#757575' }} />
        </IconButton>
      </Box>
    )}
  </Box>
  {(selectedValue &&   <Box sx={{ mt: 1, ml: 1 }}>
    <Typography sx={{ fontSize: '16px', color: '#485E75' }}>
            {CompareDateFilter} {' \u00A0 ... \u00A0 '} {comparisonText}
        </Typography>
  </Box>
    )}
</Box>
    {/* Add Note and Events */}
    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1 }}>
            Events
        </Typography>

        <Switch checked={events} onChange={() => setEvents(!events)} size="small" />

        {events && (
            <Button
                variant="outlined"
                size="small"
                sx={{
                    fontSize: '14px',
                    textTransform: 'none',
                    padding: '4px 12px',
                    color: 'black',
                    borderColor: 'black'
                }}
                onClick={() => setOpenNote(true)}
            >
                + Add Note
            </Button>
        )}
    </Box>

    <NoteModel open={openNote} onClose={() => setOpenNote(false)} />
</Box>


  <ResponsiveContainer width="100%" height={400} sx={{paddingLeft:'3px'}}>
<LineChart data={bindGraph}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
<XAxis
    dataKey="date"
    tickFormatter={(timestamp) => xAxisTickFormatter(timestamp, widgetData)}
    style={{
        fontSize: '12px',
        fontFamily: "'Nunito Sans', sans-serif",
        color: '#485E75',
    }}
    tickLine={false}
    axisLine={{ stroke: '#E0E0E0' }}
    interval="preserveStartEnd"
    padding={{ left: 20, right: 20 }}
/>
<YAxis
    yAxisId="left"
    style={{
        fontSize: '12px',
        fontFamily: "'Nunito Sans', sans-serif",
        color: '#485E75',
    }}
    tickLine={false}
    axisLine={false}
    tickFormatter={(value) => {
        const firstVisibleCurrencyMetric = metrics.find(m => visibleMetrics.includes(m.id) && m.isCurrency);
        if (firstVisibleCurrencyMetric) {
            return `$${Number(value).toLocaleString()}`; // Removed minimumFractionDigits
        }
        const firstVisibleNonPercentageNonCurrency = metrics.find(
            m => visibleMetrics.includes(m.id) && !m.isPercentage && !m.isCurrency
        );
        if (firstVisibleNonPercentageNonCurrency) {
            return Number(value).toLocaleString();
        }
        return value;
    }}
    domain={['auto', 'auto']}
/>

{visibleMetrics.includes('profit_margin') && (
    <YAxis
        yAxisId="right-percentage"
        orientation="right"
        style={{
            fontSize: '12px',
            fontFamily: "'Nunito Sans', sans-serif",
            color: metricColors.profit_margin,
        }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(value) => `${Math.round(value)}%`}
        domain={['auto', 'auto']}
    />
)}

    {(visibleMetrics.includes('orders') || visibleMetrics.includes('refund_quantity') || visibleMetrics.includes('units_sold')) && (
        <YAxis
            yAxisId="right-number"
            orientation="right"
            style={{
                fontSize: '12px',
                fontFamily: "'Nunito Sans', sans-serif",
                color: '#485E75', // You might want to customize this color
            }}
            tickLine={false}
            axisLine={true}
            domain={['auto', 'auto']}
        />
    )}
    <Tooltip content={<CustomTooltip  compareWiseData={compareFinalDate}/>} />
    {visibleMetrics.includes('gross_revenue') && (
        <Line
            type="monotone"
            dataKey="gross_revenue"
            stroke={metricColors.gross_revenue}
            strokeWidth={2}
            name={metricLabels.gross_revenue}
            dot={false}
            yAxisId="left"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('gross_revenue') && (
        <Line
            type="monotone"
            dataKey="compare_gross_revenue"
            stroke={metricColors.gross_revenue}
            strokeWidth={2}
            name={`Compare ${metricLabels.gross_revenue}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="left"
        />
    )}
    {visibleMetrics.includes('net_profit') && (
        <Line
            type="monotone"
            dataKey="net_profit"
            stroke={metricColors.net_profit}
            strokeWidth={2}
            name={metricLabels.net_profit}
            dot={false}
            yAxisId="left"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('net_profit') && (
        <Line
            type="monotone"
            dataKey="compare_net_profit"
            stroke={metricColors.net_profit}
            strokeWidth={2}
            name={`Compare ${metricLabels.net_profit}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="left"
        />
    )}
    {visibleMetrics.includes('profit_margin') && (
        <Line
            type="monotone"
            dataKey="profit_margin"
            stroke={metricColors.profit_margin}
            strokeWidth={2}
            name={metricLabels.profit_margin}
            dot={false}
            yAxisId="right-percentage"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('profit_margin') && (
        <Line
            type="monotone"
            dataKey="compare_profit_margin"
            stroke={metricColors.profit_margin}
            strokeWidth={2}
            name={`Compare ${metricLabels.profit_margin}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="right-percentage"
        />
    )}
    {visibleMetrics.includes('orders') && (
        <Line
            type="monotone"
            dataKey="orders"
            stroke={metricColors.orders}
            strokeWidth={2}
            name={metricLabels.orders}
            dot={false}
            yAxisId="right-number"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('orders') && (
        <Line
            type="monotone"
            dataKey="compare_orders"
            stroke={metricColors.orders}
            strokeWidth={2}
            name={`Compare ${metricLabels.orders}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="right-number"
        />
    )}
    {visibleMetrics.includes('units_sold') && (
        <Line
            type="monotone"
            dataKey="units_sold"
            stroke={metricColors.units_sold}
            strokeWidth={2}
            name={metricLabels.units_sold}
            dot={false}
            yAxisId="right-number"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('units_sold') && (
        <Line
            type="monotone"
            dataKey="compare_units_sold"
            stroke={metricColors.units_sold}
            strokeWidth={2}
            name={`Compare ${metricLabels.units_sold}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="right-number"
        />
    )}
    {visibleMetrics.includes('refund_amount') && (
        <Line
            type="monotone"
            dataKey="refund_amount"
            stroke={metricColors.refund_amount}
            strokeWidth={2}
            name={metricLabels.refund_amount}
            dot={false}
            yAxisId="left"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('refund_amount') && (
        <Line
            type="monotone"
            dataKey="compare_refund_amount"
            stroke={metricColors.refund_amount}
            strokeWidth={2}
            name={`Compare ${metricLabels.refund_amount}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="left"
        />
    )}
    {visibleMetrics.includes('refund_quantity') && (
        <Line
            type="monotone"
            dataKey="refund_quantity"
            stroke={metricColors.refund_quantity}
            strokeWidth={2}
            name={metricLabels.refund_quantity}
            dot={false}
            yAxisId="right-number"
        />
    )}
    {CompareGrpah && visibleMetrics.includes('refund_quantity') && (
        <Line
            type="monotone"
            dataKey="compare_refund_quantity"
            stroke={metricColors.refund_quantity}
            strokeWidth={2}
            name={`Compare ${metricLabels.refund_quantity}`}
            strokeDasharray="5 5"
            dot={false}
            yAxisId="right-number"
        />
    )} 
</LineChart>
</ResponsiveContainer>


                    </Grid>
)}          </Grid>
            )}
         
        </Box>
    );
}