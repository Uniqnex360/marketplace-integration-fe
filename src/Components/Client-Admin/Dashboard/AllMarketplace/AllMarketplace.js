"use client"

import { useEffect, useState, useRef } from "react"
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
} from "@mui/material"
import { Download, Delete, KeyboardArrowDown, KeyboardArrowUp, MoreVert } from "@mui/icons-material"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"
import { saveAs } from "file-saver"
import axios from "axios"
import dayjs from "dayjs"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import DottedCircleLoading from "../../../Loading/DotLoading"

const fontStyles = {
  fontSize: "16px",
  color: "#485E75",
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
}

function MarketplaceRow({ row, index }) {
  const [open, setOpen] = useState(false)
  const isFirstRow = index === 0
  const cellStyle = {
    ...fontStyles,
    color: "black",
    fontWeight: 600,
    fontSize: "14px",
  }

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return "-"
    const number = Number(value)
    const formatted = number.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    })
    return formatted
  }

  return (
    <>
      <TableRow sx={{ ...fontStyles, borderBottom: "none" }}>
        <TableCell padding="none" sx={{ borderBottom: "none" }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>{row.currency_list[0]?.margin?.toFixed(2)}%</TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>{row.currency_list[0]?.roi?.toFixed(2)}%</TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>{row.currency_list[0]?.refunds}</TableCell>
        <TableCell sx={{ ...cellStyle, borderBottom: "none" }}>{row.currency_list[0]?.unitsSold}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>{/* Add more details here if needed */}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
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
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)
  const [marketplaceData, setMarketplaceData] = useState(null)
  const [openTooltip, setOpenTooltip] = useState(false)
  const [loading, setLoading] = useState(false)

  // CardComponent states
  const [orderData, setOrderData] = useState([])
  const [totalOrders, setTotalOrders] = useState(0) 
  const [cardLoading, setCardLoading] = useState(true)

  const lastParamsRef = useRef("")

  const handleTooltipOpen = () => {
    setOpenTooltip(true)
  }

  const handleTooltipClose = () => {
    setOpenTooltip(false)
  }

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
        { responseType: "blob" },
      )
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      })
      saveAs(blob, "marketplace-data.csv")
    } catch (error) {
      console.error("CSV Download Error:", error)
    }
  }

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
        { responseType: "blob" },
      )
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, "marketplace-data.xlsx")
    } catch (error) {
      console.error("XLS Download Error:", error)
    }
  }

  const fetchOrderData = async () => {
    try {
      const userData = localStorage.getItem("user")
      let userIds = ""
      if (userData) {
        const data = JSON.parse(userData)
        userIds = data.id
      }

      const orderSam = await axios.get(`${process.env.REACT_APP_IP}ordersCountForDashboard/`, {
        params: {
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          start_date: DateStartDate,
          end_date: DateEndDate,
          user_id: userIds,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })

      if (orderSam.data?.data) {
        const { total_order_count, ...marketplaces } = orderSam.data.data
        setTotalOrders(total_order_count?.value || 0)

        if (marketPlaceId.id === "all") {
          const pieData = Object.entries(marketplaces).map(([name, data]) => {
            let color
            if (name === "Amazon") color = "#0b3954"
            else if (name === "Walmart") color = "#ff6663"
            else if (name === "custom") color = "#9381ff"
            else color = getRandomColor()

            return {
              name,
              value: data?.count || 0,
              percentage: Number.parseFloat(data?.percentage || 0).toFixed(2),
              color: color,
              orderValue: data?.order_value || 0,
            }
          })
          setOrderData(pieData)
        } else {
          const marketplaceName = Object.keys(marketplaces)[0]
          const marketplaceData = marketplaces[marketplaceName]
          if (marketplaceData) {
            let color = "#000000"
            if (marketplaceName === "Amazon") color = "#0b3954"
            else if (marketplaceName === "Walmart") color = "#ff6663"
            else if (marketplaceName === "custom") color = "#9381ff"

            setOrderData([
              {
                name: marketplaceName,
                value: marketplaceData.value || marketplaceData.count,
                percentage: Number.parseFloat(marketplaceData.percentage || 0).toFixed(2),
                color: color,
                orderValue: marketplaceData?.order_value || 0,
              },
            ])
          } else {
            setOrderData([])
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order data:", error)
    } finally {
      setCardLoading(false)
    }
  }

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF"
    let color = "#"
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const fromDate = marketplaceData?.from_date
  const toDate = marketplaceData?.to_date
  const formattedCurrentDate = fromDate ? dayjs(fromDate).format("MMM DD, YYYY") : ""
  const formattedDateRange =
    fromDate && toDate ? `${dayjs(fromDate).format("MMM DD, YYYY")} - ${dayjs(toDate).format("MMM DD, YYYY")}` : ""

  const fetchAllMarketplace = async () => {
    setLoading(true)
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}")
      const userId = userData?.id || ""
      const response = await axios.post(`${process.env.REACT_APP_IP}allMarketplaceData/`, {
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
      })
      setMarketplaceData(response.data)
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

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
    })

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams
      fetchAllMarketplace()
      fetchOrderData()
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
  ])

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const rows = marketplaceData?.custom?.marketplace_list || []
  const allMarketplaceData = marketplaceData?.custom?.all_marketplace || {}

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          boxShadow: "none",
          p: 4,
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                ...fontStyles,
                fontWeight: 600,
                fontSize: "20px",
                color: "#111827",
              }}
            >
              All Marketplaces
            </Typography>
            <Typography sx={{ ...fontStyles, fontSize: "14px", mb: 0.5 }}>
              {widgetData === "Today" || widgetData === "Yesterday" ? formattedCurrentDate : formattedDateRange}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Tooltip
              title={
                <Typography sx={{ fontWeight: 100, fontSize: "14px", color: "#485E75" }}>
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
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    color: "#485E75",
                    fontSize: "14px",
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
                  fontFamily:
                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  backgroundColor: "rgb(227, 214, 245)",
                  color: "#51228F",
                  fontWeight: 500,
                  mr: 1,
                  cursor: "pointer",
                }}
              />
            </Tooltip>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVert />
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{ "aria-labelledby": "long-button" }}
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
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
                  handleDownloadCSV()
                  handleMenuClose()
                }}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 14,
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <InsertDriveFileIcon sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Download CSV"
                />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleDownloadXLS()
                  handleMenuClose()
                }}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 14,
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <Download sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Download XLS"
                />
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  color: "rgb(72, 94, 117)",
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 14,
                }}
              >
                <ListItemIcon sx={{ color: "rgb(72, 94, 117)", minWidth: 36 }}>
                  <Delete sx={{ color: "rgb(72, 94, 117)", fontSize: "16px" }} />
                </ListItemIcon>
                <ListItemText
                  sx={{
                    fontFamily:
                      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontSize: "16px",
                  }}
                  primary="Remove"
                />
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3} mb={3}>
          {/* Left side - Metrics */}
          <Grid item xs={12} md={8}>
            {!loading && (
              <Grid container spacing={3}>
                {[
                  {
                    title: "Gross Revenue",
                    value: `$${allMarketplaceData?.grossRevenue?.current?.toFixed(2) || "0.00"}`,
                    change: `${allMarketplaceData?.grossRevenue?.delta < 0 ? "-" : ""}$${Math.abs(allMarketplaceData?.grossRevenue?.delta || 0).toFixed(2)}`,
                    changeType: allMarketplaceData?.grossRevenue?.delta >= 0 ? "up" : "down",
                  },
                  {
                    title: "Expenses",
                    value: `-$${allMarketplaceData?.expenses?.current?.toFixed(2) || "0.00"}`,
                    change: `${allMarketplaceData?.expenses?.delta < 0 ? "-" : ""}$${Math.abs(allMarketplaceData?.expenses?.delta || 0).toFixed(2)}`,
                    changeType: allMarketplaceData?.expenses?.delta >= 0 ? "up" : "down",
                  },
                  {
                    title: "Net Profit",
                    value: `$${allMarketplaceData?.netProfit?.current?.toFixed(2) || "0.00"}`,
                    change: `${allMarketplaceData?.netProfit?.delta < 0 ? "-" : ""}$${Math.abs(allMarketplaceData?.netProfit?.delta || 0).toFixed(2)}`,
                    changeType: allMarketplaceData?.netProfit?.delta >= 0 ? "up" : "down",
                  },
                  {
                    title: "Units Sold",
                    value: `${allMarketplaceData?.unitsSold?.current || "0"}`,
                    change: `${allMarketplaceData?.unitsSold?.delta || "0"}`,
                    changeType: allMarketplaceData?.unitsSold?.delta >= 0 ? "up" : "down",
                  },
                ].map((item, idx) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={idx}
                    sx={{
                      borderLeft: idx !== 0 && idx % 2 === 0 ? "1px solid #e0e0e0" : "none",
                      pl: idx !== 0 && idx % 2 === 0 ? 3 : 0,
                    }}
                  >
                    <Typography sx={{ ...fontStyles, fontWeight: 500, mb: 1 }}>{item.title}</Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: fontStyles.fontFamily,
                        fontSize: "28px",
                        color: "#111827",
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "14px",
                        fontFamily: fontStyles.fontFamily,
                        color: "#485E75",
                        display: "flex",
                        alignItems: "center",
                        mt: 0.5,
                      }}
                    >
                      {item.change}
                      <Box
                        component="span"
                        sx={{
                          color: item.changeType === "down" ? "#dc2626" : "#16a34a",
                          fontSize: "14px",
                          ml: 0.5,
                        }}
                      >
                        {item.changeType === "down" ? (
                          <ArrowDownwardIcon sx={{ fontSize: "14px", color: "red" }} />
                        ) : (
                          <ArrowUpwardIcon sx={{ fontSize: "14px", color: "rgb(51, 204, 153)" }} />
                        )}
                      </Box>
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Right side - Orders Chart */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                  🛒 Total Orders
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: "24px", color: "#111827" }}>
                  {totalOrders}
                </Typography>
              </Box>

              {cardLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                  <DottedCircleLoading />
                </Box>
              ) : totalOrders > 0 ? (
                <Box sx={{ flexGrow: 1 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={orderData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={30}
                        outerRadius={60}
                        label={({ name }) => name}
                      >
                        {orderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          const { payload } = props
                          if (payload) {
                            // Find the corresponding marketplace data
                            const marketplaceData = orderData.find((item) => item.name === payload.name)
                            if (marketplaceData) {
                              const orderValue = marketplaceData.orderValue || 0
                              return [`Order Count: ${marketplaceData.value}`, `Order Value: $${orderValue.toFixed(2)}`]
                            }
                          }
                          return [value]
                        }}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{
                          fontSize: "14px",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        itemStyle={{
                          color: "#485E75",
                          fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        }}
                      />
                      <Legend
                        formatter={(value, entry) => (
                          <span style={{ fontSize: "12px", color: entry.color }}>
                            {value} ({entry.payload.percentage}%)
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", color: "#888" }}
                  >
                    No total orders found
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Marketplace Breakdown Section */}
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          sx={{ cursor: "pointer" }}
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <IconButton
            size="small"
            sx={{
              color: "rgb(10, 111, 232)",
              "&:hover": { color: "rgb(2, 83, 182)" },
            }}
          >
            {showBreakdown ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              ...fontStyles,
              fontSize: "14px",
              fontWeight: 600,
              color: "rgb(10, 111, 232)",
              "&:hover": { color: "rgb(2, 83, 182)" },
            }}
          >
            Marketplace Breakdown
          </Typography>
        </Box>

        <Collapse in={showBreakdown} timeout="auto" unmountOnExit>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
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
                  <DottedCircleLoading />
                </Box>
              </Box>
            ) : (
              <Table size="small">
                <TableHead
                  sx={{
                    backgroundColor: "#f3f4f6",
                    "& .MuiTableCell-root": {
                      borderTop: "none",
                      borderBottom: "none",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell padding="none"></TableCell>
                    <TableCell
                      sx={{
                        ...fontStyles,
                        fontSize: "12px",
                        color: "#485E75",
                        borderTop: "none",
                      }}
                    >
                      Marketplace
                    </TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Gross Revenue</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Expenses</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>COGS</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Net Profit</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Margin</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>ROI</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Refunds</TableCell>
                    <TableCell sx={{ ...fontStyles, fontSize: "12px", color: "#485E75" }}>Units Sold</TableCell>
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
  )
}
