import React, { useState, useEffect,  } from "react";
import {
    Box,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    Dialog,
    DialogContent,
    Checkbox,useTheme,
    FormControlLabel, Paper, Switch, Button,IconButton
} from "@mui/material";
import { Close as CloseIcon } from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import dayjs from 'dayjs';

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SettingsIcon from "@mui/icons-material/Settings";
import RevenueChooseMetrics from "./RevenueChooseMetrics";
import axios from "axios"; // Assuming you are using axios for API calls
import CheckIcon from '@mui/icons-material/Check';

import { parse,format, parseISO, isValid } from 'date-fns';
import NoteModel from "../NoteModel";
const initialMetricConfig = [
    { id: "gross_revenue", label: "Gross Revenue", value: null, change: null, isNegativeChange: false, color: "#00b894", show: true, isCurrency: true },
    { id: "net_profit", label: "Net Profit", value: null, change: null, isNegativeChange: true, color: "#6629b3", show: true, isCurrency: true },
    { id: "profit_margin", label: "Profit Margin", value: null, change: null, isNegativeChange: true, color: "#0984e3", show: true },
    { id: "orders", label: "Orders", value: null, change: null, isNegativeChange: true, color: "#f14682", show: true },
    { id: "units_sold", label: "Units Sold", value: null, change: null, isNegativeChange: true, color: "#000080", show: true },
    { id: "refund_amount", label: "Refund Amount", value: null, change: null, isNegativeChange: false, color: "#e6770d", show: true, isCurrency: true },
    { id: "refund_quantity", label: "Refund Quantity", value: null, change: null, isNegativeChange: false, color: "#600101", show: true },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // You can change this to your desired currency
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const TestRevenue = ({ widgetData }) => {
    const [metricDataConfig, setMetricDataConfig] = useState(initialMetricConfig);
    const [selectedMetrics, setSelectedMetrics] = useState(
        initialMetricConfig.filter((metric) => metric.show).map((metric) => metric.id)
    );
    const [comparePeriod, setComparePeriod] = useState("previous");
    const [isChooseMetricsOpen, setIsChooseMetricsOpen] = useState(false);
    const [visibleMetricsInCards, setVisibleMetricsInCards] = useState(selectedMetrics);
    const [open, setOpen] = useState(false);
    const [visibleMetrics, setVisibleMetrics] = useState(selectedMetrics);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(() => {
        const saved = localStorage.getItem("selectedStartDate");
        return saved ? new Date(saved) : null;
    });
  const [openNote, setOpenNote] = useState(false);
const [events, setEvents] = useState(true);
    const [selectedEndDate, setSelectedEndDate] = useState(() => {
        const saved = localStorage.getItem("selectedEndDate");
        return saved ? new Date(saved) : null;
    });


      const [compareGraphData, setCompareGraphData] = useState([]);
    const [selectedValue, setSelectedValue] = useState('');
    const options = [
        { key: 'previous_period', label: 'Previous period' },
        { key: 'previous_week', label: 'Previous week' },
        { key: 'previous_month', label: 'Previous month' },
        { key: 'previous_year', label: 'Previous year' },
    ];

    useEffect(() => {
        fetchRevenue();
    }, [widgetData, selectedStartDate,selectedEndDate,]);

    const formatDate = (date) => {
        return date ? dayjs(date).format('MMM D, YYYY') : '';
    };



    const formatTimestamp = (timestamp) => {
      const tsDate = new Date(timestamp);
      if (widgetData === 'Today' || widgetData === 'Yesterday') {
          return tsDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      } else {
          return tsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
  };

  const fetchRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData?.id || '';
        const response = await axios.get(
            `${process.env.REACT_APP_IP}RevenueWidgetAPIView/`,
            {
                params: {
                    preset: widgetData,
                    user_id: userId,
                    compare_startdate: selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : null,
                    compare_enddate: selectedEndDate ? format(selectedEndDate, 'yyyy-MM-dd') : null,
                },
            }
        );

        const apiData = response.data.data;
        setCompareDropDown(apiData.comapre_past);

        if (apiData && apiData.total) {
            const updatedMetricData = metricDataConfig.map((metric) => {
                if (apiData.total.hasOwnProperty(metric.id)) {
                    return {
                        ...metric,
                        value: apiData.total[metric.id],
                        change: apiData.compare_total ? apiData.compare_total[metric.id] : null,
                        isNegativeChange: apiData.compare_total ? (apiData.compare_total[metric.id] < 0) : false,
                    };
                }
                return { ...metric, value: null, change: null };
            });
            setMetricDataConfig(updatedMetricData);

            const initialVisibleMetrics = updatedMetricData
                .filter(metric => metric.show && metric.value !== null)
                .map(metric => metric.id);
            setVisibleMetricsInCards(initialVisibleMetrics);
            setVisibleMetrics(initialVisibleMetrics);
            setSelectedMetrics(Object.fromEntries(initialVisibleMetrics.map(id => [id, true])));
        }

        const processGraphData = (graph) => {
            const formattedData = [];
            for (const timestamp in graph) {
                const formattedTime = formatTimestamp(timestamp);
                formattedData.push({ time: formattedTime, ...graph[timestamp] });
            }
            return formattedData.sort((a, b) => new Date(a.time) - new Date(b.time));
        };

        const processCompareGraphData = (compareGraph, graph) => {
            if (!compareGraph || Object.keys(compareGraph).length === 0 || !graph || Object.keys(graph).length === 0) {
                return [];
            }

            const graphTimestamps = Object.keys(graph).sort();
            const compareTimestamps = Object.keys(compareGraph).sort();

            const formattedCompareData = graphTimestamps.map((graphTimestamp) => {
                const formattedTime = formatTimestamp(graphTimestamp);
                const matchingCompareTimestampIndex = compareTimestamps.findIndex(compareTimestamp => {
                    const graphDate = new Date(graphTimestamp);
                    const compareDate = new Date(compareTimestamp);
                    return graphDate.getHours() === compareDate.getHours() && graphDate.getMinutes() === compareDate.getMinutes();
                });
                const compareDataForTime = matchingCompareTimestampIndex !== -1 ? compareGraph[compareTimestamps[matchingCompareTimestampIndex]] : {};
                return { time: formattedTime, ...compareDataForTime };
            });
            return formattedCompareData;
        };

        setGraphData(processGraphData(apiData.graph || {}));
        setCompareGraphData(processCompareGraphData(apiData.compare_graph, apiData.graph));

    } catch (error) {
        console.error("Error fetching revenue data:", error);
        setError("Failed to load revenue data.");
    } finally {
        setLoading(false);
    }
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR', // You might need to make this dynamic based on your locale
});
 

 
    const CustomTooltip = ({ active, payload, label, metricLabels, comparePayload, CompareGrpah }) => {
        const theme = useTheme();
      
        if (!active || !payload || payload.length === 0) return null;
        const formatValue = (metricId, value) => {
          if (typeof value === 'number') {
            if (['gross_revenue', 'net_profit', 'refund_amount'].includes(metricId)) {
              return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
            } else if (metricId === 'profit_margin') {
              return `${(value * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
            } else {
              return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
            }
          }
          return value !== null && value !== undefined ? value : 'n/a';
        };
      
        const currentDate = label ? new Date(label) : null;
        const formattedCurrentDate = currentDate && !isNaN(currentDate.getTime()) ? format(currentDate, 'MMM dd, h:mm a') : label;
      
        const compareDateFormatted = CompareGrpah ? format(new Date('May 6, 2025 05:00:00 GMT+0530'), 'MMM dd, h:mm a') : null;
      
        // Create a map of compare data for easy lookup by timestamp
        const compareDataMap = {};
        if (CompareGrpah && comparePayload) {
          comparePayload.forEach(item => {
            compareDataMap[item.time] = item;
          });
        }
      
        return (
          <Box sx={{ backgroundColor: '#fff', border: '1px solid #ccc', p: 1.5, width: 300 }}>
            {/* Dates Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{formattedCurrentDate}</Typography>
              {CompareGrpah && (
                <Typography sx={{ fontWeight: 600, fontSize: 12, flex: 1, textAlign: 'right' }}>{compareDateFormatted}</Typography>
              )}
            </Box>
      
            {/* Metrics Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: CompareGrpah ? '1fr 1fr 1fr' : '1fr 1fr', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 500, color: '#485E75', fontSize: 12, textAlign: 'left' }}> </Typography>
              {/* <Typography sx={{ fontWeight: 500, color: '#485E75', fontSize: 12, textAlign: 'center' }}>Current</Typography> */}
              {CompareGrpah && (
                <Typography sx={{ fontWeight: 500, color: '#485E75', fontSize: 12, textAlign: 'right' }}>Compare</Typography>
              )}
            </Box>
      
            {/* Metrics */}
            {payload.map((entry, index) => {
              const metricId = entry.dataKey.replace(/_previous$/, '');
              const labelText = metricLabels?.[metricId] || metricId;
              const color = entry.stroke || entry.color || '#000';
              const currentValue = entry.value;
              const compareValue = CompareGrpah && compareDataMap[label] ? compareDataMap[label][metricId] : null;
      
              if (entry.dataKey.endsWith('_previous')) {
                return null;
              }
      
              return (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: CompareGrpah ? '1fr 1fr 1fr' : '1fr 1fr', alignItems: 'center', mb: 0.75 }}>
                  {/* Dot + Metric Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, mr: 1 }} />
                    <Typography sx={{ color: '#485E75', fontSize: 13 }}>{labelText}</Typography>
                  </Box>
      
                  {/* Current Value */}
                  <Typography sx={{ fontWeight: 500, fontSize: 13, textAlign: 'center' }}>
                    {formatValue(metricId, currentValue)}
                  </Typography>
      
                  {/* Compare Value */}
                  {CompareGrpah && (
                    <Typography sx={{ textAlign: 'right', color: '#888', fontSize: 13 }}>
                      {compareValue !== null && compareValue !== undefined
                        ? formatValue(metricId, compareValue)
                        : 'n/a'}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        );
      };
   
  
       const handleMetricToggle = (metricId) => {
        const updatedMetricsConfig = metricDataConfig.map(metric =>
            metric.id === metricId ? { ...metric, show: !metric.show } : metric
        );
        setMetricDataConfig(updatedMetricsConfig);
        setVisibleMetrics(updatedMetricsConfig.filter(m => m.show).map(m => m.id));
    };

    const handleReset = () => {
        const resetMetricsConfig = metricDataConfig.map(metric => ({ ...metric, show: initialMetricConfig.find(init => init.id === metric.id)?.show || false }));
        setMetricDataConfig(resetMetricsConfig);
        setVisibleMetrics(resetMetricsConfig.filter(m => m.show).map(m => m.id));
    };

    const handleApply = () => {
        const currentVisible = metricDataConfig.filter(m => m.show).map(m => m.id);
        setVisibleMetricsInCards(currentVisible);
        setSelectedMetrics(currentVisible);
        handleClose();
  
    };

    const handleOpen = () => {
        setVisibleMetrics(metricDataConfig.filter(m => m.show).map(m => m.id));
        setOpen(true);
    };

    const handleClose = () => {
        fetchRevenue()
        setOpen(false);
    };

    const handleCompareChange = (event) => {
        setComparePeriod(event.target.value);
        // You might want to trigger data refetch here based on the compare period
    };

    const visibleMetricsDataForCards = metricDataConfig.filter(
        (metric) => visibleMetricsInCards.includes(metric.id) && metric.value !== null
    );

    const visibleMetricsDataForChart = metricDataConfig.filter((metric) => metric.show);


    const [metricLabels] = useState(() =>
        initialMetricConfig.reduce((acc, metric) => {
            acc[metric.id] = metric.label;
            return acc;
        }, {})
    );

const [compareDropDown, setCompareDropDown] = useState('Compare to past');
const [showComparisonPill, setShowComparisonPill] = useState(false);
const [comparisonText, setComparisonText] = useState('');

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
            setComparisonText(`— ${formattedDate}`);
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



// const handleChange = async (event) => {
//     const value = event.target.value;
//     setSelectedValue(value);

//     if (value !== 'custom') {
//         const start = compareDropDown?.[value]?.start;
//         const end = compareDropDown?.[value]?.end;

//         if (start && end) {
//             // Convert "Apr 28, 2025" -> 2025-04-28 format
//             const parsedStart = format(parse(start, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
//             const parsedEnd = format(parse(end, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');

//             setSelectedStartDate(parsedStart);
//             setSelectedEndDate(parsedEnd);

//             // API CALL AUTOMATIC
//             await fetchRevenue(parsedStart, parsedEnd);
//         }
//     }
// };

const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
};


    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        handleMetricToggle(name);
        setSelectedMetrics({
            ...selectedMetrics,
            [event.target.name]: event.target.checked,
        });
    };


    const isMetricSelected = (metricId) => {
        return metricDataConfig.find(metric => metric.id === metricId)?.show || false;
    };

    if (loading) {
        return <Typography>Loading revenue data...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box p={2}>
            {/* Header Row */}


            {/* Side-by-Side Layout */}
            <Grid container spacing={2}>
                {/* Left: Cards */}
                <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{
                        maxHeight: 470,
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
                    <Box sx={{ display: 'flex',minHeight:'450px', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {visibleMetricsDataForCards.map((metric) => (
                <Card
                    key={metric.id}
                    sx={{
                        width: '100%',
                        mb: 1,
                        p: 1,
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isMetricSelected(metric.id)}
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
                            }
                            label={
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontSize: '16px',
                                        ml: 1,
                                        color: '#485E75',
                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                                    }}
                                >
                                    {metric.label}
                                </Typography>
                            }
                            sx={{ margin: 0, flexGrow: 1 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', ml: 3.5, mt: 1 }}>
                        <Typography variant="h6" style={{ fontWeight: 600, color: '#1a2027', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif", fontSize: '24px' }}>
                            {metric.value !== null ? (
                                metric.isCurrency ? currencyFormatter.format(metric.value) : (typeof metric.value === 'number' ? metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : metric.value)
                            ) : (
                                "—"
                            )}
                        </Typography>
                        {metric.change !== null && (
                            <Typography variant="caption" style={{ paddingLeft: '5px', fontSize: '12px', display: 'flex', marginTop: '13px', paddingRight: '3px', alignItems: 'center', justifyContent: 'flex-end', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif", fontSize: '12px' }}>
                                {Math.abs(metric.change).toFixed(2)}%
                                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
                                    {metric.id === 'profit_margin' ? (
                                        metric.change < 0 ? <ArrowDownwardIcon fontSize="14px" sx={{ color: 'error.main' }} /> : <ArrowUpwardIcon fontSize="14px" sx={{ color: 'success.main' }} />
                                    ) : (
                                        metric.isNegativeChange ? <ArrowDownwardIcon fontSize="14px" sx={{ color: 'error.main' }} /> : <ArrowUpwardIcon fontSize="14px" sx={{ color: 'success.main' }} />
                                    )}
                                </Box>
                            </Typography>
                        )}
                    </Box>
                </Card>
            ))}
               {/* Settings Toggle */}
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
                        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                            <DialogContent dividers>
                                <RevenueChooseMetrics
                                    metricDataConfig={metricDataConfig}
                                    selectedMetrics={visibleMetrics}
                                    onChange={handleMetricToggle}
                                    onReset={handleReset}
                                    onClose={handleClose}
                                    onApply={handleApply}
                                    widgetData={widgetData}
                                />
                            </DialogContent>
                        </Dialog>

                    </Box>
                </Grid>

                {/* Right: Line Chart */}
                <Grid item xs={12} md={9}>
                      
                <Box sx={{ display: 'flex',marginBottom:'10px', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Box>
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
          <Typography>{`Comparing to ${options.find(opt => opt.key === selectedValue)?.label || 'Custom period'}`}</Typography>
          <Typography sx={{ ml: 1, fontSize: '12px', color: '#64748b' }}>{comparisonText}</Typography>
          <IconButton size="small" onClick={handleClosePill} sx={{ ml: 1 }}>
            <CloseIcon sx={{ fontSize: 16, color: '#757575' }} />
          </IconButton>
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
<ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData}>
                <XAxis
                    padding={{ left: 20, right: 20 }}
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#ccc' }}
                    interval="preserveStartEnd"
                />
                <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const hasCurrencyMetric = visibleMetricsDataForChart.some(m => m.isCurrency);
                        return hasCurrencyMetric ? currencyFormatter.format(value) : value;
                    }}
                />
                <YAxis
                    yAxisId="right-percent"
                    orientation="right"
                    tick={{ fontSize: 12, dx: 10 }}
                    tickFormatter={(val) => `${Math.round(val)}%`}
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

                <Tooltip content={<CustomTooltip metricLabels={metricLabels} CompareGrpah={compareGraphData.length > 0} comparePayload={compareGraphData} />} />
                {visibleMetricsDataForChart.map((metric) => (
                    <React.Fragment key={metric.id}>
                        <Line
                            type="monotone"
                            dataKey={`${metric.id}`}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                            name={`${metric.label} (Current)`}
                            yAxisId={
                                metric.id === 'gross_revenue' || metric.id === 'net_profit' || metric.id === 'refund_amount'
                                    ? 'left'
                                    : metric.id === 'profit_margin'
                                        ? 'right-percent'
                                        : ['refund_quantity', 'units_sold', 'orders'].includes(metric.id)
                                            ? 'right-quantity'
                                            : 'left' // Default to 'left' if no match
                            }
                        />
                        {compareGraphData.length > 0 && (
                            <Line
                                type="monotone"
                                dataKey={metric.id}
                                data={compareGraphData}
                                stroke={metric.color}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name={`${metric.label} (Previous)`}
                                yAxisId={
                                    metric.id === 'gross_revenue' || metric.id === 'net_profit' || metric.id === 'refund_amount'
                                        ? 'left'
                                        : metric.id === 'profit_margin'
                                            ? 'right-percent'
                                            : ['refund_quantity', 'units_sold', 'orders'].includes(metric.id)
                                                ? 'right-quantity'
                                                : 'left' // Default to 'left' if no match
                                }
                            />
                        )}
                    </React.Fragment>
                ))}
            </LineChart>
        </ResponsiveContainer>
                </Grid>
            </Grid>

           
        </Box>
    );
};

export default TestRevenue;