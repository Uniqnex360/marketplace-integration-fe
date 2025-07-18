import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  Box,
  Tabs,
  Tab,
  Button,
  Switch,
  Typography,
  Avatar,
  Checkbox,
  Stack,
  IconButton,
  Paper,
  Grid,
  Tooltip as MuiTooltip,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import "dayjs/locale/en-in";
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from "dayjs/plugin/localizedFormat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import NoteModel from "../NoteModel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import TooltipName from "./TooltipName";
import DottedCircleLoading from "../../../Loading/DotLoading";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

// Define a consistent set of colors
const colors = ["#0d47a1", "#00bcd4", "#00897b", "#9c27b0", "#f44336"];

function CopyAsin({ open, onClose, children }) {
  return (
    <MuiTooltip
      open={open}
      onClose={onClose}
      title={
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <CheckCircleIcon sx={{ color: "#4CAF50", mr: 0.5, fontSize: 16 }} />
          <span>ASIN Copied</span>
        </Box>
      }
      placement="top"
    >
      {children}
    </MuiTooltip>
  );
}

const CustomTooltip = ({ active, payload, label, productList, tab }) => {
  if (!active || !payload || payload.length === 0) return null;

  const formattedDate = dayjs(label).tz("US/Pacific").format("MMM D, h:mm A");

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: "none",
        minWidth: 250,
        border: "1px solid rgb(161, 173, 184)",
      }}
    >
      <Typography fontWeight={600} fontSize={14} gutterBottom>
        {formattedDate}
      </Typography>

      {payload.map((entry) => {
        const product = productList.find(p => p.id === entry.dataKey);
        if (!product) return null;

        return (
          <Stack key={entry.dataKey} direction="column" spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: product.color,
                  }}
                />
                <Typography fontSize={14} color="text.secondary">
                  {product?.sku || "N/A"}
                </Typography>
              </Stack>

              <Typography fontWeight="bold" fontSize={14}>
                {tab === 0
                  ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(entry.value)
                  : entry.value}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={product?.img}
                variant="rounded"
                sx={{ width: 30, height: 30 }}
              />
              <Box>
                <Typography
                  fontSize={14}
                  fontWeight={500}
                  noWrap
                  maxWidth={180}
                  sx={{ fontWeight: "bold" }}
                >
                  {product?.title || product?.name}
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  {product?.asin}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        );
      })}
    </Paper>
  );
};

