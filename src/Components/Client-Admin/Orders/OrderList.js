import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Grid,
  Modal,
  Slide,
  Menu,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider,DatePicker} from '@mui/x-date-pickers';

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FilterList, Refresh, Visibility } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading";
import AddIcon from "@mui/icons-material/Add";
import MannualOrder from "./MannualOrder";
import FilterOrders from "./FilterOrders";
import MarketplaceOption from "../Products/MarketplaceOption";
import ChannelOrder from "./ChannelOrder";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BrandSelector from "../../../utils/BrandSelector";

const OrderList = ({ fetchOrdersFromParent }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [manualOrders, setManualOrders] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [inputValueBrand, setInputValueBrand] = useState("");
  const [brandList, setBrandList] = useState([]);
  const [brandLimit, setBrandLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [customStatus, setCustomStatus] = useState([]);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [searchTerm, setSearchTerm] = useState("");
  const [logoMarket, setLogoMarket] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      const parsedCategory = JSON.parse(storedCategory);
      setSelectedCategory(parsedCategory);
    }
  }, []);

  const userData = localStorage.getItem("user");
    let  userIds=""
    if (userData) {
      const data = JSON.parse(userData);
      userIds = data.id;
    }

  const queryParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(queryParams.get("page")) || 1;
  const initialRowsPerPage = parseInt(queryParams.get("rowsPerPage"), 10) || 25;
  const [page, setPage] = useState(initialPage);
  const [market, setMarket] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    navigate(`/Home/orders?page=${page}&rowsPerPage=${event.target.value}`);
    setPage(1);
  };

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}getBrandListforfilter/`,
          {
            params: {
              search_query: inputValueBrand,
              user_id: userIds,
              limit: brandLimit,
            },
          }
        );
        const names = response.data.data.brand_list || [];
        setBrandList(names);
        setHasMore(names.length >= brandLimit);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrands();
  }, [inputValueBrand, brandLimit, userIds]);

  const fetchOrderData = async (marketId = "all", page, rowsPerPage) => {
    setLoading(true);
    const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 25;
    const skip = (page - 1) * validRowsPerPage;
    try {
      const marketplaceId = localStorage.getItem("selectedCategory")
        ? JSON.parse(localStorage.getItem("selectedCategory")).id
        : "all";

      const response = await axios.post(
        `${process.env.REACT_APP_IP}fetchAllorders/`,
        {
          user_id: userIds,
          skip: skip >= 0 ? skip : 0,
          limit: validRowsPerPage,
          marketplace_id: marketplaceId,
          search_query: searchQuery,
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          timezone: "US/Pacific",
        }
      );

      const responseData = response.data || {};

      setOrders(Array.isArray(responseData.orders) ? responseData.orders : []);

      setLogoMarket(
        Array.isArray(responseData.marketplace_list)
          ? responseData.marketplace_list
          : []
      );

      setOrderCount(responseData.total_count || 0);
      setTotalPages(
        Math.ceil((responseData.total_count || 0) / validRowsPerPage)
      );
      setCustomStatus(responseData.status || "");

      setManualOrders([]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders. Please try again.");
      setOrders([]);
      setManualOrders([]);
      setLogoMarket([]);
      setOrderCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const prevParams = useRef({
    selectedCategoryId: selectedCategory.id,
    page,
    rowsPerPage,
    sortConfig,
    searchQuery,
  });

  useEffect(() => {
    const shouldFetch =
      selectedCategory.id !== prevParams.current.selectedCategoryId ||
      page !== prevParams.current.page ||
      rowsPerPage !== prevParams.current.rowsPerPage ||
      JSON.stringify(sortConfig) !==
        JSON.stringify(prevParams.current.sortConfig) ||
      searchQuery !== prevParams.current.searchQuery;

    if (shouldFetch) {
      fetchOrderData(selectedCategory.id, page, rowsPerPage);
      prevParams.current = {
        selectedCategoryId: selectedCategory.id,
        page,
        rowsPerPage,
        sortConfig,
        searchQuery,
      };
    }
  }, [selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery]);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      const category = JSON.parse(storedCategory);
      setSelectedCategory(category);
    }

    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  }, []);

  const handleClose = () => {
    setOpen(false);
    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  };

  const filteredOrders = orders.filter((order) => {
    const purchaseOrderId = order.purchaseOrderId
      ? order.purchaseOrderId.toLowerCase()
      : "";
    const customerOrderId = order.customerOrderId
      ? order.customerOrderId.toLowerCase()
      : "";
    return (
      purchaseOrderId.includes(searchQuery.toLowerCase()) ||
      customerOrderId.includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleChangePage = (event, newPage) => {
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`);
    setPage(newPage);
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setAnchorEl(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProduct = (category) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetChange = () => {
    setSearchQuery("");
    setSortConfig({ key: "", direction: "asc" });
    setSelectedCategory({ id: "all", name: "All Channels" });
    localStorage.setItem(
      "selectedCategory",
      JSON.stringify({ id: "all", name: "All Channels" })
    );
    setPage(1);
    toast.success("Reset Successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleDownload = async () => {
    try {
      // Validate inputs
      if (selectedBrand.length === 0 && (!downloadStartDate || !downloadEndDate)) {
  toast.error("Please select at least one brand OR a valid date range");
  return;
}
if (
  downloadStartDate &&
  downloadEndDate &&
  new Date(downloadEndDate) < new Date(downloadStartDate)
) {
  toast.error("End date must be after start date");
  return;
}

      const startDate = new Date(downloadStartDate);
      const endDate = new Date(downloadEndDate);
      if (endDate < startDate) {
        toast.error("End date must be after start date");
        return;
      }

      // Prepare request data
      const brandIds = selectedBrand.map(b => b.id);
      const requestData = {};

if (selectedBrand.length > 0) {
  requestData.brands = selectedBrand.map((b) => b.id);
}

if (downloadStartDate && downloadEndDate) {
  requestData.start_date = downloadStartDate;
  requestData.end_date = downloadEndDate;
}

requestData.format = downloadFormat;

      // Show loading state
      setIsLoading(true);

      // Make API call
      const response = await axios.post(
        `${process.env.REACT_APP_IP}downloadOrders/`,
        requestData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.${downloadFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);

      // Close modal and reset state
      setDownloadModalOpen(false);
      setSelectedBrand([]);
      setDownloadStartDate("");
      setDownloadEndDate("");
      setDownloadFormat("csv");

      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          my: 2,
          justifyContent: "flex-end",
          alignItems: "center",
          position: "fixed",
          top: 0,
          right: 0,
          marginTop: "20px",
          width: "108%",
          backgroundColor: "white",
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            my: 2,
            marginRight: "4%",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "6%",
            width: "100%",
          }}
        >
          <Box sx={{ marginTop: "-7px" }}>
            <ChannelOrder
              handleProduct={handleProduct}
              clearChannel={selectedCategory}
            />
          </Box>

          <TextField
            size="small"
            placeholder="Search Purchase Order ID"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: 300,
              "& input": {
                fontSize: "14px",
              },
            }}
          />
          {selectedCategory.id == "custom" && (
            <Button
              variant="text"
              color="primary"
              sx={{
                backgroundColor: "#000080",
                fontSize: "14px",
                color: "white",
                fontWeight: 400,
                minWidth: "auto",
                padding: "8px 17px",
                textTransform: "capitalize",
                height: "35px",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
              }}
              onClick={handleOpen}
            >
              <AddIcon sx={{ marginRight: "3px" }} />
              Create Order
            </Button>
          )}
            <Button
    variant="contained"
    color="primary"
    onClick={() => setDownloadModalOpen(true)}
    sx={{ 
      marginLeft: "10px",
      backgroundColor: "#000080",
      "&:hover": {
        backgroundColor: "darkblue",
      }
    }}
  >
    Download orders
  </Button>
          <Tooltip title="Reset" arrow>
            <Button
              variant="outlined"
              sx={{
                backgroundColor: "#000080",
                minWidth: "auto",
                padding: "6px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
              }}
              onClick={handleResetChange}
            >
              <Refresh sx={{ color: "white", fontSize: "20px" }} />
            </Button>
          </Tooltip>
          <Typography variant="body2">
            Total Orders: {orderCount ? orderCount : "0"}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setDownloadModalOpen(true)}
        sx={{ margin: "16px 0" }}
      >
        Download orders
      </Button>

      <Box sx={{ paddingTop: "150px" }}>
        {customStatus === "custom" ? (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "70vh",
              display: "flex",
              justifyContent: "center",
              overflowY: "overlay",
              overflowX: "overlay",
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
            <Table sx={{ minWidth: 650, margin: "0 auto" }}>
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "#f6f6f6",
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Purchase Order Id
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Customer Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Order Date
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Currency
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}
                  >
                    Quantity
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "total_quantity")}
                    >
                      <MoreVertIcon
                        sx={{ fontSize: "14px", paddingRight: "3px" }}
                      />
                    </IconButton>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}
                  >
                    Order Value
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "total_price")}
                    >
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <DottedCircleLoading />
                    </TableCell>
                  </TableRow>
                ) : manualOrders && manualOrders.length > 0 ? (
                  manualOrders.map((order, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() =>
                        navigate(
                          `/Home/orders/customList/${order.id}?page=${page}`
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell
                        sx={{
                          textAlign: "center",
                          minWidth: 140,
                          width: 140,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {order.order_id ? order.order_id : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          minWidth: 120,
                          width: 120,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {order.customer_name ? order.customer_name : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{ textAlign: "center", minWidth: 120, width: 120 }}
                      >
                        {order.purchase_order_date
                          ? new Date(order.purchase_order_date).toLocaleString(
                              undefined,
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: systemTimeZone,
                              }
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        {order.currency ? order.currency : "USD"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ paddingLeft: "3px", minWidth: 130, width: 130 }}
                      >
                        {order.total_quantity ? order.total_quantity : "N/A"}
                      </TableCell>
                      <TableCell align="center" sx={{ paddingLeft: "3px" }}>
                        {order.total_price && !isNaN(order.total_price)
                          ? `$${order.total_price.toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          minWidth: 120,
                          width: 120,
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {order.order_status ? order.order_status : "N/A"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Tooltip title="View Order Details" arrow>
                          <Button
                            variant="text"
                            sx={{ color: "#000080" }}
                            onClick={() => handleOpen}
                          >
                            <Visibility sx={{ fontSize: 20 }} />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : !loading && (!manualOrders || manualOrders.length === 0) ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ fontWeight: "bold", color: "red" }}
                    >
                      No Custom Orders Found
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}

        {customStatus !== "custom" ? (
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "70vh",
              overflowY: "overlay",
              overflowX: "overlay",
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
            <Table sx={{ minWidth: 650 }}>
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: "#f6f6f6",
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Purchase Order ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Channel Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Order Date
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "order_date")}
                    >
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Currency
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Quantity
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "items_order_quantity")}
                    >
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Order Value
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "order_total")}
                    >
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                      backgroundColor: "#f6f6f6",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <DottedCircleLoading />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ fontWeight: "bold", color: "red" }}
                    >
                      No Orders To Show
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const marketplace = logoMarket.find(
                      (market) => market.name === order.marketplace_name
                    );
                    return (
                      <TableRow
                        key={order.id}
                        hover
                        onClick={() =>
                          navigate(
                            `/Home/orders/details/${order.id}?page=${page}&rowsPerPage=${rowsPerPage}`
                          )
                        }
                        state={{ searchQuery: searchTerm }}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ textAlign: "center" }}>
                          {order.purchase_order_id}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {marketplace && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {marketplace.image_url ? (
                                <img
                                  src={marketplace.image_url}
                                  alt={marketplace.name}
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginRight: 8,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginRight: 8,
                                    backgroundColor: "#ccc",
                                  }}
                                />
                              )}
                              {marketplace.marketplace_name}
                            </div>
                          )}
                          {order.marketplace_name}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", paddingLeft: "3px" }}
                        >
                          {order.order_date
                            ? new Date(order.order_date).toLocaleString(
                                undefined,
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                  timeZone: "US/Pacific",
                                }
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {order.currency}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", paddingLeft: "3px" }}
                        >
                          {order.items_order_quantity
                            ? order.items_order_quantity
                            : "N/A"}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", paddingLeft: "3px" }}
                        >
                          $
                          {order.order_total && !isNaN(order.order_total)
                            ? order.order_total.toFixed(2)
                            : "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {order.order_status || "N/A"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Tooltip title="View Order Details" arrow>
                            <Button variant="text" sx={{ color: "#000080" }}>
                              <Visibility sx={{ fontSize: 20 }} />
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          mt: 2,
        }}
      >
        <Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          size="small"
          sx={{ minWidth: 70 }}
        >
          <MenuItem value={25}>25/page</MenuItem>
          <MenuItem value={50}>50/page</MenuItem>
          <MenuItem value={75}>75/page</MenuItem>
        </Select>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          color="primary"
          size="small"
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 900,
              height: "100vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 3,
            }}
          >
            <MannualOrder handleClose={handleClose} />
          </Box>
        </Slide>
      </Modal>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {currentColumn === "customer_name" && (
          <>
            <MenuItem onClick={() => handleSelectSort("customer_name", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("customer_name", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
        {currentColumn === "total_price" && (
          <>
            <MenuItem onClick={() => handleSelectSort("total_price", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("total_price", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "items_order_quantity" && (
          <>
            <MenuItem
              onClick={() => handleSelectSort("items_order_quantity", "asc")}
            >
              Sort Low to High
            </MenuItem>
            <MenuItem
              onClick={() => handleSelectSort("items_order_quantity", "desc")}
            >
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "order_date" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_date", "asc")}>
              Oldest
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_date", "desc")}>
              Latest
            </MenuItem>
          </>
        )}
        {currentColumn === "order_total" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_total", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_total", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "total_quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("total_quantity", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem
              onClick={() => handleSelectSort("total_quantity", "desc")}
            >
              Sort High to Low
            </MenuItem>
          </>
        )}
      </Menu>

      <Modal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Download Orders
          </Typography>

          <BrandSelector
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            brandList={brandList}
            inputValueBrand={inputValueBrand}
            setInputValueBrand={setInputValueBrand}
            brandLimit={brandLimit}
            isLoading={isLoading}
            hasMore={hasMore}
            toggleSelection={(option) => {
              const isSelected = selectedBrand.some((b) => b.id === option.id);
              if (isSelected) {
                setSelectedBrand(
                  selectedBrand.filter((b) => b.id !== option.id)
                );
              } else {
                setSelectedBrand([...selectedBrand, option]);
              }
            }}
            label="Brands"
            width={190}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={downloadStartDate}
              onChange={(newValue) => setDownloadStartDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mb: 2, mt: 2 }} />
              )}
              maxDate={new Date(downloadEndDate)}
            />
            <DatePicker
              label="End Date"
              value={downloadEndDate}
              onChange={(newValue) => setDownloadEndDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ mb: 2 }} />
              )}
              minDate={new Date(downloadStartDate)}
            />
          </LocalizationProvider>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={downloadFormat}
              label="Format"
              onChange={(e) => setDownloadFormat(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            fullWidth
           disabled={
  (selectedBrand.length === 0 && (!downloadStartDate || !downloadEndDate)) ||
  isLoading
}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Preparing Download..." : "Download"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default OrderList;