// import React, { useEffect, useState } from 'react';
// import { Tabs, Tab, TextField, Menu,Card, CardContent, Typography, Grid, Box, Select, MenuItem, FormControl, InputLabel, Switch, Button } from '@mui/material';
// import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import dayjs from 'dayjs';
// import axios from "axios";

// // 🔁 Add this at the top
// // import dayjs from 'dayjs';

// const presets = [
//   { label: 'Last 7 days', range: [dayjs().subtract(6, 'day'), dayjs()] },
//   { label: 'Last 14 days', range: [dayjs().subtract(13, 'day'), dayjs()] },
//   { label: 'Last 30 days', range: [dayjs().subtract(29, 'day'), dayjs()] },
//   { label: 'Last 60 days', range: [dayjs().subtract(59, 'day'), dayjs()] },
//   { label: 'This Month', range: [dayjs().startOf('month'), dayjs()] },
//   { label: 'Last Month', range: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
//   { label: 'This Year', range: [dayjs().startOf('year'), dayjs()] },
//   { label: 'Last Year', range: [dayjs().subtract(1, 'year').startOf('year'), dayjs().subtract(1, 'year').endOf('year')] },
// ];
// const metrics = [
//   { label: 'Gross Revenue', value: '$16,471,076.91', color: '#00b894' },
//   { label: 'Profit Margin', value: '23.86%', color: '#0984e3' },
//   { label: 'Net Profit', value: '$3,929,548.50', color: '#6c5ce7' },
//   { label: 'Orders', value: '390,718', color: '#e84393' },
//   { label: 'Units Sold', value: '430,052', color: '#2d3436' },
//   { label: 'Refund Amount', value: '$173,224.27', color: '#fdcb6e' },
// ];

// const data = [
//   { date: 'Jan 2024', revenue: 1609256, margin: 13.63, profit: 219402, orders: 37153, units: 40952, refund: 13640 },
//   { date: 'Feb 2024', revenue: 1700000, margin: 20.1, profit: 500000, orders: 40000, units: 45000, refund: 10000 },
//   { date: 'Mar 2024', revenue: 1650000, margin: 24.3, profit: 550000, orders: 42000, units: 46000, refund: 12000 },
//   { date: 'Apr 2024', revenue: 1200000, margin: 22.1, profit: 450000, orders: 35000, units: 43000, refund: 11000 },
//   { date: 'May 2024', revenue: 1300000, margin: 23.4, profit: 490000, orders: 36000, units: 44000, refund: 9000 },
//   { date: 'Jun 2024', revenue: 1400000, margin: 25.2, profit: 520000, orders: 37000, units: 44500, refund: 9500 },
// ];

// export default function RevenueGraph({ startDate, endDate, widgetData }) {
//   const [tab, setTab] = React.useState(0);
//   const [compare, setCompare] = React.useState('Compare to past');
//   const [events, setEvents] = React.useState(true);
//   const [value, setValue] = useState([dayjs().startOf('month'), dayjs()]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [metrics, setMetrics] = useState(null);
// const [previous, setPrevious] = useState(null);
// const [difference, setDifference] = useState(null);
// const [bindGraph, setBindGraph] = useState([]);

//   const userData = JSON.parse(localStorage.getItem('user') || '{}');
//   const userId = userData?.id || '';
 
//   const handleOpenMenu = (e) => {
//     setAnchorEl(e.currentTarget);
//   };

//   const handleSelectPreset = (range) => {
//     setValue(range);
//     setAnchorEl(null);
//   };
//   const fetchRevenue = async (date) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IP}RevenueWidgetAPIView/`,
//         {
//           params: {
//             preset: widgetData,
//             user_id: userId,
//           },
//         }
//       );
//       const data = response.data.data;
//       setMetrics(data.targeted || {});
//       setPrevious(data.previous || {});
//       setDifference(data.difference || {});
//       const transformedGraphData = Object.entries(data.graph_data || {}).map(([date, values]) => ({
//         date, // "february 07"
//         revenue: values.gross_revenue,
//       }));
//       setBindGraph(transformedGraphData);
      
