import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  useTheme,
  Dialog,
  DialogContent,
} from "@mui/material";
import "./Helium.css";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  ArrowDownward,
  ArrowUpward,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/en";
import axios from "axios";
import ChooseMetrics from "./ChooseMetrics";
import DottedCircleLoading from "../../../Loading/DotLoading";
import SkeletonLoadingUI from "./SummaryCardLoading";
import { formatCurrency } from "../../../../utils/currencyFormatter";

dayjs.extend(weekOfYear);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("en");

const TIMEZONE = "US/Pacific";

const MetricItem = ({
  title,
  value,
  change,
  isNegative,
  tooltip,
  currencySymbol,
  percentSymbol,
  loading = false,
}) => {
  const absValue = Math.abs(value ?? 0);
  const absChange = Math.abs(change ?? 0);
  
  const displayValue = `${(value ?? 0) < 0 ? "-" : ""}${
    currencySymbol ?? ""
  }${absValue}${percentSymbol ?? ""}`;

  const displayChange =
    change !== undefined
      ? `${change < 0 ? "-" : ""}${currencySymbol ?? ""}${absChange}${
          percentSymbol ?? ""
        }`
      : "";

  return (
    <Card sx={{ borderRadius: 2, minWidth: 200, height: 60, opacity: loading ? 0.6 : 1 }}>
      <CardContent sx={{ py: 0.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontSize={14} color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={0.5}
          sx={{ paddingRight: "4px" }}
        >
          <Tooltip title={tooltip || ""}>
            <Typography
              variant="subtitle2"
              sx={{ fontSize: "20px" }}
              fontWeight="bold"
            >
              {loading ? "..." : displayValue}
            </Typography>
          </Tooltip>

          {change !== undefined && (
            <Typography
              fontSize={11}
              color={isNegative ? "error.main" : "success.main"}
              display="flex"
              alignItems="center"
              gap={0.5}
            >
              {loading ? "..." : displayChange}
              {!loading && (isNegative ? (
                <ArrowDownward fontSize="inherit" />
              ) : (
                <ArrowUpward fontSize="inherit" />
              ))}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const TestCard = ({
  marketPlaceId,
  brand_id,
  widgetData,
  product_id,
  DateStartDate,
  DateEndDate,
  manufacturer_name,
  fulfillment_channel,
}) => {
  const theme = useTheme();
  
  // Combined state for dates and preset
  const [currentDates, setCurrentDates] = useState({
    selectedDate: dayjs().tz(TIMEZONE),
    displayDate: dayjs().tz(TIMEZONE)
  });
  
  const [currentPreset, setCurrentPreset] = useState(widgetData);
  
  // Data state
  const [dataState, setDataState] = useState({
    metrics: {},
    previous: {},
    difference: {},
    bindGraph: [],
  });
  
  const [tooltipData, setTooltipData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const graphContainerRef = useRef(null);
  const svgRef = useRef(null);
  const [svgOffset, setSvgOffset] = useState({ left: 0, top: 0 });
  const [open, setOpen] = useState(false);

  const [visibleMetrics, setVisibleMetrics] = useState([
    "gross_revenue",
    "total_orders",
    "total_units",
    "refund",
    "total_cogs",
    "net_profit",
    "margin",
    "business_value",
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    fetchMetrics(currentDates.selectedDate, currentDates.displayDate);
  };

  const handleMetricToggle = (metric) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleReset = () => setVisibleMetrics([]);
  const handleApply = () => console.log("Applied Metrics:", visibleMetrics);

  useEffect(() => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setSvgOffset({ left: rect.left, top: rect.top });
    }
  }, []);

  // Fetch data when dates change
  useEffect(() => {
    fetchMetrics(currentDates.selectedDate, currentDates.displayDate);
  }, [
    currentDates.selectedDate, 
    currentDates.displayDate,
    currentPreset,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    marketPlaceId?.id,
  ]);

  const fetchMetrics = async (selectedDate, displayDate) => {
    setDataLoading(true);
    try {
      const payload = {
        target_date: selectedDate.format("DD/MM/YYYY"),
        user_id: userId,
        preset: currentPreset,
        marketplace_id: marketPlaceId.id,
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        timezone: TIMEZONE,
      };

      if (DateStartDate && dayjs(DateStartDate).isValid()) {
        payload.start_date = dayjs(DateStartDate).format("DD/MM/YYYY");
      }

      if (DateEndDate && dayjs(DateEndDate).isValid()) {
        payload.end_date = dayjs(DateEndDate).format("DD/MM/YYYY");
      }

      console.log('API Payload:', payload); // Debug log

      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
        payload
      );

      const data = response.data.data;
      
      setDataState({
        metrics: data.targeted || {},
        previous: data.previous || {},
        difference: data.difference || {},
        bindGraph: Object.entries(data.graph_data || {}).map(
          ([rawDate, values]) => ({
            date: dayjs(rawDate.charAt(0).toUpperCase() + rawDate.slice(1))
              .tz(TIMEZONE)
              .format("MMM DD"),
            revenue: values.gross_revenue,
            fullDate: dayjs(rawDate).toDate(),
          })
        ),
      });

      const selectedMetricKeys = Object.keys(data.targeted || {});
      setVisibleMetrics(selectedMetricKeys);

    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const getDisplayDateText = (widgetData, DateStartDate, DateEndDate, displayDate, selectedDate) => {
    const today = dayjs().tz(TIMEZONE);
    if (DateStartDate && DateEndDate) {
      return `${dayjs(DateStartDate).format("MMMM D, YYYY")} - ${dayjs(DateEndDate).format("MMMM D, YYYY")}`;
    }

    switch (widgetData) {
      case "Today":
      case "Yesterday":
        return selectedDate.format("ddd, MMM DD");
      default:
        if (displayDate && selectedDate && !displayDate.isSame(selectedDate, "day")) {
          return `${displayDate.format("MMM DD")} - ${selectedDate.format("MMM DD")}`;
        }
        return selectedDate.format("ddd, MMM DD");
    }
  };

  const getSubtitleText = (widgetData, DateStartDate, DateEndDate, displayDate, selectedDate) => {
    const today = dayjs().tz(TIMEZONE);
    if (DateStartDate && DateEndDate) return "Custom Date Range";
    
    if (widgetData === "Today" || widgetData === "Yesterday") {
      return selectedDate.isSame(today, "day") ? "Today" : (
        <span
          style={{
            color: "#0A6FE8",
            fontWeight: "bold",
            fontFamily: "'Nunito Sans', sans-serif",
            fontSize: 14,
            cursor: "pointer",
            textDecoration: "none",
          }}
          onClick={handleBackToToday}
        >
          Back to Today
        </span>
      );
    }
    return widgetData;
  };

  // Initialize dates based on widget data
  useEffect(() => {
    const today = dayjs().tz(TIMEZONE);
    let newDisplayDate, newSelectedDate;
    
    // Handle custom date range
    if (DateStartDate && DateEndDate) {
      newDisplayDate = dayjs(DateStartDate);
      newSelectedDate = dayjs(DateEndDate);
    } else {
      // Handle preset date ranges
      switch (widgetData) {
        case "Today":
          newDisplayDate = today;
          newSelectedDate = today;
          break;
        case "Yesterday":
          newDisplayDate = today.subtract(1, "day");
          newSelectedDate = today.subtract(1, "day");
          break;
        case "This Week":
          newDisplayDate = today.startOf("week");
          newSelectedDate = today.endOf("week");
          break;
        case "Last Week":
          newDisplayDate = today.subtract(1, "week").startOf("week");
          newSelectedDate = today.subtract(1, "week").endOf("week");
          break;
        case "Last 7 days":
          newDisplayDate = today.subtract(6, "day");
          newSelectedDate = today;
          break;
        case "Last 14 days":
          newDisplayDate = today.subtract(13, "day");
          newSelectedDate = today;
          break;
        case "Last 30 days":
          newDisplayDate = today.subtract(29, "day");
          newSelectedDate = today;
          break;
        case "Last 60 days":
          newDisplayDate = today.subtract(59, "day");
          newSelectedDate = today;
          break;
        case "Last 90 days":
          newDisplayDate = today.subtract(89, "day");
          newSelectedDate = today;
          break;
        case "This Month":
          newDisplayDate = today.startOf("month");
          newSelectedDate = today.endOf("month");
          break;
        case "Last Month":
          newDisplayDate = today.subtract(1, "month").startOf("month");
          newSelectedDate = today.subtract(1, "month").endOf("month");
          break;
        case "This Quarter":
          newDisplayDate = today.startOf("quarter");
          newSelectedDate = today.endOf("quarter");
          break;
        case "Last Quarter":
          newDisplayDate = today.subtract(1, "quarter").startOf("quarter");
          newSelectedDate = today.subtract(1, "quarter").endOf("quarter");
          break;
        case "This Year":
          newDisplayDate = today.startOf("year");
          newSelectedDate = today.endOf("year");
          break;
        case "Last Year":
          newDisplayDate = today.subtract(1, "year").startOf("year");
          newSelectedDate = today.subtract(1, "year").endOf("year");
          break;
        default:
          newDisplayDate = today;
          newSelectedDate = today;
      }
    }

    setCurrentDates({
      displayDate: newDisplayDate,
      selectedDate: newSelectedDate
    });
    
    setCurrentPreset(widgetData);
  }, [widgetData, DateStartDate, DateEndDate]);



  const METRICS_CONFIG = {
    total_orders: {
      title: "Orders",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    total_units: {
      title: "Units Sold",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    refund: {
      title: "Refunds",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev || "0"}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev || "0"}`,
    },
    total_cogs: {
      title: "COGS",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(prev)}`,
      currencySymbol: "$",
    },
    net_profit: {
      title: "Net Profit",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(prev)}`,
      currencySymbol: "$",
    },
    margin: {
      title: "Margin",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${prev?.toFixed(2)}%`
          : `${date.subtract(1, "day").format("MMM DD")}: ${prev?.toFixed(2)}%`,
      percentSymbol: "%",
    },
    business_value: {
      title: "Business Value",
      tooltip: (date, today, prev) =>
        date.isSame(today, "day")
          ? `Yesterday: ${formatCurrency(prev)}`
          : `${date.subtract(1, "day").format("MMM DD")}: ${formatCurrency(prev)}`,
      currencySymbol: "$",
    },
  };

  const today = dayjs().tz(TIMEZONE);

  const handlePrevious = () => {
    const today = dayjs().tz(TIMEZONE);
    
    if (DateStartDate && DateEndDate) {
      const rangeDays = dayjs(DateEndDate).diff(dayjs(DateStartDate), 'day') + 1;
      setCurrentDates(prev => ({
        displayDate: prev.displayDate.subtract(rangeDays, 'day'),
        selectedDate: prev.selectedDate.subtract(rangeDays, 'day')
      }));
    } else {
      const newSelectedDate = currentDates.selectedDate.subtract(1, "day");
      
      // Determine what preset this date represents
      let newPreset = "Custom"; // Default fallback
      
      if (newSelectedDate.isSame(today, "day")) {
        newPreset = "Today";
      } else if (newSelectedDate.isSame(today.subtract(1, "day"), "day")) {
        newPreset = "Yesterday";
      } else {
        // For other dates, we'll use a custom approach - keep original preset but with different target_date
        newPreset = widgetData;
      }
      
      setCurrentDates(prev => ({
        ...prev,
        selectedDate: newSelectedDate
      }));
      
      setCurrentPreset(newPreset);
    }
  };

  const handleNext = () => {
    const today = dayjs().tz(TIMEZONE);
    
    if (DateStartDate && DateEndDate) {
      const rangeDays = dayjs(DateEndDate).diff(dayjs(DateStartDate), 'day') + 1;
      const newEndDate = dayjs(currentDates.selectedDate).add(rangeDays, 'day');
      if (newEndDate.isAfter(today)) return;
      setCurrentDates(prev => ({
        displayDate: prev.displayDate.add(rangeDays, 'day'),
        selectedDate: prev.selectedDate.add(rangeDays, 'day')
      }));
    } else if (!currentDates.selectedDate.isSame(today, "day")) {
      const newSelectedDate = currentDates.selectedDate.add(1, "day");
      
      // Determine what preset this date represents
      let newPreset = "Custom"; // Default fallback
      
      if (newSelectedDate.isSame(today, "day")) {
        newPreset = "Today";
      } else if (newSelectedDate.isSame(today.subtract(1, "day"), "day")) {
        newPreset = "Yesterday";
      } else {
        // For other dates, we'll use a custom approach - keep original preset but with different target_date
        newPreset = widgetData;
      }
      
      setCurrentDates(prev => ({
        ...prev,
        selectedDate: newSelectedDate
      }));
      
      setCurrentPreset(newPreset);
    }
  };

  const handleBackToToday = () => {
    const today = dayjs().tz(TIMEZONE);
    if (DateStartDate && DateEndDate) {
      const rangeDays = dayjs(DateEndDate).diff(dayjs(DateStartDate), 'day') + 1;
      setCurrentDates({
        displayDate: today.subtract(rangeDays - 1, 'day'),
        selectedDate: today
      });
    } else {
      setCurrentDates(prev => ({
        ...prev,
        selectedDate: today
      }));
      setCurrentPreset("Today");
    }
  };

  const getGraphPoints = () => {
    const maxRevenue = Math.max(...dataState.bindGraph.map((d) => d.revenue), 1);
    return dataState.bindGraph
      .map((item, index) => {
        const x = (index / (dataState.bindGraph.length - 1)) * 280 + 10;
        const y = 50 - (item.revenue / maxRevenue) * 30;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const getCirclePoints = () => {
    const maxRevenue = Math.max(...dataState.bindGraph.map((d) => d.revenue), 1);
    return dataState.bindGraph.map((item, index) => ({
      ...item,
      cx: (index / (dataState.bindGraph.length - 1)) * 280 + 10,
      cy: 50 - (item.revenue / maxRevenue) * 30
    }));
  };

  const metricBlockStyle = {
    flex: "0 0 180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #e0e0e0",
    py: 1,
    px: 2,
  };

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        backgroundColor: "#fff",
        width: "99%",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        py: 0.5,
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
          <SkeletonLoadingUI />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", width: "100%", px: 2 }}>
          {/* Date Picker */}
          <Box sx={{ ...metricBlockStyle, borderRight: "1px solid #e0e0e0", borderLeft: "none" }}>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton size="small" onClick={handlePrevious} disabled={dataLoading}>
                <ChevronLeft fontSize="small" />
              </IconButton>

              <Tooltip title={`${currentDates.displayDate.format("DD/MM/YYYY")} - ${currentDates.selectedDate.format("DD/MM/YYYY")}`}>
                <Box>
                  <Typography
                    fontWeight="bold"
                    sx={{
                      color: "#485E75",
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                      opacity: dataLoading ? 0.7 : 1,
                    }}
                  >
                    {getDisplayDateText(currentPreset, DateStartDate, DateEndDate, currentDates.displayDate, currentDates.selectedDate)}
                    {dataLoading && <span style={{ marginLeft: 8 }}>...</span>}
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      {getSubtitleText(currentPreset, DateStartDate, DateEndDate, currentDates.displayDate, currentDates.selectedDate)}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>

              {!currentDates.selectedDate.isSame(today, "day") && (
                <IconButton size="small" onClick={handleNext} disabled={dataLoading}>
                  <ChevronRight fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Gross Revenue */}
          {visibleMetrics.includes("gross_revenue") && (
            <Box sx={metricBlockStyle}>
              <MetricItem
                title="Gross Revenue"
                value={formatCurrency(dataState.metrics.gross_revenue)}
                change={formatCurrency(dataState.difference.gross_revenue)}
                isNegative={String(dataState.difference.gross_revenue).startsWith("-")}
                tooltip={
                  currentDates.selectedDate.isSame(today, "day")
                    ? `Yesterday: ${formatCurrency(dataState.previous.gross_revenue)}`
                    : `${currentDates.selectedDate
                        .subtract(1, "day")
                        .format("MMM DD")}: ${formatCurrency(
                        dataState.previous.gross_revenue
                      )}`
                }
                currencySymbol="$"
                loading={dataLoading}
              />
            </Box>
          )}

          {/* Chart */}
          {visibleMetrics.includes("gross_revenue") && (
            <Box sx={{ borderRight: "1px solid #e0e0e0" }}>
              <Box
                ref={graphContainerRef}
                sx={{
                  ...metricBlockStyle,
                  position: "relative",
                  overflow: "visible",
                  flexDirection: "column",
                  opacity: dataLoading ? 0.6 : 1,
                }}
                onMouseLeave={() => setTooltipData(null)}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 80,
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <svg ref={svgRef} width="100%" height="60">
                    {[20, 30, 40].map((y, idx) => (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke="#eee"
                        strokeWidth="1"
                      />
                    ))}
                    <line
                      x1="0"
                      y1="48"
                      x2="100%"
                      y2="48"
                      stroke="#000"
                      strokeWidth="1"
                    />

                    {!dataLoading && (
                      <>
                        <polyline
                          points={getGraphPoints()}
                          style={{
                            fill: "none",
                            stroke: theme.palette.primary.main,
                            strokeWidth: 2,
                          }}
                        />

                        {getCirclePoints().map((point, index) => (
                          <circle
                            key={index}
                            cx={point.cx}
                            cy={point.cy}
                            r="10"
                            fill="transparent"
                            style={{ pointerEvents: "all" }}
                            onMouseEnter={() => setTooltipData(point)}
                            onMouseLeave={() => setTooltipData(null)}
                          />
                        ))}

                        {tooltipData && (
                          <>
                            <circle
                              cx={tooltipData.cx}
                              cy={tooltipData.cy}
                              r="6"
                              fill="white"
                              stroke={theme.palette.primary.main}
                              strokeWidth="2"
                              style={{ pointerEvents: "none" }}
                            />
                            <circle
                              cx={tooltipData.cx}
                              cy={tooltipData.cy}
                              r="3"
                              fill={theme.palette.primary.main}
                              style={{ pointerEvents: "none" }}
                            />
                          </>
                        )}
                      </>
                    )}
                  </svg>

                  {/* Graph X-axis Dates */}
                  {!dataLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 52,
                        left: 0,
                        right: 0,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "#555",
                        px: 1,
                        marginTop: "3px",
                      }}
                    >
                      <span>{dataState.bindGraph[0]?.date}</span>
                      <span>{dataState.bindGraph[dataState.bindGraph.length - 1]?.date}</span>
                    </Box>
                  )}

                  {dataLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: 12,
                        color: "#666",
                      }}
                    >
                      Loading...
                    </Box>
                  )}
                </Box>

                {/* Tooltip */}
                {tooltipData && !dataLoading && (
                  <Box
                    sx={{
                      position: "fixed",
                      left: svgOffset.left + tooltipData.cx - 80,
                      top: svgOffset.top + tooltipData.cy - 70,
                      backgroundColor: "white",
                      border: "1px solid #d0d7de",
                      borderRadius: 2,
                      padding: "8px 12px",
                      fontSize: 12,
                      pointerEvents: "none",
                      zIndex: 1000,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography fontWeight="bold" fontSize={14} color="#485E75">
                      {dayjs(tooltipData.fullDate)
                        .tz(TIMEZONE)
                        .format("MMM DD, YYYY")}
                    </Typography>
                    <Typography fontSize={14} color="#000" fontWeight="bold">
                      {formatCurrency(tooltipData.revenue)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Other Metric Cards */}
          {[
            "total_orders",
            "total_units",
            "refund",
            "total_cogs",
            "margin",
            "business_value",
          ].map((id, idx) => {
            const item = METRICS_CONFIG[id];

            return (
              visibleMetrics.includes(id) && (
                <Box key={idx} sx={metricBlockStyle}>
                  <MetricItem
  title={item.title}
  value={
    item.currencySymbol
      ? formatCurrency(dataState.metrics[id])
      : item.percentSymbol
        ? `${Number(dataState.metrics[id] ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
        : Number(dataState.metrics[id] ?? 0).toLocaleString("en-US")
  }
  change={
    item.currencySymbol
      ? formatCurrency(dataState.difference[id])
      : item.percentSymbol
        ? `${Number(dataState.difference[id] ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
        : Number(dataState.difference[id] ?? 0).toLocaleString("en-US")
  }
  isNegative={String(dataState.difference[id]).startsWith("-")}
  tooltip={item.tooltip(currentDates.selectedDate, today, dataState.previous[id])}
  currencySymbol={item.currencySymbol}
  percentSymbol={item.percentSymbol}
  loading={dataLoading}
/>
                </Box>
              )
            );
          })}

          {/* Settings Toggle */}
          <Box
            onClick={handleOpen}
            sx={{
              marginTop: "-1px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              p: 1,
              height: "65px",
              fontSize: 14,
              fontWeight: 600,
              color: "#485E75",
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
            Choose Metrics
          </Box>

          {/* Settings Dialog */}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogContent dividers>
              <ChooseMetrics
                selectedMetrics={visibleMetrics}
                onChange={handleMetricToggle}
                onReset={handleReset}
                onClose={handleClose}
                onApply={handleApply}
              />
            </DialogContent>
          </Dialog> 
        </Box>
      )}
    </Box>
  );
};

export default TestCard;