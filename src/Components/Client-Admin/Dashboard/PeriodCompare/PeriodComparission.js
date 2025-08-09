import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Download, Delete } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { saveAs } from "file-saver";
import { InsertDriveFile } from "@mui/icons-material";
import DottedCircleLoading from "../../../Loading/DotLoading";
import SkeletonTableMyProducts from "../MyProducts/ProductsLoading/MyProductLoading";
dayjs.extend(utc);
dayjs.extend(timezone);

function PeriodComparission({
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
}) {
  const [periodData, setPeriodData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadCSV = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";

      const response = await axios.post(
        `${process.env.REACT_APP_IP}exportPeriodWiseCSV/`,
        {
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, "period-data.csv");
    } catch (error) {
      console.error("CSV Download Error:", error);
    }
  };

  const handleDownloadXLS = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getPeriodWiseDataXl/`,
        {
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "period-data.xlsx");
    } catch (error) {
      console.error("XLS Download Error:", error);
    }
  };

  const fetchPeriodComparission = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id || "";

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getPeriodWiseData/`,
        {
          user_id: userId,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );
          let responseData = response.data;
       if (typeof responseData === "string") {
      try {
        // Step 2: Replace all occurrences of ": NaN" with ": null" to create valid JSON.
        // We use a Regular Expression to be safe and not replace "NaN" if it appears in a string value.
        const correctedJSONString = responseData.replace(/:\s*NaN/g, ":null");

        // Step 3: Manually parse the now-valid JSON string.
        responseData = JSON.parse(correctedJSONString);
      } catch (e) {
        console.error("Failed to parse corrected JSON string:", e);
        // If parsing still fails, default to an empty object to prevent crashes.
        responseData = {};
      }
    }
      const periods = response.data || {};

      const formattedData = Object.keys(periods)
        .filter((key) => periods[key]?.label)
        .map((key) => {
          const item = periods[key];

          // Format as per UTC, but only take the date part
          const currentDateFrom = dayjs
            .utc(item.period.current.from)
            .format("MMM D");
          const currentDateTo = dayjs
            .utc(item.period.current.to)
            .format("MMM D, YYYY");

          return {
            period: item.label || "",
            dateRange: `${currentDateFrom} - ${currentDateTo}`,
            grossRevenue: item.grossRevenue?.current || 0,
            expenses: item.expenses?.current || 0,
            netProfit: item.netProfit?.current || 0,
            margin: item.margin?.current || 0,
            roi: item.roi?.current || 0,
            refunds: item.refunds?.current || 0,
            unitsSold: item.unitsSold?.current || 0,
            skuCount: item.skuCount?.current || 0,
            pageViews: item.pageViews?.current || 0,
            sessions: item.sessions?.current || 0,
            unitsessions: item.unitSessionPercentage?.current || 0,
            conversionRate: item.unitSessionPercentage?.current || 0,
            grossRevenuePrev: item.grossRevenue?.previous || 0,
            netProfitPrev: item.netProfit?.previous || 0,
            marginPrev: item.margin?.previous || 0,
            grossRevenueDelta: item.grossRevenue?.delta || 0,
            netProfitDelta: item.netProfit?.delta || 0,
            marginDelta: item.margin?.delta || 0,
          };
        });

      setPeriodData(formattedData);
      console.log("Formatted Period Data:", formattedData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setPeriodData([]);
    } finally {
      setLoading(false);
    }
  };

  let lastParamsRef = useRef("");

  useEffect(() => {
    const currentParams = JSON.stringify({
      marketplace_id: marketPlaceId?.id,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
    });

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchPeriodComparission();
    }
  }, [
    marketPlaceId,
    brand_id,
    product_id,
    manufacturer_name,
    fulfillment_channel,
  ]);

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 1,
        width: "99%",
        boxShadow: "none",
        border: "solid 1px #ddd",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
            }}
          >
            Period Comparison
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#485E75",
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            }}
            variant="body2"
            color="text.secondary"
          >
            {dayjs().tz("US/Pacific").format("MMM D, YYYY")}
          </Typography>
        </Box>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: 200,
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleDownloadCSV();
              handleClose();
            }}
            sx={{
              color: "#485E75",
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <ListItemIcon sx={{ color: "#485E75", minWidth: 36 }}>
              <InsertDriveFile
                sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }}
              />
            </ListItemIcon>
            <ListItemText primary="Download CSV" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleDownloadXLS();
              handleClose();
            }}
            sx={{
              color: "#485E75",
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <ListItemIcon sx={{ color: "#485E75", minWidth: 36 }}>
              <Download sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }} />
            </ListItemIcon>
            <ListItemText primary="Download XLS" />
          </MenuItem>

          <MenuItem
            onClick={handleClose}
            sx={{
              color: "#485E75",
              fontFamily: "'Nunito Sans', sans-serif",
              fontSize: 14,
            }}
          >
            <ListItemIcon sx={{ color: "#485E75", minWidth: 36 }}>
              <Delete sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }} />
            </ListItemIcon>
            <ListItemText primary="Remove" />
          </MenuItem>
        </Menu>
      </Box>
      <TableContainer
        sx={{
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: 4, // 🔽 Reduced from 4 to 2
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(166, 183, 201)",
            borderRadius: 10,
            minHeight: 4,
            "&:hover": {
              backgroundColor: "rgb(166, 183, 201)",
            },
            "&:active": {
              backgroundColor: "rgb(103, 132, 162)",
            },
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
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
              height: "100%",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <SkeletonTableMyProducts />
            </Box>
          </Box>
        ) : (
          <Table sx={{ minWidth: 1200 }} aria-label="period comparison table">
            <TableHead>
              <TableRow>
                {[
                  "Period",
                  "Gross Revenue",
                  "Expenses",
                  "Net Profit",
                  "Margin",
                  "ROI",
                  "Refunds",
                  "Units Sold",
                  "SKU Count",
                  "Page Views",
                  "Sessions",
                  "Unit Session %",
                ].map((label, idx) => (
                  <TableCell
                    key={label}
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: idx === 0 ? "start" : "end", // Only 'Period' is left-aligned
                      backgroundColor: "rgb(242, 245, 247)",
                      color: "#485E75",
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {periodData.map((row) => (
                <TableRow key={row.period}>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#485E75",
                      width: "145px",
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textAlign: "start",
                        fontSize: "16px",
                        color: "#13191F",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                      }}
                    >
                      {row.period}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: "start",
                        fontSize: "14px",
                        color: "#6b7280",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                      }}
                    >
                      {row.period === "Yesterday"
                        ? new Date(
                            row.dateRange.split(" - ")[0] +
                              ", " +
                              row.dateRange.split(" - ")[1].split(", ")[1]
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : row.dateRange}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      textAlign: "end",
                      fontSize: "14px",
                      color: "#485E75",
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}
                  >
                    $
                    {row.grossRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>

                  {[row.expenses, row.netProfit].map((val, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        fontSize: "14px",
                        color: "#485E75",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                         textAlign: 'end', // Center-aligns the text
                      }}
                    >
                      $
                      {val.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  ))}

                  {[
                    `${row.margin?.toFixed(2)}%`,
                    `${row.roi?.toFixed(2)}%`,
                    row.refunds.toLocaleString(),
                    row.unitsSold.toLocaleString(),
                    row.skuCount.toLocaleString(),
                    row.pageViews.toLocaleString(),
                    row.sessions.toLocaleString(),
                    // row.unitsessions.toLocaleString(),
                    `${row.unitsessions?.toFixed(2)}%`,
                    // `${row.conversionRate?.toFixed(2)}%`,
                  ].map((val, i) => (
                    <TableCell
                      key={i + 2}
                      sx={{
                        textAlign: "end",
                        fontSize: "14px",
                        color: "#485E75",
                        fontFamily:
                          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                      }}
                    >
                      {val}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Paper>
  );
}

export default PeriodComparission;