//     } catch (error) {
//       console.error('Error fetching metrics:', error);
//     }
//   };

//   useEffect(() => {
//     fetchRevenue(selectedDate);
//   }, [selectedDate]);


//   return (
//     <Box sx={{ p: 2 }}>
//       {/* <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
//         <Tab label="Revenue" />
//         <Tab label="Top Products" />
//         <Tab label="Advertising" />
//         <Tab label="Latest Orders" />
//       </Tabs> */}

//       <Grid container spacing={2} mt={2}>
//       <Grid item xs={12} md={3}>
//   {metrics.map((metric) => (
//     <Card key={metric.label} sx={{ mb: 1 }}>
//       <CardContent>
//         <Typography
//           variant="subtitle2"
//           color={metric.color}
//           sx={{ fontSize: '14px' }}
//         >
//           {metric.label}
//         </Typography>
//         <Typography
//           variant="h6"
//           sx={{ fontSize: '14px' }}
//         >
//           {metric.value}
//         </Typography>
//       </CardContent>
//     </Card>
//   ))}
//   <Button variant="outlined" size="small" fullWidth>
//     Choose Metrics
//   </Button>
// </Grid>

//         <Grid item xs={12} md={9}>
//           <Box display="flex" justifyContent="space-between" mb={2}>
//             <FormControl size="small">
//               <Select value={compare} onChange={(e) => setCompare(e.target.value)}>
//                 <MenuItem value="Compare to past">Compare to past</MenuItem>
//                 <MenuItem value="This year">This year</MenuItem>
//               </Select>
//             </FormControl>
//             <Box display="flex" alignItems="center" gap={2}>

        
//               <Button variant="outlined" size="small">+ Add Note</Button>
//               <Typography variant="body2">Events</Typography>
//               <Switch checked={events} onChange={() => setEvents(!events)} />
//             </Box>
//           </Box>

//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis yAxisId="left" orientation="left" />
//               <YAxis yAxisId="right" orientation="right" />
//               <Tooltip />
//               <Legend />
//               <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#00b894" name="Gross Revenue" />
//               <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#0984e3" name="Profit Margin" />
//               <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#6c5ce7" name="Net Profit" />
//               <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#e84393" name="Orders" />
//               <Line yAxisId="left" type="monotone" dataKey="units" stroke="#2d3436" name="Units Sold" />
//               <Line yAxisId="left" type="monotone" dataKey="refund" stroke="#fdcb6e" name="Refund Amount" />
//             </LineChart>
//           </ResponsiveContainer>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }




