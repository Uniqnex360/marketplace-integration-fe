import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Close as CloseIcon } from "@mui/icons-material";
import {
  ArrowDownward,
  ArrowUpward,
  BorderBottom,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings"; // or SettingsOutlined

import RevenueChooseMetrics from "./RevenueChooseMetrics";
import {
  Tabs,
  Tab,
  TextField,
  Menu,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  CardContent,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Switch,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios"; // Assuming axios is used for API calls
import NoteModel from "../NoteModel";
import { parse, format, parseISO, isValid } from "date-fns";
import { enUS } from "date-fns/locale";
import DottedCircleLoading from "../../../Loading/DotLoading";

const metricColors = {
  gross_revenue: "#00b894",
  net_profit: "#6629b3",
  profit_margin: "#0984e3",
  orders: "#f14682",
  units_sold: "#000080",
  refund_amount: "#e6770d",
  refund_quantity: "#600101",
};

const initialMetricConfig = [
  {
    id: "gross_revenue_with_tax",
    label: "Gross Revenue (With Tax)",
    value: null,
    change: null,
    isNegativeChange: false,
    color: "#00b894",
    show: false,
    isCurrency: true
  },
  {
    id: "gross_revenue_without_tax",
    label: "Gross Revenue (Without Tax)",
    value: null,
    change: null,
    isNegativeChange: false,
    color: "#00b894",
    show: false,
    isCurrency: true
  },
  {
    id: "net_profit",
    label: "Net Profit",
    value: null,
    change: null,
    isNegativeChange: true,
    color: "#6629b3",
    show: false,
    isCurrency: true,
  },
  {
    id: "profit_margin",
    label: "Profit Margin",
    value: null,
    change: null,
    isNegativeChange: true,
    color: "#0984e3",
    show: false,
  },
  {
    id: "orders",
    label: "Orders",
    value: null,
    change: null,
    isNegativeChange: true,
    color: "#f14682",
    show: false,
  },
  {
    id: "units_sold",
    label: "Units Sold",
    value: null,
    change: null,
    isNegativeChange: true,
    color: "#000080",
    show: false,
  },
  {
    id: "refund_amount",
    label: "Refund Amount",
    value: null,
    change: null,
    isNegativeChange: false,
    color: "#e6770d",
    show: false,
    isCurrency: true,
  },
  {
    id: "refund_quantity",
    label: "Refund Quantity",
    value: null,
    change: null,
    isNegativeChange: false,
    color: "#600101",
    show: false,
  },
];

const metricLabels = {
  gross_revenue: "Gross Revenue(With Tax)",
  gross_revenue: "Gross Revenue(Without Tax)",
  net_profit: "Net Profit",
  profit_margin: "Profit Margin",
  orders: "Orders",
  units_sold: "Units Sold",
  refund_amount: "Refund Amount",
  refund_quantity: "Refund Quantity",
};

const CompareChart = ({
  startDate,
  endDate,
  widgetData,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) => {
  const [chartData, setChartData] = useState({}); // Initialize as an empty object
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [compare, setCompare] = useState("Compare to past");
  const [events, setEvents] = useState(true);
  const [value, setValue] = useState([dayjs().startOf("month"), dayjs()]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [bindGraph, setBindGraph] = useState([]);
  const [openNote, setOpenNote] = useState(false);
  let lastParamsRef = useRef("");

  const [open, setOpen] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState([]);
  const [showComparisonPill, setShowComparisonPill] = useState(false);
  const [comparisonText, setComparisonText] = useState("");

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";

  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const saved = localStorage.getItem("selectedStartDate");
    return saved ? new Date(saved) : null;
  });

  const [selectedEndDate, setSelectedEndDate] = useState(() => {
    const saved = localStorage.getItem("selectedEndDate");
    return saved ? new Date(saved) : null;
  });

  const [selectedValue, setSelectedValue] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [compareGraphData, setCompareGraphData] = useState([]);
  const [mergedGraphData, setMergedGraphData] = useState([]); // Unified data for the chart

  const [CompareGrpah, setCompareGrpah] = useState([]);

  const [compareFinalDate, setCompareFinalDate] = useState([]);
  const [currentFinalDate, setCurrentFinalDate] = useState([]);

  const [CompareDateFilter, setCompareDateFilter] = useState([]);

  const [CompareTotal, setCompareTotal] = useState([]);

  const options = [
    { key: "previous_period", label: "Previous period" },
    { key: "previous_week", label: "Previous week" },
    { key: "previous_month", label: "Previous month" },
    { key: "previous_year", label: "Previous year" },
  ];

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";

      const payload = {
        preset: widgetData,
        marketplace_id: marketPlaceId?.id, // Use optional chaining in case marketPlaceId is null/undefined
        user_id: userId,
        compare_startdate: selectedStartDate,
        compare_enddate: selectedEndDate,

        //  compare_startdate:'2025-06-10',
        //   //  DateStartDate,
        //   compare_enddate: '2025-06-10',
        brand_id: brand_id,
        product_id: product_id,
        manufacturer_name: manufacturer_name,
        fulfillment_channel: fulfillment_channel,
        start_date: DateStartDate,
        end_date: DateEndDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // You have a mocked response here. For a real API call, uncomment the axios.post line:
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updatedRevenueWidgetAPIView/`,
        payload
      );

      const data = response.data.data;
      setCompareDropDown(data.comapre_past);
      setCompareTotal(data.compare_total);
      setChartData(data?.graph);

      const formatCurrency = (amount) =>
        `$${Number(amount || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;
      const formatNumber = (value) => Number(value || 0).toLocaleString();

      const availableMetrics = Object.keys(data.total);
      const updatedMetricConfig = initialMetricConfig.map((metric) => ({
        ...metric,
        show: availableMetrics.includes(metric.id),
      }));

      setMetrics(
        updatedMetricConfig
          .filter((m) => m.show)
          .map((metric) => ({
            label: metricLabels[metric.id],
            value: metric.isCurrency
              ? formatCurrency(data.total[metric.id])
              : metric.isPercentage
              ? formatPercentage(data.total[metric.id])
              : formatNumber(data.total[metric.id]),
            compareValue:
              data.compare_total?.[metric.id] !== undefined
                ? metric.isCurrency
                  ? formatCurrency(data.compare_total[metric.id])
                  : metric.isPercentage
                  ? formatPercentage(data.compare_total[metric.id])
                  : formatNumber(data.compare_total[metric.id])
                : null,
            color: metricColors[metric.id],
            colorCompare: metricColors[metric.id],
            id: metric.id,
            isPercentage: metric.isPercentage,
            isCurrency: metric.isCurrency,
          }))
      );
      setVisibleMetrics(
        updatedMetricConfig.filter((m) => m.show).map((m) => m.id)
      );
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setChartData({}); // Reset data on error
    } finally {
      setLoading(false);
    }
  };
  // Convert snake_case metric id to camelCase for dataKey, e.g. gross_revenue -> grossRevenue
  const formatMetricDataKey = (id) => {
    return id.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleMetricToggle = (metric) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleReset = () => {
    setVisibleMetrics([]);
  };

  const handleApply = () => {
    // Logic to apply the selected metrics
    console.log("Applied Metrics:", visibleMetrics);
    handleClose();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    fetchRevenue();
  };
  const formatDate = (dateInput) => {
    const date = new Date(dateInput); // Convert string or timestamp to Date
    const options = { month: "short", day: "numeric" };
    const dayMonth = date.toLocaleDateString("en-US", options);
    const year = date.getFullYear();
    return `${dayMonth}, ${year}`;
  };

  const handleChange = async (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    console.log("9999999999", value);

    if (value !== "custom") {
      const start = compareDropDown?.[value]?.start;
      const end = compareDropDown?.[value]?.end;

      if (start && end) {
        try {
          // Convert "Apr 28, 2025" -> 2025-04-28 format
          const parsedStart = format(
            parse(start, "MMM dd, yyyy", new Date()),
            "yyyy-MM-dd"
          );
          const parsedEnd = format(
            parse(end, "MMM dd, yyyy", new Date()),
            "yyyy-MM-dd"
          );

          setSelectedStartDate(parsedStart);
          setSelectedEndDate(parsedEnd);

          // API CALL AUTOMATIC
          await fetchRevenue(parsedStart, parsedEnd);

          // Only show the pill after the API call (or immediately if no API call)
          const selectedOption = options.find((opt) => opt.key === value);
          if (selectedOption) {
            let formattedDate;
            if (widgetData === "Today" || widgetData === "Yesterday") {
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
            setComparisonText("");
          }
        } catch (error) {
          console.error("Error processing comparison value:", error);
          // Optionally handle the error (e.g., show an error message)
          setShowComparisonPill(false);
          setComparisonText("");
        }
      } else {
        setShowComparisonPill(false);
        setComparisonText("");
      }
    } else if (value === "custom") {
      // Handle custom date range selection logic here
      setComparisonText("— Custom date range");
      setShowComparisonPill(true);
    } else {
      setShowComparisonPill(false);
      setComparisonText("");
    }
  };

  useEffect(() => {
    const currentParams = JSON.stringify({
      value,
      widgetData,
      marketPlaceId,
      selectedEndDate,
      selectedValue,
      selectedStartDate,
      userId,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
    });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;

      fetchRevenue();
    }
  }, [
    value,
    widgetData,
    marketPlaceId,
    selectedEndDate,
    selectedValue,
    selectedStartDate,
    userId,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]); // Add dependencies that might trigger a refetch

  useEffect(() => {
    if (!chartData || Object.keys(chartData).length === 0) return;

    const localGraphData = Object.values(chartData);
    console.log("varialbe", localGraphData);
    if (localGraphData.length > 0) {
      const startDate = new Date(localGraphData[0].current_date);
      const endDate = new Date(
        localGraphData[localGraphData.length - 1].current_date
      );

      const formatShortDate = (date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const formattedStart = formatShortDate(startDate); // e.g., "Jun 9"
      const formattedEnd = formatShortDate(endDate); // e.g., "Jun 12"
      const year = endDate.getFullYear(); // 2025

      const displayRange =
        widgetData === "Today" || widgetData === "Yesterday"
          ? `${formattedStart}, ${year}`
          : `${formattedStart} - ${formattedEnd}, ${year}`;

      console.log(`📊 Widget (${widgetData}): ${displayRange}`);
      setCompareDateFilter(displayRange); // optional state update if you're showing it in UI
    }
  }, [chartData, widgetData]);

  const formattedData = useMemo(() => {
    // Ensure chartData is an object with values before mapping
    if (!chartData || Object.keys(chartData).length === 0) {
      return [];
    }

    return Object.values(chartData).map((item) => ({
      time: dayjs(item.current_date).format("h A"),
      date: item.current_date,
      compareDate: item.compare_date,

      grossRevenue: item.gross_revenue_without_tax ?? 0,
      netProfit: item.net_profit ?? 0,
      profitMargin: item.profit_margin ?? 0,
      orders: item.orders ?? 0,
      unitsSold: item.units_sold ?? 0,
      refundAmount: item.refund_amount ?? 0,
      refundQuantity: item.refund_quantity ?? 0,

      compareGrossRevenue: item.compare_gross_revenue ?? null,
      compareNetProfit: item.compare_net_profit ?? null,
      compareProfitMargin: item.compare_profit_margin ?? null,
      compareOrders: item.compare_orders ?? null,
      compareUnitsSold: item.compare_units_sold ?? null,
      compareRefundAmount: item.compare_refund_amount ?? null,
      compareRefundQuantity: item.compare_refund_quantity ?? null,
    }));
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    // Removed compareFinalDate and compareWiseData from here
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    // Find the current data point from the payload to get its compare_date
    const currentDataPoint = payload[0]?.payload;
    const currentItemDate = currentDataPoint?.date;
    const compareDateForHeader = currentDataPoint?.compareDate; // Get compare date from the current data point

    // Helper to format values
    const formatValue = (val, key) => {
      if (typeof val === "number") {
        if (
          key.toLowerCase().includes("margin") ||
          key.toLowerCase() === "acos" ||
          key.toLowerCase() === "tacos"
        ) {
          return `${val.toFixed(2)}%`;
        } else if (
          key.toLowerCase().includes("revenue") ||
          key.toLowerCase().includes("profit") ||
          key.toLowerCase().includes("amount") ||
          key.toLowerCase().includes("spend")
        ) {
          return `$${val.toFixed(2)}`;
        } else if (key.toLowerCase() === "roas") {
          return val.toFixed(2); // RoAS is typically a multiplier, not a percentage or currency
        } else {
          return val.toLocaleString();
        }
      }
      return "n/a";
    };

    // Helper to safely format dates for the header
    const safeFormatDateHeader = (dateString) => {
      if (!dateString) return "N/A";
      const parsedDate = dayjs(dateString);
      return parsedDate.isValid()
        ? parsedDate.format("MMM D, h:mm A")
        : "Invalid Date";
    };

    // Organize current and compare data
    const currentData = {};
    const compareData = {};

    payload.forEach((item) => {
      const isCompare = item.dataKey.startsWith("compare");
      // Remove "compare" prefix and apply camelCase to space separation for display
      const key = isCompare
        ? item.dataKey.replace("compare", "")
        : item.dataKey;
      // Convert to Title Case with spaces for display (e.g., "grossRevenue" -> "Gross Revenue")
      const formattedKey =
        key.charAt(0).toUpperCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .trim();

      if (isCompare) {
        compareData[formattedKey] = item;
      } else {
        currentData[formattedKey] = item;
      }
    });

    // **Updated Order of keys for display to match the image precisely**
    const orderedKeys = [
      "Gross Revenue",
      "Profit Margin",
      "Net Profit",
      "Orders",
      "Units Sold",
      "Refund Amount",
      "Refund Quantity",
    ];

    // Determine if compare graph is active. This is now based on whether compareDateForHeader exists.
    const CompareGraph = !!compareDateForHeader;

    return (
      <div
        className="custom-tooltip bg-white p-3 border rounded shadow text-sm min-w-[320px]"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          minWidth: "320px",
        }}
      >
        {/* Header Dates */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontWeight: "bold",
            marginBottom: "8px",
            paddingBottom: "4px",
            borderBottom: "1px solid #eee",
            gap: "20px",
          }}
        >
          <span style={{ width: "130px" }}></span>
          <span
            style={{
              color: "#485E75",
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: "14px",
              textAlign: "right",
              minWidth: "100px",
            }}
          >
            {safeFormatDateHeader(currentItemDate)}
          </span>
          {CompareGraph && (
            <span
              style={{
                color: "#485E75",
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: "14px",
                textAlign: "right",
                minWidth: "100px",
              }}
            >
              {safeFormatDateHeader(compareDateForHeader)}
            </span>
          )}
        </div>

        {/* Metric Rows */}
        {orderedKeys.map((key, index) => {
          const currentItem = currentData[key];
          const compareItem = compareData[key];

          const currentValue = currentItem?.value;
          const compareValue = compareItem?.value;
          const color = currentItem?.color || "#000";

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              {/* Label with color dot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "130px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                ></span>
                <span
                  style={{
                    color: "#485E75",
                    fontFamily: "'Nunito Sans', sans-serif",
                    fontSize: "14px",
                  }}
                >
                  {key}
                </span>
              </div>

              {/* Values - Container for current and compare values */}
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "flex-end",
                  flexGrow: 1,
                }}
              >
                {/* Current Value */}
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    {formatValue(currentValue, key)}
                  </span>
                </div>

                {/* Compare Value — Only show if CompareGraph is active */}
                {CompareGraph && (
                  <div style={{ textAlign: "right", minWidth: "100px" }}>
                    <span
                      style={{
                        color: "#888",
                        fontSize: "14px",
                      }}
                    >
                      {formatValue(compareValue, key)}
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

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setVisibleMetrics((prev) => {
      if (checked) {
        return [...prev, name];
      } else {
        return prev.filter((item) => item !== name);
      }
    });
  };

  const handleClosePill = () => {
    setSelectedValue(null);
    setSelectedEndDate("");
    setSelectedStartDate("");
    console.log("kav", selectedStartDate);
    setShowComparisonPill(false);
    setComparisonText("");
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "";
    return `${start} - ${end}`;
  };

  const [compareDropDown, setCompareDropDown] = useState("Compare to past");
  // Fetch data when component mounts or relevant props change

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Horizontal center
          alignItems: "center", // Vertical center
          height: "50vh", // Adjust height as needed
        }}
      >
        <DottedCircleLoading />
      </div>
    );
  }

  if (formattedData.length === 0) {
    return (
      <div className="text-center py-4">
        No data available for the selected period.
      </div>
    );
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
            overflowY: "auto",
            overflowX: "hidden",
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            {metrics.map((metric, index) => {
              const isSelected = visibleMetrics.includes(metric.id);
              const isProfitMargin = metric.id === "profitMargin"; // Assuming 'profitMargin' is the id for profit margin

              return (
                <Card
                  key={index}
                  sx={{
                    width: "300px",
                    ml: "-28px",
                    p: 1.2,
                    borderRadius: "10px",
                    boxShadow: "none",
                    cursor: "pointer",
                    transition: "0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={handleCheckboxChange}
                      name={metric.id}
                      sx={{
                        p: 0.3,
                        "& svg": {
                          fontSize: 16,
                        },
                      }}
                      icon={
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            display: "block",
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 4,
                            backgroundColor: metric.color,
                            border: `2px solid ${metric.color}`,
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 14 }} />
                        </span>
                      }
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontSize: "14px",
                        ml: 1,
                        color: "#485E75",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                      }}
                    >
                      {metricLabels[metric.id]}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      ml: 3.5,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "24px",
                        fontWeight: 600,
                        color: "#13191",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                      }}
                    >
                      {metric.id === "profit_margin"
                        ? `${Number(metric.value).toFixed(2)}%`
                        : metric.value}
                    </Typography>

                    {metric.compareValue !== undefined && CompareTotal && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          ml: 1,
                          mt: 2,
                        }}
                      >
                        {(() => {
                          const cleanCompareValue = parseFloat(
                            String(metric.compareValue)
                              .replace(/[$,%]/g, "")
                              .replace(/,/g, "")
                          );
                          const isPositive = cleanCompareValue > 0;
                          const isNegative = cleanCompareValue < 0;

                          return (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: "14px",
                                fontWeight: 500,
                                color: isPositive
                                  ? "green"
                                  : isNegative
                                  ? "#e14d2a"
                                  : "gray",
                                display: "flex",
                                alignItems: "center",
                                fontFamily:
                                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
                              }}
                            >
                              {Math.abs(cleanCompareValue).toFixed(2)}%
                              {isPositive && (
                                <ArrowUpward
                                  sx={{ color: "green", fontSize: 16, ml: 0.3 }}
                                />
                              )}
                              {isNegative && (
                                <ArrowDownward
                                  sx={{
                                    color: "#e14d2a",
                                    fontSize: 16,
                                    ml: 0.3,
                                  }}
                                />
                              )}
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
                marginTop: "-1px",
                borderTop: "1px solid #e0e0e0",
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

            <Dialog open={open} onClose={handleClose} maxWidth="600">
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
        {visibleMetrics.length > 0 && (
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                display: "flex",
                marginBottom: "10px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {!showComparisonPill ? (
                    <Box sx={{ minWidth: 160 }}>
                      <Select
                        fullWidth
                        value={selectedValue}
                        onChange={handleChange}
                        displayEmpty
                        sx={{
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontWeight: 500,
                          height: 40,
                        }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return "Compare to past";
                          }
                          const selectedOption = options.find(
                            (opt) => opt.key === selected
                          );
                          return selectedOption
                            ? selectedOption.label
                            : "Custom";
                        }}
                      >
                        {options.map((option) => (
                          <MenuItem key={option.key} value={option.key}>
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Typography sx={{ fontWeight: 500 }}>
                                {option.label}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "12px", color: "#64748b" }}
                              >
                                {widgetData === "Today" ||
                                widgetData === "Yesterday"
                                  ? formatDate(
                                      compareDropDown?.[option.key]?.start
                                    )
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
                            <Typography sx={{ fontWeight: 500 }}>
                              Select custom date range
                            </Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#e0f2f7", // Example background color
                        borderRadius: "20px",
                        padding: "8px 12px",
                        fontWeight: 500,
                        color: "#1e88e5", // Example text color
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 16, color: "rgb(43, 57, 72)" }}
                      >{`Comparing to ${
                        options.find((opt) => opt.key === selectedValue)
                          ?.label || "Custom period"
                      }`}</Typography>
                      <IconButton
                        size="small"
                        onClick={handleClosePill}
                        sx={{ ml: 1 }}
                      >
                        <CloseIcon sx={{ fontSize: 16, color: "#757575" }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {selectedValue && (
                  <Box sx={{ mt: 1, ml: 1 }}>
                    <Typography sx={{ fontSize: "16px", color: "#485E75" }}>
                      {CompareDateFilter} {" \u00A0 ... \u00A0 "}{" "}
                      {comparisonText}
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* Add Note and Events */}
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "14px", lineHeight: 1 }}
                >
                  Events
                </Typography>

                <Switch
                  checked={events}
                  onChange={() => setEvents(!events)}
                  size="small"
                />

                {events && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      fontSize: "14px",
                      textTransform: "none",
                      padding: "4px 12px",
                      color: "black",
                      borderColor: "black",
                    }}
                    onClick={() => setOpenNote(true)}
                  >
                    + Add Note
                  </Button>
                )}
              </Box>

              <NoteModel open={openNote} onClose={() => setOpenNote(false)} />
            </Box>

            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={formattedData}>
                <XAxis
                  dataKey="date"
                  padding={{ left: 20, right: 20 }}
                  tickFormatter={(value) => {
                    if (widgetData === "Today" || widgetData === "Yesterday") {
                      return dayjs(value).format("h:mm A").toLowerCase(); // e.g., 11:00 am, 1:00 pm
                    } else {
                      return dayjs(value).format("MMM D"); // e.g., Apr 11, Apr 22
                    }
                  }}
                />

                {/* Left axis (default, always needed) */}
                <YAxis
                  yAxisId="left"
                  hide={false}
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Nunito Sans', sans-serif",
                    color: "#485E75",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const firstCurrency = metrics.find(
                      (m) => visibleMetrics.includes(m.id) && m.isCurrency
                    );
                    const firstNonCurrency = metrics.find(
                      (m) =>
                        visibleMetrics.includes(m.id) &&
                        !m.isCurrency &&
                        !m.isPercentage
                    );
                    if (firstCurrency)
                      return `$${Number(value).toLocaleString()}`;
                    if (firstNonCurrency) return Number(value).toLocaleString();
                    return value;
                  }}
                  domain={["auto", "auto"]}
                />

                <YAxis
                  yAxisId="right-percentage"
                  orientation="right"
                  hide={
                    !visibleMetrics.some((m) =>
                      ["profit_margin", "compare_profit_margin"].includes(m)
                    )
                  }
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Nunito Sans', sans-serif",
                    color: metricColors.profit_margin,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Math.round(value)}%`}
                  domain={["auto", "auto"]}
                />

                <YAxis
                  yAxisId="right-number"
                  orientation="right"
                  hide={
                    !visibleMetrics.some((m) =>
                      [
                        "orders",
                        "units_sold",
                        "refund_amount",
                        "refund_quantity",
                        "compare_orders",
                        "compare_units_sold",
                        "compare_refund_amount",
                        "compare_refund_quantity",
                      ].includes(m)
                    )
                  }
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Nunito Sans', sans-serif",
                    color: "#485E75",
                  }}
                  tickLine={false}
                  axisLine={true}
                  domain={["auto", "auto"]}
                />

                {/* Pass a function to the content prop of Tooltip */}
                <Tooltip content={<CustomTooltip />} />

                {visibleMetrics.includes("gross_revenue") && (
                  <Line
                    type="monotone"
                    dataKey="grossRevenue"
                    dot={false}
                    stroke={metricColors.gross_revenue}
                    strokeWidth={2}
                    name={metricLabels.gross_revenue}
                    yAxisId="left"
                  />
                )}

                {visibleMetrics.includes("gross_revenue") && (
                  <Line
                    type="monotone"
                    dataKey="compareGrossRevenue"
                    dot={false}
                    stroke={metricColors.gross_revenue}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.gross_revenue}`}
                    strokeDasharray="5 5"
                    yAxisId="left"
                  />
                )}
                {visibleMetrics.includes("profit_margin") && (
                  <Line
                    type="monotone"
                    dataKey="profitMargin"
                    dot={false}
                    stroke={metricColors.profit_margin}
                    strokeWidth={2}
                    name={metricLabels.profit_margin}
                    yAxisId="right-percentage"
                  />
                )}
                {visibleMetrics.includes("profit_margin") && (
                  <Line
                    type="monotone"
                    dataKey="compareProfitMargin"
                    dot={false}
                    strokeDasharray="5 5"
                    name={`Compare ${metricLabels.profit_margin}`}
                    yAxisId="right-percentage"
                  />
                )}

                {visibleMetrics.includes("net_profit") && (
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    dot={false}
                    stroke={metricColors.net_profit}
                    strokeWidth={2}
                    name={metricLabels.net_profit}
                    yAxisId="left"
                  />
                )}

                {visibleMetrics.includes("net_profit") && (
                  <Line
                    type="monotone"
                    dataKey="compareNetProfit"
                    dot={false}
                    strokeDasharray="5 5"
                    stroke={metricColors.net_profit}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.net_profit}`}
                    yAxisId="left"
                  />
                )}

                {visibleMetrics.includes("orders") && (
                  <Line
                    type="monotone"
                    dataKey="orders"
                    dot={false}
                    stroke={metricColors.orders}
                    strokeWidth={2}
                    name={metricLabels.orders}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("orders") && (
                  <Line
                    type="monotone"
                    dataKey="compareOrders"
                    dot={false}
                    strokeDasharray="5 5"
                    stroke={metricColors.orders}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.orders}`}
                    yAxisId="right-percentage"
                  />
                )}

                {visibleMetrics.includes("units_sold") && (
                  <Line
                    type="monotone"
                    dataKey="unitsSold"
                    dot={false}
                    stroke={metricColors.units_sold}
                    strokeWidth={2}
                    name={metricLabels.units_sold}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("units_sold") && (
                  <Line
                    type="monotone"
                    dataKey="compareUnitsSold"
                    dot={false}
                    strokeDasharray="5 5"
                    stroke={metricColors.units_sold}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.units_sold}`}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("refund_amount") && (
                  <Line
                    type="monotone"
                    dataKey="refundAmount"
                    dot={false}
                    stroke={metricColors.refund_amount}
                    strokeWidth={2}
                    name={metricLabels.refund_amount}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("refund_amount") && (
                  <Line
                    type="monotone"
                    dataKey="compareRefundAmount"
                    dot={false}
                    strokeDasharray="5 5"
                    stroke={metricColors.refund_amount}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.refund_amount}`}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("refund_quantity") && (
                  <Line
                    type="monotone"
                    dataKey="refundQuantity"
                    dot={false}
                    stroke={metricColors.refund_quantity}
                    strokeWidth={2}
                    name={metricLabels.refund_quantity}
                    yAxisId="right-number"
                  />
                )}

                {visibleMetrics.includes("refund_quantity") && (
                  <Line
                    type="monotone"
                    dataKey="compareRefundQuantity"
                    dot={false}
                    strokeDasharray="5 5"
                    stroke={metricColors.refund_quantity}
                    strokeWidth={2}
                    name={`Compare ${metricLabels.refund_quantity}`}
                    yAxisId="right-number"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CompareChart;
