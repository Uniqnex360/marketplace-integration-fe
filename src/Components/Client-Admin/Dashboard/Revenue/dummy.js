import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import CheckIcon from '@mui/icons-material/Check';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  ArrowDownward,
  ArrowUpward,
  Settings as SettingsIcon // Use Settings directly
} from '@mui/icons-material';

import { parse, format, isValid } from 'date-fns';
import {
  Box, Select, MenuItem, Switch, IconButton, Typography, Grid, Card, Checkbox, Button, Dialog, DialogContent
} from '@mui/material';
import dayjs from "dayjs";
import axios from "axios";
import RevenueChooseMetrics from "./RevenueChooseMetrics";
import DottedCircleLoading from "../../../Loading/DotLoading";
import NoteModel from "../NoteModel";

// --- Constants ---
const METRIC_COLORS = {
  gross_revenue: "#00b894",
  net_profit: "#6629b3",
  profit_margin: "#0984e3",
  orders: "#f14682",
  units_sold: "#000080",
  refund_amount: "#e6770d",
  refund_quantity: "#600101"
};

const INITIAL_METRIC_CONFIG = [
  { id: "gross_revenue", label: "Gross Revenue", value: null, change: null, isNegativeChange: false, color: "#00b894", show: false, isCurrency: true },
  { id: "net_profit", label: "Net Profit", value: null, change: null, isNegativeChange: true, color: "#6629b3", show: false, isCurrency: true },
  { id: "profit_margin", label: "Profit Margin", value: null, change: null, isNegativeChange: true, color: "#0984e3", show: false, isPercentage: true }, // Added isPercentage
  { id: "orders", label: "Orders", value: null, change: null, isNegativeChange: true, color: "#f14682", show: false },
  { id: "units_sold", label: "Units Sold", value: null, change: null, isNegativeChange: true, color: "#000080", show: false },
  { id: "refund_amount", label: "Refund Amount", value: null, change: null, isNegativeChange: false, color: "#e6770d", show: false, isCurrency: true },
  { id: "refund_quantity", label: "Refund Quantity", value: null, change: null, isNegativeChange: false, color: "#600101", show: false },
];

const METRIC_LABELS = INITIAL_METRIC_CONFIG.reduce((acc, metric) => {
  acc[metric.id] = metric.label;
  return acc;
}, {});

const COMPARE_OPTIONS = [
  { key: 'previous_period', label: 'Previous period' },
  { key: 'previous_week', label: 'Previous week' },
  { key: 'previous_month', label: 'Previous month' },
  { key: 'previous_year', label: 'Previous year' },
];

// --- Helper Functions (moved outside for reusability and clarity) ---

const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value) => {
  return `${Number(value || 0).toFixed(2)}%`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString();
};

const safeFormatDateHeader = (dateString) => {
  if (!dateString) return 'N/A';
  const parsedDate = dayjs(dateString);
  return parsedDate.isValid() ? parsedDate.format("MMM D, h:mm A") : 'Invalid Date';
};

const getFormattedValue = (value, metricId) => {
  const metric = INITIAL_METRIC_CONFIG.find(m => m.id === metricId);
  if (!metric) return formatNumber(value); // Default to number if metric config not found

  if (metric.isCurrency) {
    return formatCurrency(value);
  } else if (metric.isPercentage) {
    return formatPercentage(value);
  } else {
    return formatNumber(value);
  }
};