import React, { useEffect, useState } from 'react';
import {
  Tabs, Tab, TextField, Menu, Card, Dialog, DialogTitle,DialogContent,CardContent, Typography, Grid,
  Box, Select, MenuItem, FormControl, InputLabel, Switch, Button, Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

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
import NoteModal from './NoteModel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RevenueCompare from './RevenueComapre/RevenueCompare';
import { parse, format, isValid } from 'date-fns';
import DottedCircleLoading from '../../Loading/DotLoading';
// Centralized color mapping for consistency
const metricColors = {
  revenue: "#00b894",
  profit: "#6629b3",
  margin: "#0984e3",
  orders: "#f14682",
  units: "#000080",
  refund: "#e6770d",
  refundQuantity: "#600101"
};




const metricLabels = {
  revenue: "Gross Revenue",
  profit: "Net Profit",
  margin: "Profit Margin",
  orders: "Orders",
  units: "Units Sold",
  refund: "Refund Amount",
  refundQuantity: "Refund Quantity"
};

export default function RevenueGraph({ startDate, endDate, widgetData }) {
  const [tab, setTab] = useState(0);
  const [compare, setCompare] = useState('Compare to past');
  const [events, setEvents] = useState(true);
  const [value, setValue] = useState([dayjs().startOf('month'), dayjs()]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [bindGraph, setBindGraph] = useState([]);
  const [openNote, setOpenNote] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [graphData, setGraphData] = useState([]);
      const [compareGraphData, setCompareGraphData] = useState([]);
      const [mergedGraphData, setMergedGraphData] = useState([]); // Unified data for the chart
      const [loading, setLoading] = useState(false);

      const [CompareGrpah, setCompareGrpah] = useState([]);
  

  const [CompareTotal, setCompareTotal] = useState([]);
  
  const options = [
    { key: 'previous_period', label: 'Previous period' },
    { key: 'previous_week', label: 'Previous week' },
    { key: 'previous_month', label: 'Previous month' },
    { key: 'previous_year', label: 'Previous year' },
  ];


  const handleChange = async (event) => {
    const value = event.target.value;
    setSelectedValue(value);
  
    if (value !== 'custom') {
      const start = compareDropDown?.[value]?.start;
      const end = compareDropDown?.[value]?.end;
  
      if (start && end) {
        // Convert "Apr 28, 2025" -> 2025-04-28 format
        const parsedStart = format(parse(start, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
        const parsedEnd = format(parse(end, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
  
        setSelectedStartDate(parsedStart);
        setSelectedEndDate(parsedEnd);
  
        // API CALL AUTOMATIC
        await fetchRevenue(parsedStart, parsedEnd);
      }
    }
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
    console.log('9000000333', timestamp)
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
  
  
  const metricLabels = {
    revenue: "Gross Revenue",
    profit: "Net Profit",
    margin: "Profit Margin",
    orders: "Orders",
    units: "Units Sold",
    refund: "Refund Amount",
    refundQuantity: "Refund Quantity"
  };



  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
  
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
      if (["Gross Revenue", "Net Profit", "Refund Amount", "PPC Spend"].includes(label)) {
        return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      } else if (["Profit Margin"].includes(label)) {
        return `${parseFloat(val || 0).toFixed(2)}%`;
      } else {
        return Number(val || 0).toLocaleString();
      }
    };
  
    // Format Dates for Header
    const parsedLabelDate = parse(label, 'MMM d,yyyy', new Date());
    const formattedLabelDate = isValid(parsedLabelDate)
      ? format(parsedLabelDate, 'MMMM d, yy') // "April 23, 25"
      : label;
  
    const compareDateLabel = payload[0]?.payload?.compareDateLabel;
    const parsedCompareDate = compareDateLabel
      ? parse(compareDateLabel, 'MMM d,yyyy', new Date())
      : null;
    const formattedCompareDateHeader =
      parsedCompareDate && isValid(parsedCompareDate)
        ? format(parsedCompareDate, 'MMMM d, yy') // "April 23, 24"
        : compareDateLabel;
  
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
        {/* Header Dates */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          <Typography
            style={{
              color: '#485E75',
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: '14px',
              textAlign: 'left',
            }}
          >
            {formattedLabelDate}
          </Typography>
          {formattedCompareDateHeader && (
            <Typography
              style={{
                color: '#485E75',
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: '14px',
                textAlign: 'right',
              }}
            >
              {formattedCompareDateHeader}
            </Typography>
          )}
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
                  minWidth: '120px',
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
  

              {/* <Grid container spacing={2}>
              <Grid item xs={3}>
                </Grid>
              <Grid item xs={3}>
   {compareDate && (
                    <Typography style={{ fontSize: '11px', color: '#888' }}>
                      {compareDate}
                    </Typography>
                  )}
                  </Grid> 
                  <Grid item xs={3}>
                  {currentDate && (
                    <Typography style={{ fontSize: '11px', color: '#888' }}>
                      {currentDate}
                    </Typography>
                  )}
                    </Grid>
                    </Grid>
   */}
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
  <div style={{ textAlign: 'right',   minWidth: '100px', }}>
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
  
  
  const [selectedMetrics, setSelectedMetrics] = useState({
    revenue: true,
    profit: true,
    margin: true,
    orders: true,
    units: true,
    refund: true,
    refundQuantity: true
  });

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData?.id || '';
  const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

  useEffect(() => {
    fetchRevenue(widgetData);
  }, [widgetData, selectedStartDate, selectedEndDate,selectedValue]);

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleSelectPreset = (range) => {
    setValue(range);
    setAnchorEl(null);
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}RevenueWidgetAPIView/`,
        {
          params: {
            preset: widgetData,
            user_id: userId,
            compare_startdate: selectedStartDate,
            compare_enddate: selectedEndDate,
          },
        }
      );
  
      const data = response.data.data;
      setCompareDropDown(data.comapre_past);
      const compareData = data.compare_total || {};
  setCompareTotal(data.compare_total)
   setCompareGrpah(data.compare_graph)
      const formatCurrency = (amount) => `$${Number(amount || 0).toLocaleString()}`;
      const formatPercentage = (value) => `${Number(value || 0)}%`;
      const formatNumber = (value) => Number(value || 0).toLocaleString();
  
      const calculatedMetrics = [

      {
          label: "Gross Revenue",
          value: formatCurrency(data.total.gross_revenue),
          compareValue: formatNumber(compareData.gross_revenue),
          color: metricColors.revenue,
          colorCompare: metricColors.revenue,
          id: 'revenue'
        },
        {
          label: "Profit Margin",
          value: formatPercentage(data.total.profit_margin),
          compareValue: formatNumber(compareData.profit_margin),
          color: metricColors.margin,
          colorCompare: metricColors.margin,
    
          id: 'margin',
          isPercentage: true
        },
        {
          label: "Net Profit",
          value: formatCurrency(data.total.net_profit),
          compareValue: formatNumber(compareData.net_profit),
          color: metricColors.profit,
          colorCompare: metricColors.profit,
    
          id: 'profit'
        },
        {

         

          label: "Orders",
          value: formatNumber(data.total.orders),
          compareValue: formatNumber(compareData.orders),
          color: metricColors.orders,
          colorCompare: metricColors.orders,
          id: 'orders'
        },
        {
          label: "Units Sold",
          value: formatNumber(data.total.units_sold),
          compareValue: formatNumber(compareData.units_sold),
          color: metricColors.units,
          colorCompare: metricColors.units,
  
          id: 'units'
        },
        {
          label: "Refund Amount",
          value: formatCurrency(data.total.refund_amount),
          compareValue: formatNumber(compareData.refund_amount),
          color: metricColors.refund,
          colorCompare: metricColors.refund,
  
          id: 'refund'
        },
        {
       
          label: "Refund Quantity",
          value: formatNumber(data.total.refund_quantity),
          compareValue: formatNumber(compareData.refund_quantity),
          color: metricColors.refundQuantity,
          colorCompare: metricColors.refundQuantity,
  
          id: 'refundQuantity'
        },
      ];
  
      setMetrics(calculatedMetrics);
  
      // Timestamp normalize function
      const normalizeTimestamp = (timestamp) => dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
  
    // Transform Graph Data
const transformedGraphData = Object.entries(data.graph || {}).map(([timestamp, values]) => {
  return {
    timestamp,
    date: formatTimeForData(timestamp),
    gross_revenue: values.gross_revenue,
    net_profit: values.net_profit,
    profit_margin: values.profit_margin,
    orders: values.orders,
    units_sold: values.units_sold,
    refund_amount: values.refund_amount,
    refund_quantity: values.refund_quantity,
  };
});

const transformedCompareGraphData = Object.entries(data?.compare_graph || {}).map(([timestamp, values]) => {
  return {
    timestamp,
    date: formatTimeForData(timestamp),
    compare_gross_revenue: values.gross_revenue,
    compare_net_profit: values.net_profit,
    compare_profit_margin: values.profit_margin,
    compare_orders: values.orders,
    compare_units_sold: values.units_sold,
    compare_refund_amount: values.refund_amount,
    compare_refund_quantity: values.refund_quantity,
  };
});

// ✅ Merge both into one array for the chart
const mergedMap = new Map();

// Add current period data
transformedGraphData.forEach(entry => {
  mergedMap.set(entry.timestamp, { ...entry });
});

// Add compare period data
transformedCompareGraphData.forEach(entry => {
  const existing = mergedMap.get(entry.timestamp) || { timestamp: entry.timestamp, date: formatTimeForData(entry.timestamp) };
  mergedMap.set(entry.timestamp, { ...existing, ...entry });
});

// Convert merged map to array and sort by timestamp
const mergedGraphData = Array.from(mergedMap.values()).sort(
  (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
);

// ✅ Set bindGraph to final merged data for rendering the lines
setBindGraph(mergedGraphData);


                  const allTimestamps = new Set();
                  const isTodayOrYesterday = widgetData === 'Today' || widgetData === 'Yesterday';
              
                  if (isTodayOrYesterday) {
                    const baseDate = widgetData === 'Today' ? dayjs() : dayjs().subtract(1, 'day');
                    const fixedTimes = [
                      baseDate.hour(1).minute(0).second(0),
                      baseDate.hour(4).minute(0).second(0),
                      baseDate.hour(8).minute(0).second(0),
                      baseDate.hour(12).minute(0).second(0),
                      baseDate.hour(16).minute(0).second(0),
                      baseDate.hour(20).minute(0).second(0),
                      baseDate.hour(23).minute(59).second(0),
                    ];
                    fixedTimes.forEach(dt => {
                      allTimestamps.add(dt.toISOString());
                    });
                  } else {
                    const baseDate = dayjs().startOf('day');
                    const startDate =
                      widgetData === 'This Week' ? baseDate.subtract(6, 'day') : baseDate.subtract(13, 'day');
                    for (let i = 0; i < 7; i++) {
                      const date = startDate.add(i, 'day').startOf('day');
                      allTimestamps.add(date.toISOString());
                    }
                  }
              
                  setBindGraph(mergedGraphData);
                } catch (error) {
                  console.error('Error fetching metrics:', error);
                }
                finally {
                  setLoading(false);
                }
              };
              
            
            
   
      // Create map of normalized timestamps for compare data
      // const compareDataMap = new Map(
      //   transformedCompareGraphData.map(item => [item.timestamp, item])
      // );
      
      // Merge current and compare graph data
//       const mergedGraphData = transformedGraphData.map(dataPoint => {
//         const comparePoint = compareDataMap.get(dataPoint.timestamp);
      
//   if (compareData) {
//     console.log('compare',  compareData); // Log only if both exist
//   }

//   return {
//     ...dataPoint,
//     ...(comparePoint && {
//       compare_gross_revenue: comparePoint.compare_gross_revenue,
//       compare_net_profit: comparePoint.compare_net_profit,
//       compare_profit_margin: comparePoint.compare_profit_margin,
//       compare_orders: comparePoint.compare_orders,
//       compare_units_sold: comparePoint.compare_units_sold,
//       compare_refund_amount: comparePoint.compare_refund_amount,
//       compare_refund_quantity: comparePoint.compare_refund_quantity,})







//   };
// });
      
    

     useEffect(() => {
          // Combine and merge graph data for both periods
          const allDates = new Set([...graphData.map(item => item.date), ...compareGraphData.map(item => item.date)]);
          const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b)); // Sort by full date/time
          const mergedData = sortedDates.map(date => {
              const currentData = graphData.find(item => item.date === date);
              const compareData = compareGraphData.find(item => item.date === date);
              return {
                  date: format(new Date(date), 'MMM dd, yyyy HH:mm'), // Format for display
                  revenue: currentData?.revenue || 0,
                  compareRevenue: compareData?.compareRevenue || 0,
              };
          });
          setMergedGraphData(mergedData);
      }, [graphData, compareGraphData]);
  
  
  const formatTimeForData = (timestamp) => {
    const dateObj = dayjs(timestamp);
  
    if (!dateObj.isValid()) {
      console.error("Invalid timestamp:", timestamp);
      return "Invalid Date";
    }
  
    return dateObj.toISOString(); // Keep the full ISO string for data
  };
  
  
  const xAxisTickFormatter = (value) => {
    const dateObj = dayjs(value);
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
    const valueDate = dateObj.format("YYYY-MM-DD");
  
    // If the value's date is today or yesterday, return time in 'h:mm A' format
    if (valueDate === today && widgetData === 'Today'  || valueDate === yesterday &&  widgetData === 'Yesterday') {
      return dateObj.format('h:mm A');
    }
  
    // Otherwise, return date in 'MMM D' format
    return dateObj.format('MMM D');
  };
  

  useEffect(() => {
    fetchRevenue();
  }, [value]);

  const handleCheckboxChange = (event) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [event.target.name]: event.target.checked,
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

        console.log('oppo111',metric.compareValue)
        const isSelected = selectedMetrics[metric.id];
        return (
          <Card
            key={index}
            sx={{
              width: '300px', // Increased width to accommodate compare value
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
    {metric.value}
  </Typography>
  {metric.compareValue !== undefined && CompareTotal && (
  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mt: 2 }}>
    <Typography
      variant="body2"
      sx={{
        fontSize: '14px',
        fontWeight: 500,
        color: metric.compareValue > 0 ? 'green' : metric.compareValue < 0 ? '#e14d2a' : 'gray',
        display: 'flex',
        alignItems: 'center',
        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      }}
    >
      {Math.abs(Number(metric.compareValue)).toFixed(2)}
      {Number(metric.compareValue) > 0 && (
        <ArrowUpward sx={{ color: 'green', fontSize: 16, ml: 0.3 }} />
      )}
      {Number(metric.compareValue) < 0 && (
        <ArrowDownward sx={{ color: '#e14d2a', fontSize: 16, ml: 0.3 }} />
      )}
    </Typography>
  </Box>
)}


</Box>
          </Card>
        );
      })}
    </Box>
        </Grid>

        {/* Chart and Controls Grid */}
        <Grid item xs={12} md={9}>
          <Box display="flex" justifyContent="space-between" mb={2} >
         
           <Box sx={{ minWidth: 220, marginLeft:'33px' }}>
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
            <Box>
              <Typography sx={{ fontWeight: 500 }}>{option.label}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                {formatDateRange(
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
    color: 'black', // 👈 sets the text color to black
    borderColor: 'black' // optional: sets the border color to black as well
  }}
  onClick={() => setOpenNote(true)}
>
  + Add Note
</Button>

  )}
</Box>

<NoteModal open={openNote} onClose={() => setOpenNote(false)} />

          </Box>
          <ResponsiveContainer width="100%" height={400}>
  <LineChart data={bindGraph} syncId="dashboardSync">
    <defs>
      <pattern id="dots" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="3" fill="#ccc" />
      </pattern>
    </defs>

    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis
  dataKey="timestamp"
  tickFormatter={xAxisTickFormatter}
  tick={{ fontSize: 12 }}
  padding={{ left: 20, right: 20 }}
  ticks={Object.keys(graphData) // Use keys from graphData for current period timestamps
    .sort()} // Ensure they are sorted
/>

    {/* Y-Axes */}
    <YAxis
      yAxisId="left"
      orientation="left"
      tick={{ fontSize: 12, dx: -5 }}
      tickFormatter={(value) => `$${value?.toFixed(2)}`}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      yAxisId="right-percent"
      orientation="right"
      tick={{ fontSize: 12, dx: 10 }}
      tickFormatter={(val) => `${Math.round(val)} %`}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      yAxisId="right-quantity"
      orientation="right"
      tick={{ fontSize: 12, dx: 15 }}
      axisLine={true}
      tickLine={false}
      allowDecimals={false}
      tickFormatter={(value) => Math.round(value)}
    />

    {/* Tooltip */}
    <Tooltip content={<CustomTooltip />} />

    {/* Revenue line (default/basic) */}
    {bindGraph?.some((d) => d.revenue !== undefined) && (
      <Line
        type="monotone"
        dataKey="revenue"
        stroke="#8884d8"
        name="Current Period"
      />
    )}
    {compareGraphData.length > 0 &&
      bindGraph?.some((d) => d.compareRevenue !== undefined) && (
        <Line
          type="monotone"
          dataKey="compareRevenue"
          stroke="#82ca9d"
          name={
            widgetData === "custom"
              ? `Compared Period (${formatDateRange()})`
              : options.find((opt) => opt.key === widgetData)?.label
          }
          strokeDasharray="5 5"
        />
      )}

    {/* Current Metrics */}
    {selectedMetrics.revenue && (
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="gross_revenue"
        name="Gross Revenue"
        stroke={metricColors.revenue}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.margin && (
      <Line
        yAxisId="right-percent"
        type="monotone"
        dataKey="profit_margin"
        name="Profit Margin"
        stroke={metricColors.margin}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.profit && (
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="net_profit"
        name="Net Profit"
        stroke={metricColors.profit}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.orders && (
      <Line
        yAxisId="right-quantity"
        type="monotone"
        dataKey="orders"
        name="Orders"
        stroke={metricColors.orders}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.units && (
      <Line
        yAxisId="right-quantity"
        type="monotone"
        dataKey="units_sold"
        name="Units Sold"
        stroke={metricColors.units}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.refund && (
      <Line
        yAxisId="left"
        type="monotone"
        dataKey="refund_amount"
        name="Refund Amount"
        stroke={metricColors.refund}
        strokeWidth={2}
        dot={false}
      />
    )}
    {selectedMetrics.refundQuantity && (
      <Line
        yAxisId="right-quantity"
        type="monotone"
        dataKey="refund_quantity"
        name="Refund Quantity"
        stroke={metricColors.refundQuantity}
        strokeWidth={2}
        dot={false}
      />
    )}

    {/* Compare Metrics */}
    {selectedMetrics.revenue &&
      bindGraph?.some((d) => d.compare_gross_revenue !== undefined) && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="compare_gross_revenue"
          name="Compare Gross Revenue"
          stroke={metricColors.revenue}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.margin &&
      bindGraph?.some((d) => d.compare_profit_margin !== undefined) && (
        <Line
          yAxisId="right-percent"
          type="monotone"
          dataKey="compare_profit_margin"
          name="Compare Profit Margin"
          stroke={metricColors.margin}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.profit &&
      bindGraph?.some((d) => d.compare_net_profit !== undefined) && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="compare_net_profit"
          name="Compare Net Profit"
          stroke={metricColors.profit}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.orders &&
      bindGraph?.some((d) => d.compare_orders !== undefined) && (
        <Line
          yAxisId="right-quantity"
          type="monotone"
          dataKey="compare_orders"
          name="Compare Orders"
          stroke={metricColors.orders}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.units &&
      bindGraph?.some((d) => d.compare_units_sold !== undefined) && (
        <Line
          yAxisId="right-quantity"
          type="monotone"
          dataKey="compare_units_sold"
          name="Compare Units Sold"
          stroke={metricColors.units}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.refund &&
      bindGraph?.some((d) => d.compare_refund_amount !== undefined) && (
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="compare_refund_amount"
          name="Compare Refund Amount"
          stroke={metricColors.refund}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
    {selectedMetrics.refundQuantity &&
      bindGraph?.some((d) => d.compare_refund_quantity !== undefined) && (
        <Line
          yAxisId="right-quantity"
          type="monotone"
          dataKey="compare_refund_quantity"
          name="Compare Refund Quantity"
          stroke={metricColors.refundQuantity}
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
        />
      )}
  </LineChart>
</ResponsiveContainer>


        </Grid>
      </Grid>
    )}
    </Box>
  );
}
