import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  ListItemText,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Download,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
} from "@mui/icons-material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { saveAs } from "file-saver";
import axios from "axios";
import dayjs from "dayjs";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DottedCircleLoading from "../../../Loading/DotLoading";
import SkeletonTableMyProducts from "../MyProducts/ProductsLoading/MyProductLoading";
import LoadingAllMarketplace from "./LoadingAllMarketplace";
import CardComponent from "../CardComponet";

const fontStyles = {
  fontSize: "16px",
  color: "#485E75",
  fontFamily:
    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
};

function MarketplaceRow({ row, index }) {
  const [open, setOpen] = useState(false);
  const isFirstRow = index === 0;
  const cellStyle = {
    ...fontStyles,
    color: "black",
    fontWeight: 600,
    fontSize: "14px",
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "-";
    const number = Number(value);
    const formatted = number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    });
    return formatted;
  };

  return (
    <>
      <TableRow
        sx={{
          ...fontStyles,
          borderBottom: "none",
        }}
      >
        <TableCell padding="none" sx={{ borderBottom: "none" }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            fontFamily:
              "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            color: "#485E75",
            pb: open && !isFirstRow ? "4px" : 0,
            borderBottom: "none",
          }}
        >
          {row.image && (
            <Avatar
              src={row.image}
              alt={row.marketplace}
              sx={{
                width: 20,
                height: 20,
                color: "#485E75",
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "14px",
                fontWeight: "800",
                mr: 1,
              }}
            />
          )}
          {row.marketplace}
        </TableCell>

        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.grossRevenue < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.grossRevenue)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.expenses < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.expenses)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.total_cogs < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.total_cogs)}
        </TableCell>
        <TableCell
          sx={{
            ...cellStyle,
            borderBottom: "none",
            color: row.currency_list[0]?.netProfit < 0 ? "red" : "black",
          }}
        >
          {formatCurrency(row.currency_list[0]?.netProfit)}
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.margin?.toFixed(2)}%
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.roi?.toFixed(2)}%
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.refunds}
        </TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>
          {row.currency_list[0]?.unitsSold}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {/* Add more details here if needed */}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AllMarketplace({
  widgetData,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) {
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastParamsRef = useRef("");

  const handleTooltipOpen = () => {
    setOpenTooltip(true);
  };

  const handleTooltipClose = () => {
    setOpenTooltip(false);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadMarketplaceDataCSV/`,
        {
          marketplace_id: marketPlaceId.id,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
        },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "marketplace-data.csv");
    } catch (error) {
      console.error("CSV Download Error:", error);
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}allMarketplaceDataxl/`,
        {
          marketplace_id: marketPlaceId.id,
          preset: widgetData,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
        },
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "marketplace-data.xlsx");
    } catch (error) {
      console.error("XLS Download Error:", error);
    }
  };

  const fromDate = marketplaceData?.from_date;
  const toDate = marketplaceData?.to_date;
  const formattedCurrentDate = fromDate
    ? dayjs(fromDate).format("MMM DD, YYYY")
    : "";
  const formattedDateRange =
    fromDate && toDate
      ? `${dayjs(fromDate).format("MMM DD, YYYY")} - ${dayjs(toDate).format(
          "MMM DD, YYYY"
        )}`
      : "";

  const fetchAllMarketplace = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";
      const response = await axios.post(
        `${process.env.REACT_APP_IP}allMarketplaceData/`,
        {
          user_id: userId,
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
      setMarketplaceData(response.data);
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentParams = JSON.stringify({
      widgetData,
      marketPlaceId,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
    });
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchAllMarketplace();
    }
  }, [
    widgetData,
    marketPlaceId,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
  ]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const rows = marketplaceData?.custom?.marketplace_list || [];
  const allMarketplaceData = marketplaceData?.custom?.all_marketplace || {};

  return (
    <Box sx={{ p: 2 }}>
      {/* Top Section - Card Component integrated properly */}
      <Box sx={{ mb: 3 }}>
        <CardComponent
          widgetData={widgetData}
          marketPlaceId={marketPlaceId}
          DateStartDate={DateStartDate}
          DateEndDate={DateEndDate}
          brand_id={brand_id}
          product_id={product_id}
          manufacturer_name={manufacturer_name}
          fulfillment_channel={fulfillment_channel}
        />
      </Box>

      {/* Main Content Paper */}
      <Paper
        elevation={0}
        sx={{
          boxShadow: "none",
          p: 3,
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                ...fontStyles,
                fontWeight: 600,
                fontSize: "20px",
                color: "#111827",
                mb: 0.5,
              }}
            >
              All Marketplaces
            </Typography>
            <Typography sx={{ ...fontStyles, fontSize: "14px", color: "#6B7280" }}>
              {widgetData === "Today" || widgetData === "Yesterday"
                ? formattedCurrentDate
                : formattedDateRange}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip
              title={
                <Typography
                  sx={{ fontWeight: 400, fontSize: "14px", color: "#485E75" }}
                >
                  All currencies have been converted to{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    $ USD
                  </Box>{" "}
                  based on the daily exchange rate
                </Typography>
              }
              open={openTooltip}
              onClose={handleTooltipClose}
              onMouseEnter={handleTooltipOpen}
              onMouseLeave={handleTooltipClose}
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "white",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    padding: "12px 16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    color: "#485E75",
                    fontSize: "14px",
                    fontFamily: fontStyles.fontFamily,
                    maxWidth: 280,
                  },
                },
                arrow: {
                  sx: { color: "white" },
                },
              }}
            >
              <Chip
                label="Converted to $ USD"
                size="small"
                sx={{
                  fontSize: "12px",
                  fontFamily: fontStyles.fontFamily,
                  backgroundColor: "#F3F4F6",
                  color: "#374151",
                  fontWeight: 500,
                  cursor: "pointer",
                  '&:hover': {
                    backgroundColor: "#E5E7EB",
                  },
                }}
              />
            </Tooltip>
            <IconButton 
              onClick={handleMenuOpen} 
              size="small"
              sx={{
                color: "#6B7280",
                '&:hover': {
                  backgroundColor: "#F3F4F6",
                },
              }}
            >
              <MoreVert />
            </IconButton>
            <Menu
              id="marketplace-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  minWidth: 180,
                  mt: 1,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleDownloadCSV();
                  handleMenuClose();
                }}
                sx={{
                  color: "#374151",
                  fontFamily: fontStyles.fontFamily,
                  fontSize: "14px",
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#6B7280", minWidth: 36 }}>
                  <InsertDriveFileIcon sx={{ fontSize: "18px" }} />
                </ListItemIcon>
                <ListItemText primary="Download CSV" />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDownloadXLS();
                  handleMenuClose();
                }}
                sx={{
                  color: "#374151",
                  fontFamily: fontStyles.fontFamily,
                  fontSize: "14px",
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#6B7280", minWidth: 36 }}>
                  <Download sx={{ fontSize: "18px" }} />
                </ListItemIcon>
                <ListItemText primary="Download XLS" />
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  color: "#DC2626",
                  fontFamily: fontStyles.fontFamily,
                  fontSize: "14px",
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: "#FEF2F2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#DC2626", minWidth: 36 }}>
                  <Delete sx={{ fontSize: "18px" }} />
                </ListItemIcon>
                <ListItemText primary="Remove" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Metrics Grid */}
        {!loading && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: "Gross Revenue",
                value: `$${
                  allMarketplaceData?.grossRevenue?.current?.toFixed(2) ||
                  "0.00"
                }`,
                change: `${
                  allMarketplaceData?.grossRevenue?.delta < 0 ? "-" : ""
                }$${Math.abs(
                  allMarketplaceData?.grossRevenue?.delta || 0
                ).toFixed(2)}`,
                changeType:
                  allMarketplaceData?.grossRevenue?.delta >= 0 ? "up" : "down",
                color: allMarketplaceData?.grossRevenue?.current < 0 ? "#DC2626" : "#111827",
              },
              {
                title: "Expenses",
                value: `-$${
                  allMarketplaceData?.expenses?.current?.toFixed(2) || "0.00"
                }`,
                change: `${
                  allMarketplaceData?.expenses?.delta < 0 ? "-" : ""
                }$${Math.abs(allMarketplaceData?.expenses?.delta || 0).toFixed(
                  2
                )}`,
                changeType:
                  allMarketplaceData?.expenses?.delta >= 0 ? "up" : "down",
                color: "#DC2626",
              },
              {
                title: "Net Profit",
                value: `$${
                  allMarketplaceData?.netProfit?.current?.toFixed(2) || "0.00"
                }`,
                change: `${
                  allMarketplaceData?.netProfit?.delta < 0 ? "-" : ""
                }$${Math.abs(allMarketplaceData?.netProfit?.delta || 0).toFixed(
                  2
                )}`,
                changeType:
                  allMarketplaceData?.netProfit?.delta >= 0 ? "up" : "down",
                color: allMarketplaceData?.netProfit?.current < 0 ? "#DC2626" : "#059669",
              },
              {
                title: "Units Sold",
                value: `${allMarketplaceData?.unitsSold?.current || "0"}`,
                change: `${allMarketplaceData?.unitsSold?.delta || "0"}`,
                changeType:
                  allMarketplaceData?.unitsSold?.delta >= 0 ? "up" : "down",
                color: "#111827",
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid #F3F4F6",
                    borderRadius: "8px",
                    transition: "all 0.2s ease-in-out",
                    '&:hover': {
                      borderColor: "#E5E7EB",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        ...fontStyles,
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#6B7280",
                        mb: 1,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: fontStyles.fontFamily,
                        fontSize: "28px",
                        fontWeight: 600,
                        color: item.color,
                        mb: 1,
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "14px",
                          fontFamily: fontStyles.fontFamily,
                          color: "#6B7280",
                        }}
                      >
                        {item.change}
                      </Typography>
                      {item.changeType === "up" ? (
                        <ArrowUpwardIcon
                          sx={{ fontSize: "16px", color: "#059669" }}
                        />
                      ) : (
                        <ArrowDownwardIcon
                          sx={{ fontSize: "16px", color: "#DC2626" }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Marketplace Breakdown Section */}
        <Box sx={{ mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            sx={{ 
              cursor: "pointer",
              p: 1,
              borderRadius: "6px",
              '&:hover': {
                backgroundColor: "#F9FAFB",
              },
            }}
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <IconButton
              size="small"
              sx={{
                color: "#3B82F6",
                mr: 1,
                '&:hover': { 
                  backgroundColor: "transparent",
                },
              }}
            >
              {showBreakdown ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                ...fontStyles,
                fontSize: "16px",
                fontWeight: 600,
                color: "#3B82F6",
              }}
            >
              Marketplace Breakdown
            </Typography>
          </Box>
        </Box>

        {/* Collapsible Table */}
        <Collapse in={showBreakdown} timeout="auto" unmountOnExit>
          <Box
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 300,
                  width: "100%",
                }}
              >
                <DottedCircleLoading />
              </Box>
            ) : (
              <Table size="small">
                <TableHead
                  sx={{
                    backgroundColor: "#F9FAFB",
                    "& .MuiTableCell-root": {
                      borderTop: "none",
                      borderBottom: "1px solid #E5E7EB",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell padding="none" sx={{ width: 48 }}></TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Marketplace
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Gross Revenue
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Expenses
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      COGS
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Net Profit
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Margin
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      ROI
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Refunds
                    </TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.025em",
                      }}
                    >
                      Units Sold
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <MarketplaceRow key={index} row={row} index={index} />
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}