export default function TopProductsChart({
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
}) {
  const [tab, setTab] = useState(0);
  const [productList, setProductList] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [bindGraph, setBindGraph] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedAsin, setCopiedAsin] = useState(null);
  const [tooltipText, setTooltipText] = useState("Copy ASIN");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);
  const isTodayOrYesterday = widgetData === "Today" || widgetData === "Yesterday";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleTooltipOpen = (value) => {
    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";
    setTooltipText(`Copy ${label}`);
  };

  const handleCopy = async (value) => {
    if (!value) return;

    const isNumberOnly = /^\d+$/.test(value);
    const label = isNumberOnly ? "WPID" : "ASIN";

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setTooltipText(`${label} Copied!`);
    } catch (err) {
      console.error("Copy failed", err);
      setTooltipText("Copy Failed");
    }

    setTimeout(() => {
      setTooltipText(`Copy ${label}`);
    }, 1500);
  };

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const [openNote, setOpenNote] = useState(false);
  const [events, setEvents] = useState(true);

  const getSortByValue = (tab) => {
    switch (tab) {
      case 0:
        return "price";
      case 1:
        return "units_sold";
      case 2:
        return "refund";
      default:
        return "price";
    }
  };

  const fetchTopProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_top_products/`,
        {
          sortBy: getSortByValue(tab),
          preset: widgetData,
          user_id: userId,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timeZone: "US/Pacific" 
        }
      );
      setApiResponse(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (widgetData) fetchTopProducts();
  }, [
    tab,
    widgetData,
    marketPlaceId,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]);

  useEffect(() => {
    if (apiResponse?.data?.results?.items) {
      const items = apiResponse.data.results.items;

      const products = items.map((item, index) => ({
        id: `product_${index}`,
        topIds: item.id,
        name: item.product,
        sku: item.sku,
        asin: item.asin,
        color: colors[index % colors.length],
        img: item.product_image || "",
        chart: item.chart || {},
      }));

      setProductList(products);
      setActiveProducts(products.map((p) => p.id));

      const chartDataMap = {};
      const allTimestamps = new Set();

      products.forEach((product) => {
        Object.entries(product.chart || {}).forEach(([datetime, value]) => {
          const dateObj = dayjs(datetime);
          const timeKey = isTodayOrYesterday 
            ? dateObj.minute(0).second(0).millisecond(0).toISOString() // round to hour for today/yesterday
            : dateObj.startOf("day").toISOString(); // group by day for other ranges

          allTimestamps.add(timeKey);

          if (!chartDataMap[timeKey]) {
            chartDataMap[timeKey] = { date: timeKey };
          }

          chartDataMap[timeKey][product.id] = value;
        });
      });

      const sortedChartData = [...allTimestamps]
        .sort((a, b) => new Date(a) - new Date(b))
        .map((timestamp) => chartDataMap[timestamp]);

      setBindGraph(sortedChartData);
    }
  }, [apiResponse, widgetData]);

  const handleToggle = (id) => {
    setActiveProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const formatXAxisTick = (tick) => {
    const dateObj = dayjs(tick);
    const today = dayjs();
    const yesterday = today.subtract(1, "day");

    if (dateObj.isSame(today, "day") || dateObj.isSame(yesterday, "day")) {
      return dateObj.format("h A"); // e.g., "3 AM"
    } else {
      return dateObj.format("MMM D"); // e.g., "Apr 1"
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <DottedCircleLoading />
      </div>
    );
  }

  return (
    <Box p={2}>
      <Typography sx={{ fontSize: "20px" }} fontWeight="bold" mb={1}>
        Top 10 Products
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4} sx={{ marginLeft: "-13px" }}>
          <Box
            sx={{
              backgroundColor: "#e1e8f0",
              borderRadius: "16px",
              display: "inline-flex",
              p: "1px",
              mb: 1.5,
            }}
          >
            <Tabs
              value={tab}
              onChange={(e, v) => setTab(v)}
              variant="standard"
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                marginTop: "3px",
                minHeight: "26px",
              }}
            >
              {["Revenue", "Units Sold", "Refunds"].map((label, index) => (
                <Tab
                  key={index}
                  label={
                    <Typography
                      fontSize="11px"
                      fontWeight={tab === index ? 600 : "normal"}
                    >
                      {label}
                    </Typography>
                  }
                  sx={{
                    fontFamily:
                      'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                    minHeight: "20px",
                    minWidth: "auto",
                    px: 1.2,
                    py: 0.2,
                    borderRadius: "12px",
                    fontWeight: 500,
                    fontSize: "14px !important",
                    textTransform: "none",
                    color: "#2b2f3c",
                    backgroundColor: tab === index ? "#fff" : "transparent",
                    "&.Mui-selected": {
                      color: "#000",
                    },
                    "&:hover": {
                      backgroundColor:
                        tab === index ? "#fff" : "rgb(166, 183, 201)",
                    },
                    "&:active": {
                      backgroundColor: "rgb(103, 132, 162)",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Stack
            direction="column"
            spacing={0.5}
            sx={{
              maxHeight: 400,
              overflowX: "hidden",
              overflowY: "auto",
              pr: 0.5,
              "&::-webkit-scrollbar": {
                height: "2px",
                width: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "8px",
              },
            }}
          >
            {productList.map((product) => {
              const isActive = activeProducts.includes(product.id);
              const hasAsin = Boolean(product.asin);
              const isCurrentlyCopied = copiedId === product.asin;

              return (
                <Stack
                  key={product.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ paddingBottom: "3px" }}
                >
                  <Checkbox
                    checked={isActive}
                    onChange={() => handleToggle(product.id)}
                    icon={
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          display: "block",
                          borderRadius: 3,
                          border: `2px solid ${product.color}`,
                        }}
                      />
                    }
                    checkedIcon={
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 3,
                          backgroundColor: product.color,
                          border: `2px solid ${product.color}`,
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 14 }} />
                      </span>
                    }
                    sx={{ p: 0, color: product.color }}
                  />
                  <Avatar src={product.img} sx={{ width: 28, height: 28 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <TooltipName
                      title={product?.title || product?.name}
                    >
                      <a
                        href={`/Home/product-detail/${product?.topIds}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <Typography
                          fontSize="14px"
                          fontWeight={600}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.3em",
                            maxHeight: "2.6em",
                            cursor: "pointer",
                            whiteSpace: "normal",
                            color: "#0A6FE8",
                            fontFamily:
                              'Nunito Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                          }}
                        >
                          {product.name}
                        </Typography>
                      </a>
                    </TooltipName>

                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.3 }}
                    >
                      <img
                        src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                        alt="Country Flag"
                        width={27}
                        height={16}
                        style={{ marginRight: 6 }}
                      />

                      <Typography
                        fontSize="14px"
                        color="text.secondary"
                        mr={0.5}
                      >
                        {product?.asin}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MuiTooltip
                          title={tooltipText}
                          onOpen={() => handleTooltipOpen(product.asin)}
                          arrow
                        >
                          <IconButton
                            onClick={() => handleCopy(product.asin)}
                            size="small"
                            sx={{ mr: 0.5 }}
                          >
                            <ContentCopyIcon
                              sx={{ fontSize: "14px", color: "#757575" }}
                            />
                          </IconButton>
                        </MuiTooltip>

                        <MuiTooltip
                          title={`SKU: ${product.sku}`}
                          placement="top"
                          arrow
                        >
                          <IconButton size="small" sx={{ p: 0.5 }}>
                            •{" "}
                            <InfoOutlinedIcon
                              fontSize="inherit"
                              sx={{
                                paddingLeft: "3px",
                                height: "16px",
                                width: "16px",
                              }}
                            />
                          </IconButton>
                        </MuiTooltip>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="flex-end">
            <Box display="flex" alignItems="center" gap={2}>
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
            </Box>
          </Box>

          <NoteModel open={openNote} onClose={() => setOpenNote(false)} />

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={bindGraph}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              onMouseLeave={() => {}}
            >
              <CartesianGrid
                stroke="#e0e0e0"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "12px", fill: "#666" }}
                padding={{ left: 20, right: 20 }}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                tick={{ fontSize: "12px", fill: "#666" }}
                tickFormatter={(value) => tab === 0 ? `$${Math.round(value)}` : Math.round(value)}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                tickCount={5}
              />
              <Tooltip
                content={<CustomTooltip productList={productList} tab={tab} />}
                wrapperStyle={{ zIndex: 1000 }}
              />
              {activeProducts.map((productId) => {
                const product = productList.find((p) => p.id === productId);
                if (!product) return null;

                return (
                  <Line
                    key={product.id}
                    type="monotone"
                    dataKey={product.id}
                    stroke={product.color}
                    strokeWidth={2}
                    connectNulls={true}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Box>
  );
}