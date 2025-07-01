import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import './Helium.css';

import {
  ArrowDownward,
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
} from 'recharts';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/en';
import axios from 'axios';

dayjs.extend(weekOfYear);
dayjs.locale('en');

const MetricItem = ({
  title,
  value,
  change,
  isNegative,
  tooltip,
  currencySymbol,
  percentSymbol,
}) => {
  const absValue = Math.abs(value ?? 0);
  const absChange = Math.abs(change ?? 0);

  const displayValue =
    `${(value ?? 0) < 0 ? '-' : ''}${currencySymbol ?? ''}${absValue}${percentSymbol ?? ''}`;

  const displayChange =
    change !== undefined
      ? `${change < 0 ? '-' : ''}${currencySymbol ?? ''}${absChange}${percentSymbol ?? ''}`
      : '';

  return (
    <Card sx={{ borderRadius: 2, minWidth: 160, height: 60 }}>
      <CardContent sx={{ py: 0.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize={14} color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
          <Tooltip title={tooltip || ''}>
            <Typography variant="subtitle2" sx={{fontSize:'20px'}} fontWeight="bold">
              {displayValue}
            </Typography>
          </Tooltip>

          {change !== undefined && (
            <Typography
              fontSize={11}
              color={isNegative ? 'error.main' : 'success.main'}
              display="flex"
              alignItems="center"
              gap={0.5}
            >
              {displayChange}
              {isNegative ? (
                <ArrowDownward fontSize="inherit" />
              ) : (
                <ArrowUpward fontSize="inherit" />
              )}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};



const HeliumCard = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [metrics, setMetrics] = useState({});
  const [previous, setPrevious] = useState({});
  const [difference, setDifference] = useState({});
  const [bindGraph, setBindGraph] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData?.id || '';

  const fetchMetrics = async (date) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
        {
          params: {
            target_date: date.format('DD/MM/YYYY'),
            user_id: userId,
          },
        }
      );
      const data = response.data.data;
      setMetrics(data.targeted || {});
      setPrevious(data.previous || {});
      setDifference(data.difference || {});
      const transformedGraphData = Object.entries(data.graph_data || {}).map(
        ([date, values]) => ({
          date,
          revenue: `${values.gross_revenue.toLocaleString('en-IN')}`, // For INR with commas
        })
      );
      
      setBindGraph(transformedGraphData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedDate);
  }, [selectedDate]);

  const handlePrevious = () => setSelectedDate((prev) => prev.subtract(1, 'day'));
  const handleNext = () => setSelectedDate((prev) => prev.add(1, 'day'));

  const formatCurrency = (value) => {
    if (value == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fff',
        height: '60px', // 🔽 Reduced height
        width: '99%',
        boxShadow: 'none',
        py: 0.5,
      }}
    >
     <Box
  sx={{
    display: 'flex',
    gap: 1,
    overflowX: 'auto',
    pr: 1,
    width: '90%',
    '&::-webkit-scrollbar': {
      height: 2, // 🔽 Reduced from 4 to 2
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#c1c1c1',
      borderRadius: 10,
      minHeight: 2,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  }}
>

        {/* Date and Revenue */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Date Nav */}
          <Box
            display="flex"
            width={200}
            alignItems="center"
            gap={1}
            p={1}
            sx={{ borderRight: '1px solid #e0e0e0' }}
          >
            <IconButton size="small" onClick={handlePrevious}>
              <ChevronLeft fontSize="small" />
            </IconButton>
            <Tooltip title={selectedDate.format('DD/MM/YYYY')}>
              <Box>
                <Typography fontWeight="bold" fontSize={14}>
                  {selectedDate.format('ddd, MMM DD')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDate.isSame(dayjs(), 'day') ? 'Today' : ''}
                </Typography>
              </Box>
            </Tooltip>
            <IconButton size="small" onClick={handleNext}>
              <ChevronRight fontSize="small" />
            </IconButton>
          </Box>

          {/* Revenue */}
          <MetricItem
            title="Gross Revenue"
            value={metrics.gross_revenue}
            change={difference.gross_revenue}
            isNegative={String(difference.gross_revenue).startsWith('-')}
            tooltip={`Yesterday: ${formatCurrency(previous.gross_revenue)}`}
            currencySymbol="$"
          />

          {/* Chart */}
          <Box
            sx={{
              minWidth: 150,
              height: 55,
              paddingTop: 0,
              borderLeft: '1px solid #e0e0e0',
              pl: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ResponsiveContainer width="100%" height={45}>
              <LineChart
                data={bindGraph}
                margin={{ top: 0, right: 5, left: 0, bottom: 0 }}
              >
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fill: theme.palette.text.secondary,
                  }}
                />
           <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
<Tooltip
  contentStyle={{
    padding: '4px 8px',
    fontSize: '10px',
    lineHeight: '1.2',
    borderRadius: 4,
  }}
  wrapperStyle={{ top: -5 }}
/>

<RechartTooltip
  contentStyle={{
    padding: '4px 8px',     // 🔽 Reduce internal spacing
    fontSize: 10,           // 🔽 Smaller text
    lineHeight: 1.2,        // 🔽 Tighter line spacing
    borderRadius: 4,
  }}
  wrapperStyle={{
    zIndex: 1000,
  }}
  cursor={{ stroke: '#ccc', strokeWidth: 1 }}
/>

              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Other Metrics */}
        {[
          {
            title: 'Orders',
            value: metrics.total_orders || '0',
            change: difference.total_orders,
            tooltip: `Yesterday: ${previous.total_orders || '0'}`,
          },
          {
            title: 'Units Sold',
            value: metrics.total_units || '0',
            change: difference.total_units,
            tooltip: `Yesterday: ${previous.total_units || '0'}`,
          },
          {
            title: 'Refunds',
            value: metrics.refund || '0',
            change: difference.refund,
            tooltip: `Yesterday: ${previous.refund || '0'}`,
          },
          {
            title: 'COGS',
            value: metrics.total_cogs,
            change: difference.total_cogs,
            tooltip: `Yesterday: ${formatCurrency(previous.total_cogs)}`,
            currencySymbol: '$',
          },
          {
            title: 'Margin',
            value: metrics.margin?.toFixed(2),
            change: difference.margin?.toFixed(2),
            tooltip: `Yesterday: ${previous.margin?.toFixed(2)}`,
            percentSymbol: '%',
          },
        ].map((item, idx) => (
          <Box key={idx} sx={{ borderLeft: '1px solid #e0e0e0', pl: 1 }}>
            <MetricItem
              title={item.title}
              value={item.value}
              change={item.change}
              isNegative={String(item.change).startsWith('-')}
              tooltip={item.tooltip}
              currencySymbol={item.currencySymbol}
              percentSymbol={item.percentSymbol}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HeliumCard;







































// Uses later

// import React, { useEffect, useState, useRef } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Tooltip,
//   IconButton,
//   useTheme,
// } from '@mui/material';
// import './Helium.css';

// import {
//   ArrowDownward,
//   ArrowUpward,
//   ChevronLeft,
//   ChevronRight,
// } from '@mui/icons-material';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Tooltip as RechartTooltip,
// } from 'recharts';
// import dayjs from 'dayjs';
// import weekOfYear from 'dayjs/plugin/weekOfYear';
// import 'dayjs/locale/en';
// import axios from 'axios';

// dayjs.extend(weekOfYear);
// dayjs.locale('en');

// const MetricItem = ({
//   title,
//   value,
//   change,
//   isNegative,
//   tooltip,
//   currencySymbol,
//   percentSymbol,
// }) => {
//   const absValue = Math.abs(value ?? 0);
//   const absChange = Math.abs(change ?? 0);

//   const displayValue =
//     `${(value ?? 0) < 0 ? '-' : ''}${currencySymbol ?? ''}${absValue}${percentSymbol ?? ''}`;

//   const displayChange =
//     change !== undefined
//       ? `${change < 0 ? '-' : ''}${currencySymbol ?? ''}${absChange}${percentSymbol ?? ''}`
//       : '';

//   return (
//     <Card sx={{ borderRadius: 2, minWidth: 160, height: 60 }}>
//       <CardContent sx={{ py: 0.5 }}>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Typography fontSize={14} color="text.secondary">
//             {title}
//           </Typography>
//         </Box>

//         <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
//           <Tooltip title={tooltip || ''}>
//             <Typography variant="subtitle2" sx={{ fontSize: '20px' }} fontWeight="bold">
//               {displayValue}
//             </Typography>
//           </Tooltip>

//           {change !== undefined && (
//             <Typography
//               fontSize={11}
//               color={isNegative ? 'error.main' : 'success.main'}
//               display="flex"
//               alignItems="center"
//               gap={0.5}
//             >
//               {displayChange}
//               {isNegative ? (
//                 <ArrowDownward fontSize="inherit" />
//               ) : (
//                 <ArrowUpward fontSize="inherit" />
//               )}
//             </Typography>
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };
// const TestCard = () => {
//   const theme = useTheme();
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [metrics, setMetrics] = useState({});
//   const [previous, setPrevious] = useState({});
//   const [difference, setDifference] = useState({});
//   const [bindGraph, setBindGraph] = useState([]);
//   const [tooltipData, setTooltipData] = useState(null); // tooltip state
//   const [hoverIndex, setHoverIndex] = useState(null);

//   const userData = JSON.parse(localStorage.getItem('user') || '{}');
//   const userId = userData?.id || '';
//   const graphContainerRef = useRef(null);
//   const svgRef = useRef(null);
//   const [svgOffset, setSvgOffset] = useState({ left: 0, top: 0 });
  
//   useEffect(() => {
//     if (svgRef.current) {
//       const rect = svgRef.current.getBoundingClientRect();
//       setSvgOffset({ left: rect.left, top: rect.top });
//     }
//   }, []);

//   const fetchMetrics = async (date) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
//         {
//           params: {
//             target_date: date.format('DD/MM/YYYY'),
//             user_id: userId,
//           },
//         }
//       );
//       const data = response.data.data;
//       setMetrics(data.targeted || {});
//       setPrevious(data.previous || {});
//       setDifference(data.difference || {});
//       const transformedGraphData = Object.entries(data.graph_data || {}).map(
//         ([date, values]) => ({
//           date: date.charAt(0).toUpperCase() + date.slice(1),
//           revenue: values.gross_revenue,
//         })
//       );
//       setBindGraph(transformedGraphData);
//     } catch (error) {
//       console.error('Error fetching metrics:', error);
//     }
//   };

 

//   useEffect(() => {
//     fetchMetrics(selectedDate);
//   }, [selectedDate]);

//   const handlePrevious = () => setSelectedDate((prev) => prev.subtract(1, 'day'));
//   const handleNext = () => setSelectedDate((prev) => prev.add(1, 'day'));

//   const formatCurrency = (value) =>
//     new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//     }).format(value ?? 0);

//   const getGraphPoints = () => {
//     const maxRevenue = Math.max(...bindGraph.map(d => d.revenue), 1);
//     return bindGraph.map((item, index) => {
//       const x = (index / (bindGraph.length - 1)) * 280 + 10;
//       const y = 50 - (item.revenue / maxRevenue) * 30;
//       return `${x},${y}`;
//     }).join(' ');
//   };

//   const getCirclePoints = () => {
//     const maxRevenue = Math.max(...bindGraph.map(d => d.revenue), 1);
//     return bindGraph.map((item, index) => {
//       const x = (index / (bindGraph.length - 1)) * 280 + 10;
//       const y = 50 - (item.revenue / maxRevenue) * 30;
//       return { ...item, cx: x, cy: y };
//     });
//   };

//   return (
//     <Box
//       sx={{
//         border: '1px solid #e0e0e0',
//         borderRadius: 2,
//         backgroundColor: '#fff',
//         height: '80px',
//         width: '99%',
//         boxShadow: 'none',
//         py: 0.5,
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           gap: 1,
//           overflowX: 'auto',
//           pr: 1,
//           width: '90%',
//           '&::-webkit-scrollbar': {
//             height: 2,
//           },
//           '&::-webkit-scrollbar-thumb': {
//             backgroundColor: '#c1c1c1',
//             borderRadius: 10,
//           },
//         }}
//       >
//         {/* Date & Revenue */}
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Box display="flex" width={200} alignItems="center" gap={1} p={1} sx={{ borderRight: '1px solid #e0e0e0' }}>
//             <IconButton size="small" onClick={handlePrevious}>
//               <ChevronLeft fontSize="small" />
//             </IconButton>
//             <Tooltip title={selectedDate.format('DD/MM/YYYY')}>
//               <Box>
//                 <Typography fontWeight="bold" fontSize={14}>
//                   {selectedDate.format('ddd, MMM DD')}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {selectedDate.isSame(dayjs(), 'day') ? 'Today' : ''}
//                 </Typography>
//               </Box>
//             </Tooltip>
//             <IconButton size="small" onClick={handleNext}>
//               <ChevronRight fontSize="small" />
//             </IconButton>
//           </Box>

//           <MetricItem
//             title="Gross Revenue"
//             value={metrics.gross_revenue}
//             change={difference.gross_revenue}
//             isNegative={String(difference.gross_revenue).startsWith('-')}
//             tooltip={`Yesterday: ${formatCurrency(previous.gross_revenue)}`}
//             currencySymbol="$"
//           />

// {/* Chart */}
// <Box
//   ref={graphContainerRef}
//   sx={{
//     minWidth: 150,
//     pl: 1,
//     display: 'flex',
//     alignItems: 'center',
//     position: 'relative',
//     overflow: 'visible',
//   }}
//   onMouseLeave={() => setTooltipData(null)} // 👈 Hide only when leaving full graph area
// >
//   {/* Graph Container */}
//   <Box
//     sx={{
//       width: 200,
//       height: 60,
//       position: 'relative',
//       overflow: 'visible',
//     }}
//   >
//     <svg ref={svgRef} width="100%" height="60">
//       {/* Grid Lines */}
//       {[10, 20, 30, 40].map((y, idx) => (
//         <line
//           key={idx}
//           x1="0"
//           y1={y}
//           x2="100%"
//           y2={y}
//           stroke="#eee"
//           strokeWidth="1"
//         />
//       ))}

//       {/* Base Line */}
//       <line x1="0" y1="48" x2="100%" y2="48" stroke="#999" strokeWidth="1" />

//       {/* Graph Line */}
//       <polyline
//         points={getGraphPoints()}
//         style={{
//           fill: 'none',
//           stroke: theme.palette.primary.main,
//           strokeWidth: 2,
//         }}
//       />

//       {/* Hover Zones */}
//       {getCirclePoints().map((point, index) => (
//         <circle
//           key={index}
//           cx={point.cx}
//           cy={point.cy}
//           r="10"
//           fill="transparent"
//           stroke="none"
//           style={{ pointerEvents: 'all' }}
//           onMouseEnter={() => setTooltipData(point)} // 👈 Update tooltip data without hiding it
//         />
//       ))}

//       {/* Dot on hover */}
//       {tooltipData && (
//         <>
//           <circle
//             cx={tooltipData.cx}
//             cy={tooltipData.cy}
//             r="6"
//             fill="white"
//             stroke={theme.palette.primary.main}
//             strokeWidth="2"
//             style={{ pointerEvents: 'none' }}
//           />
//           <circle
//             cx={tooltipData.cx}
//             cy={tooltipData.cy}
//             r="3"
//             fill={theme.palette.primary.main}
//             style={{ pointerEvents: 'none' }}
//           />
//         </>
//       )}
//     </svg>

//     {/* Date Labels */}
//     <Box
//       sx={{
//         position: 'absolute',
//         top: 52,
//         left: 0,
//         right: 0,
//         display: 'flex',
//         justifyContent: 'space-between',
//         fontSize: 11,
//         color: '#555',
//         px: 1,
//       }}
//     >
//       <span>{bindGraph[0]?.date}</span>
//       <span>{bindGraph[bindGraph.length - 1]?.date}</span>
//     </Box>
//   </Box>

//   {/* Floating Tooltip */}
//   {tooltipData && (
//     <Box
//       sx={{
//         position: 'fixed',
//         left: svgOffset.left + tooltipData.cx - 80,
//         top: svgOffset.top + tooltipData.cy - 90,
//         backgroundColor: 'white',
//         border: '1px solid #d0d7de',
//         borderRadius: 2,
//         padding: '8px 12px',
//         fontSize: 12,
//         pointerEvents: 'none',
//         zIndex: 1000,
//         boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
//         whiteSpace: 'nowrap',
//       }}
//     >
//       <Typography fontWeight="bold" fontSize={12} color="#333">
//         {dayjs(tooltipData.date).format('MMM DD, YYYY')}
//       </Typography>
//       <Typography fontSize={16} color="#000" fontWeight="bold">
//         {formatCurrency(tooltipData.revenue)}
//       </Typography>
//     </Box>
//   )}
// </Box>








//         </Box>

//        {/* Other Metrics */}
//        {[
//           {
//             title: 'Orders',
//             value: metrics.total_orders || '0',
//             change: difference.total_orders,
//             tooltip: `Yesterday: ${previous.total_orders || '0'}`,
//           },
//           {
//             title: 'Units Sold',
//             value: metrics.total_units || '0',
//             change: difference.total_units,
//             tooltip: `Yesterday: ${previous.total_units || '0'}`,
//           },
//           {
//             title: 'Refunds',
//             value: metrics.refund || '0',
//             change: difference.refund,
//             tooltip: `Yesterday: ${previous.refund || '0'}`,
//           },
//           {
//             title: 'COGS',
//             value: metrics.total_cogs,
//             change: difference.total_cogs,
//             tooltip: `Yesterday: ${formatCurrency(previous.total_cogs)}`,
//             currencySymbol: '$',
//           },
//           {
//             title: 'Margin',
//             value: metrics.margin?.toFixed(2),
//             change: difference.margin?.toFixed(2),
//             tooltip: `Yesterday: ${previous.margin?.toFixed(2)}`,
//             percentSymbol: '%',
//           },
//         ].map((item, idx) => (
//           <Box key={idx} sx={{ borderLeft: '1px solid #e0e0e0', pl: 1 }}>
//             <MetricItem
//               title={item.title}
//               value={item.value}
//               change={item.change}
//               isNegative={String(item.change).startsWith('-')}
//               tooltip={item.tooltip}
//               currencySymbol={item.currencySymbol}
//               percentSymbol={item.percentSymbol}
//             />
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// };

// export default TestCard;