const CompareChart = ({ startDate, endDate, widgetData, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [openNote, setOpenNote] = useState(false);
  const [openChooseMetricsDialog, setOpenChooseMetricsDialog] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState([]);
  const [showComparisonPill, setShowComparisonPill] = useState(false);
  const [comparisonText, setComparisonText] = useState('');
  const [selectedCompareOption, setSelectedCompareOption] = useState('');
  const [compareDropdownDates, setCompareDropdownDates] = useState({});

  const userData = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const userId = userData?.id || '';

  const formatDateRangeDisplay = useCallback((start, end) => {
    if (!start || !end) return '';
    // Assuming 'MMM dd, yyyy' as the input format for parse
    const parsedStart = parse(start, 'MMM dd, yyyy', new Date());
    const parsedEnd = parse(end, 'MMM dd, yyyy', new Date());

    if (!isValid(parsedStart) || !isValid(parsedEnd)) return '';

    return `${format(parsedStart, 'MMM D, yyyy')} - ${format(parsedEnd, 'MMM D, yyyy')}`;
  }, []);

  const fetchRevenue = useCallback(async (compareStart = null, compareEnd = null) => {
    setLoading(true);
    try {
      const payload = {
        preset: widgetData,
        marketplace_id: marketPlaceId?.id, // Safely access id
        user_id: userId,
        compare_startdate: compareStart,
        compare_enddate: compareEnd,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        start_date: DateStartDate,
        end_date: DateEndDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_IP}updatedRevenueWidgetAPIView/`,
        payload
      );

      const data = response.data.data;
      setCompareDropdownDates(data.comapre_past);
      setChartData(data.graph);

      const availableMetrics = Object.keys(data.total);
      const updatedMetricConfig = INITIAL_METRIC_CONFIG.map(metric => ({
        ...metric,
        // Set 'show' based on whether the metric is available in the fetched data
        show: availableMetrics.includes(metric.id),
      }));

      // Set initial visible metrics to all available if none are selected yet
      if (visibleMetrics.length === 0) {
        setVisibleMetrics(updatedMetricConfig.filter(m => m.show).map(m => m.id));
      }

      setMetrics(updatedMetricConfig.filter(m => m.show).map(metric => {
        const currentTotal = data.total[metric.id];
        const compareTotal = data.compare_total?.[metric.id];

        return {
          label: METRIC_LABELS[metric.id],
          value: getFormattedValue(currentTotal, metric.id),
          compareValue: compareTotal !== undefined ? getFormattedValue(compareTotal, metric.id) : null,
          color: METRIC_COLORS[metric.id],
          id: metric.id,
          isPercentage: metric.isPercentage,
          isCurrency: metric.isCurrency,
        };
      }));

    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setChartData({});
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }, [widgetData, marketPlaceId, userId, brand_id, product_id, manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate, visibleMetrics.length]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const handleMetricToggle = useCallback((event) => {
    const { name, checked } = event.target;
    setVisibleMetrics(prev =>
      checked ? [...prev, name] : prev.filter(m => m !== name)
    );
  }, []);

  const handleResetMetrics = useCallback(() => {
    setVisibleMetrics(INITIAL_METRIC_CONFIG.filter(m => m.show).map(m => m.id));
  }, []);

  const handleApplyMetrics = useCallback(() => {
    setOpenChooseMetricsDialog(false);
  }, []);

  const handleCompareChange = useCallback(async (event) => {
    const value = event.target.value;
    setSelectedCompareOption(value);

    if (value !== 'custom') {
      const start = compareDropdownDates?.[value]?.start;
      const end = compareDropdownDates?.[value]?.end;

      if (start && end) {
        try {
          const parsedStart = format(parse(start, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');
          const parsedEnd = format(parse(end, 'MMM dd, yyyy', new Date()), 'yyyy-MM-dd');

          await fetchRevenue(parsedStart, parsedEnd);

          let formattedDateForPill;
          if (widgetData === 'Today' || widgetData === 'Yesterday') {
            formattedDateForPill = dayjs(start).format('MMM D, yyyy');
          } else {
            formattedDateForPill = formatDateRangeDisplay(start, end);
          }
          setComparisonText(` ${formattedDateForPill}`);
          setShowComparisonPill(true);
        } catch (error) {
          console.error("Error processing comparison value:", error);
          setShowComparisonPill(false);
          setComparisonText('');
        }
      } else {
        setShowComparisonPill(false);
        setComparisonText('');
      }
    } else {
      // Handle custom date range selection logic here if needed
      setComparisonText('— Custom date range'); // This might need a separate dialog for actual custom date selection
      setShowComparisonPill(true);
    }
  }, [compareDropdownDates, fetchRevenue, formatDateRangeDisplay, widgetData]);


  const handleCloseComparisonPill = useCallback(() => {
    setSelectedCompareOption('');
    setShowComparisonPill(false);
    setComparisonText('');
    fetchRevenue(null, null); // Refetch without comparison dates
  }, [fetchRevenue]);

  const formattedChartData = useMemo(() => {
    if (!chartData || Object.keys(chartData).length === 0) {
      return [];
    }

    // Convert the object of objects into an array of objects
    return Object.values(chartData).map((item) => ({
      time: dayjs(item.current_date).format("h A"),
      date: item.current_date, // Renamed for clarity in tooltip
      compareDate: item.compare_date, // Renamed for clarity in tooltip
      gross_revenue: item.gross_revenue,
      compare_gross_revenue: item.compare_gross_revenue,
      net_profit: item.net_profit,
      compare_net_profit: item.compare_net_profit,
      profit_margin: item.profit_margin,
      compare_profit_margin: item.compare_profit_margin,
      orders: item.orders,
      compare_orders: item.compare_orders,
      units_sold: item.units_sold,
      compare_units_sold: item.compare_units_sold,
      refund_amount: item.refund_amount,
      compare_refund_amount: item.compare_refund_amount || 0,
      refund_quantity: item.refund_quantity,
      compare_refund_quantity: item.compare_refund_quantity || 0,
    }));
  }, [chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const currentDataPoint = payload[0]?.payload;
    const currentItemDate = currentDataPoint?.date;
    const compareDateForHeader = currentDataPoint?.compareDate;
    const isCompareGraphActive = !!compareDateForHeader;

    const currentData = {};
    const compareData = {};

    payload.forEach(item => {
      const isCompare = item.dataKey.startsWith("compare_"); // Correctly check for "compare_" prefix
      const key = isCompare ? item.dataKey.replace("compare_", "") : item.dataKey;
      const formattedKey = METRIC_LABELS[key]; // Use the predefined labels

      if (isCompare) {
        compareData[formattedKey] = item;
      } else {
        currentData[formattedKey] = item;
      }
    });

    const orderedKeys = [
      "Gross Revenue", "Profit Margin", "Net Profit",
      "Orders", "Units Sold", "Refund Amount", "Refund Quantity",
    ];

    return (
      <div
        className="custom-tooltip bg-white p-3 border rounded shadow text-sm min-w-[320px]"
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
            justifyContent: 'flex-end',
            fontWeight: 'bold',
            marginBottom: '8px',
            paddingBottom: '4px',
            borderBottom: '1px solid #eee',
            gap: '20px',
          }}
        >
          <span style={{ width: '130px' }}></span>
          <span style={{ color: '#485E75', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', textAlign: 'right', minWidth: '100px' }}>
            {safeFormatDateHeader(currentItemDate)}
          </span>
          {isCompareGraphActive && (
            <span style={{ color: '#485E75', fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', textAlign: 'right', minWidth: '100px' }}>
              {safeFormatDateHeader(compareDateForHeader)}
            </span>
          )}
        </div>

        {orderedKeys.map((key, index) => {
          const currentItem = currentData[key];
          const compareItem = compareData[key];
          const metricId = INITIAL_METRIC_CONFIG.find(m => m.label === key)?.id;

          if (!metricId || !visibleMetrics.includes(metricId)) {
            return null; // Don't render if metric is not visible
          }

          const currentValue = currentItem?.value;
          const compareValue = compareItem?.value;
          const color = currentItem?.color || '#000';

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
                <span
                  style={{
                    color: '#485E75',
                    fontFamily: "'Nunito Sans', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  {key}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'flex-end',
                  flexGrow: 1,
                }}
              >
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span
                    style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#333',
                    }}
                  >
                    {getFormattedValue(currentValue, metricId)}
                  </span>
                </div>

                {isCompareGraphActive && (
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <span
                      style={{
                        color: '#888',
                        fontSize: '14px',
                      }}
                    >
                      {getFormattedValue(compareValue, metricId)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && formattedChartData.length === 0) { // Only show loading spinner if no data is present yet
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, width: '100%' }}>
        <DottedCircleLoading />
      </Box>
    );
  }

  if (formattedChartData.length === 0 && !loading) {
    return <div className="text-center py-4">No data available for the selected period.</div>;
  }

  return (
    <Box sx={{ p: 2 }}>
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
            "&::-webkit-scrollbar": { height: "2px", width: "2px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#888", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
            "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1", borderRadius: "10px" },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            {metrics.map((metric) => {
              const isSelected = visibleMetrics.includes(metric.id);
              const cleanCompareValue = parseFloat(
                String(metric.compareValue).replace(/[$,%]/g, '').replace(/,/g, '')
              );
              const cleanCurrentValue = parseFloat(
                String(metric.value).replace(/[$,%]/g, '').replace(/,/g, '')
              );

              // Calculate change only if both values are valid numbers and compareValue is not zero
              const change = (cleanCurrentValue !== undefined && cleanCompareValue !== undefined && cleanCompareValue !== 0)
                ? ((cleanCurrentValue - cleanCompareValue) / cleanCompareValue) * 100
                : 0;
              const isPositive = change > 0;
              const isNegative = change < 0;

              return (
                <Card
                  key={metric.id}
                  onClick={() => handleMetricToggle({ target: { name: metric.id, checked: !isSelected } })}
                  sx={{
                    width: '300px',
                    ml: '-28px',
                    p: 1.2,
                    borderRadius: '10px',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    transition: '0.2s ease-in-out',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={handleMetricToggle}
                      name={metric.id}
                      sx={{
                        p: 0.3,
                        '& svg': { fontSize: 16 },
                      }}
                      icon={
                        <span
                          style={{
                            width: 14, height: 14, display: 'block', borderRadius: 4,
                            border: `2px solid ${metric.color}`,
                          }}
                        />
                      }
                      checkedIcon={
                        <span
                          style={{
                            width: 14, height: 14, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', borderRadius: 4, backgroundColor: metric.color,
                            border: `2px solid ${metric.color}`, color: '#fff', fontSize: 12, fontWeight: 'bold',
                          }}
                        >
                          {isSelected && <CheckIcon sx={{ fontSize: 14 }} />}
                        </span>
                      }
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: '14px',
                        ml: 1,
                        color: '#485E75',
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {metric.label}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', ml: 3.5, mt: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#13191',
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    >
                      {metric.value}
                    </Typography>

                    {showComparisonPill && metric.compareValue !== null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isPositive ? 'green' : isNegative ? '#e14d2a' : 'gray',
                            display: 'flex',
                            alignItems: 'center',
                            fontFamily: "'Nunito Sans', sans-serif",
                          }}
                        >
                          {Math.abs(change).toFixed(2)}%
                          {isPositive && <ArrowUpward sx={{ color: 'green', fontSize: 16, ml: 0.3 }} />}
                          {isNegative && <ArrowDownward sx={{ color: '#e14d2a', fontSize: 16, ml: 0.3 }} />}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              );
            })}
            <Box
              onClick={() => setOpenChooseMetricsDialog(true)}
              sx={{
                marginTop: '-1px', borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center',
                gap: 1, cursor: 'pointer', p: 1, height: '65px', fontSize: 14, fontWeight: 600, color: '#485E75'
              }}
            >
              <SettingsIcon sx={{ fontSize: 18 }} />
              Choose Metrics
            </Box>

            <Dialog open={openChooseMetricsDialog} onClose={() => setOpenChooseMetricsDialog(false)} maxWidth='600'>
              <DialogContent dividers>
                <RevenueChooseMetrics
                  selectedMetrics={visibleMetrics}
                  onChange={handleMetricToggle}
                  onReset={handleResetMetrics}
                  onClose={() => setOpenChooseMetricsDialog(false)}
                  onApply={handleApplyMetrics}
                />
              </DialogContent>
            </Dialog>
          </Box>
        </Grid>
        {visibleMetrics.length > 0 && (
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', marginBottom: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Box sx={{ minWidth: 160 }}>
                  <Select
                    fullWidth
                    value={selectedCompareOption}
                    onChange={handleCompareChange}
                    displayEmpty
                    sx={{
                      border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 500, height: 40,
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return 'Compare to past';
                      }
                      const selectedOption = COMPARE_OPTIONS.find(opt => opt.key === selected);
                      return selectedOption ? selectedOption.label : 'Custom';
                    }}
                  >
                    {COMPARE_OPTIONS.map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 500 }}>{option.label}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#64748b' }}>
                            {(widgetData === 'Today' || widgetData === 'Yesterday')
                              ? dayjs(compareDropdownDates?.[option.key]?.start).format('MMM D, yyyy')
                              : formatDateRangeDisplay(
                                compareDropdownDates?.[option.key]?.start,
                                compareDropdownDates?.[option.key]?.end
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
                {showComparisonPill && (
                  <Box
                    sx={{
                      display: 'flex', alignItems: 'center', backgroundColor: '#e0f2f7',
                      borderRadius: '20px', padding: '8px 12px', fontWeight: 500,
                      color: '#1e88e5', mt: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 16, color: 'rgb(43, 57, 72)' }}>
                      {`Comparing to ${COMPARE_OPTIONS.find(opt => opt.key === selectedCompareOption)?.label || 'Custom period'}`}
                    </Typography>
                    <IconButton size="small" onClick={handleCloseComparisonPill} sx={{ ml: 1 }}>
                      <CloseIcon sx={{ fontSize: 16, color: '#757575' }} />
                    </IconButton>
                  </Box>
                )}
                {selectedCompareOption && ( // Only show date range if a comparison option is selected
                  <Box sx={{ mt: 1, ml: 1 }}>
                    <Typography sx={{ fontSize: '16px', color: '#485E75' }}>
                      {DateStartDate && DateEndDate ? `${formatDateRangeDisplay(DateStartDate, DateEndDate)} \u00A0 ... \u00A0 ${comparisonText}` : comparisonText}
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
                    onClick={() => setOpenNote(true)}
                    sx={{ fontSize: '14px', textTransform: 'none' }}
                  >
                    + Add Note
                  </Button>
                )}
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={formattedChartData}> {/* Use formattedChartData here */}
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {visibleMetrics.map(metricId => {
                  const metricConfig = INITIAL_METRIC_CONFIG.find(m => m.id === metricId);
                  if (!metricConfig) return null;

                  return (
                    <React.Fragment key={metricId}>
                      {/* Current Period Line */}
                      <Line
                        type="monotone"
                        dataKey={metricId} // Use the correct snake_case dataKey
                        stroke={metricConfig.color}
                        name={metricConfig.label}
                        dot={false} // Optional: remove dots for cleaner lines
                      />
                      {/* Comparison Period Line (if comparison is active) */}
                      {showComparisonPill && (
                        <Line
                          type="monotone"
                          dataKey={`compare_${metricId}`} // Use the correct snake_case dataKey for comparison
                          stroke={metricConfig.color}
                          strokeDasharray="5 5" // Dotted line for comparison
                          name={`Compare ${metricConfig.label}`}
                          dot={false} // Optional: remove dots for cleaner lines
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        )}
      </Grid>
      <NoteModel open={openNote} handleClose={() => setOpenNote(false)} />
    </Box>
  );
};

export default CompareChart;