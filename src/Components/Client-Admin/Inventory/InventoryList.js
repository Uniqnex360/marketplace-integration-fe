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
} from "@mui/material";
import { FilterList, Refresh, Visibility } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading"; // Assuming this is your loading spinner component
import AddIcon from "@mui/icons-material/Add"; // Import the AddIcon
import FilterInventory from "../Inventory/FilterInventory";

import soon from "../../assets/soon.png"; // Fallback image
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InventoryChannel from "./InventoryCahnnel";

const InventoryList = ({ fetchOrdersFromParent }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inventoryList, setInventory] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [orderCount, setOrderCount] = useState(0);
  const [customStatus, setCustomStatus] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Changed from searchTerm to searchQuery for consistency
  const [logoMarket, setLogoMarket] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading as true
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });

  const [open, setOpen] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);

  const initialPage = parseInt(queryParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);
  // Removed `market` state as it wasn't clearly used.

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Re-fetch orders after modal close to ensure data is fresh if something was edited/added
    fetchOrderData(selectedCategory.id, page, rowsPerPage);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`); // Update the URL
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to the first page when rows per page changes
    navigate(`/Home/orders?page=1&rowsPerPage=${newRowsPerPage}`); // Update URL
  };

  // Ref to track previous params for comparison
  const prevParams = useRef({
    selectedCategoryId: selectedCategory.id,
    page,
    rowsPerPage,
    sortConfig,
    searchQuery,
  });

  // Function to fetch data
  const fetchOrderData = async (marketId, currentPage, currentRowsPerPage, currentSortConfig, currentSearchQuery) => {
    setLoading(true); // Set loading to true at the start of every fetch
    const validRowsPerPage = currentRowsPerPage && currentRowsPerPage > 0 ? currentRowsPerPage : 25; // Default to 25
    const skip = (currentPage - 1) * validRowsPerPage;

    try {
      const userData = localStorage.getItem("user");
      let userIds = "";
      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }

      // Use the marketplaceId passed to the function or default
      const marketplaceIdToUse = marketId || (localStorage.getItem("selectedCategory")
        ? JSON.parse(localStorage.getItem("selectedCategory")).id
        : "all");

      const response = await axios.post(
        `${process.env.REACT_APP_IP}fetchInventryList/`,
        {
          user_id: userIds,
          skip: skip >= 0 ? skip : 0,
          limit: validRowsPerPage,
          marketplace_id: marketplaceIdToUse,
          search_query: currentSearchQuery,
          sort_by: currentSortConfig.key,
          sort_by_value: currentSortConfig.direction === "asc" ? 1 : -1,
        }
      );

      if (response.data.data.inventry_list) {
        setInventory(response.data.data.inventry_list);
        setCustomStatus(response.data.data.status);
        setOrderCount(response.data.data.total_count);
        setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
        setLogoMarket(
          Array.isArray(response.data.data.marketplace_list)
            ? response.data.data.marketplace_list
            : []
        );
      } else {
        setInventory([]); // Ensure inventoryList is empty if no data is returned
        setOrderCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventory([]); // Clear inventory on error
      setOrderCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false); // Set loading to false once fetch is complete (success or error)
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    let initialCategory = { id: "all", name: "All Channels" };
    if (storedCategory) {
      initialCategory = JSON.parse(storedCategory);
      setSelectedCategory(initialCategory);
    }

    // Set initial search query from URL state if available
    if (location.state && location.state.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }

    // Perform the initial data fetch using current states
    fetchOrderData(
      initialCategory.id,
      page,
      rowsPerPage,
      sortConfig,
      location.state?.searchQuery || "" // Use search query from location state for initial fetch if present
    );

    // Update prevParams after the initial fetch
    prevParams.current = {
      selectedCategoryId: initialCategory.id,
      page,
      rowsPerPage,
      sortConfig,
      searchQuery: location.state?.searchQuery || "",
    };
  }, []); // Empty dependency array means this runs only once on mount

  // Effect to re-fetch data when relevant state changes
  useEffect(() => {
    const shouldFetch =
      selectedCategory.id !== prevParams.current.selectedCategoryId ||
      page !== prevParams.current.page ||
      rowsPerPage !== prevParams.current.rowsPerPage ||
      JSON.stringify(sortConfig) !== JSON.stringify(prevParams.current.sortConfig) ||
      searchQuery !== prevParams.current.searchQuery;

    if (shouldFetch) {
      fetchOrderData(selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery);

      prevParams.current = {
        selectedCategoryId: selectedCategory.id,
        page,
        rowsPerPage,
        sortConfig,
        searchQuery,
      };
    }
  }, [selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery]);


  // Filter orders (this client-side filtering might not be needed if API handles search_query)
  // Re-evaluating this based on your API structure. The API already takes `search_query`.
  // So, this local filtering is likely redundant or should be removed.
  // const filteredOrders = inventoryList.filter((order) => {
  //   const productTitle = order.product_title ? order.product_title.toLowerCase() : "";
  //   const sku = order.sku ? order.sku.toLowerCase() : "";
  //   return (
  //     productTitle.includes(searchQuery.toLowerCase()) ||
  //     sku.includes(searchQuery.toLowerCase())
  //   );
  // });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset page to 1 on new search
  };

  // Dropdown open menu
  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column); // Set column for sorting
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1); // Reset page to 1 when sorting is applied
    setAnchorEl(null); // Close the menu after selection
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProduct = (category) => {
    setSelectedCategory(category); // Update the selected category
    setPage(1); // Reset page to 1 when category changes
    localStorage.setItem("selectedCategory", JSON.stringify(category)); // Persist selection
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // You would typically re-fetch data with these new filters
    // This might require extending `fetchOrderData` to accept filter objects.
  };

 const handleResetChange = () => {
  console.log("Reset triggered");
  setSearchQuery("");
  setSortConfig({ key: "", direction: "asc" });
  setPage(1);
  toast.success("Filters reset successfully!", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
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
          {/* Inventory Channel component for marketplace selection */}
          <Box sx={{ marginTop: "-7px" }}>
            <InventoryChannel handleProduct={handleProduct} />
          </Box>

          <TextField
            size="small"
            placeholder="Search by Product Title, Sku..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: 300,
              "& input": {
                fontSize: "14px",
              },
            }}
          />

          {/* Filter button (currently commented out functionality for FilterInventory) */}
          {/* <Tooltip title="Filter" arrow>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                backgroundColor: "#000080",
                color: "white",
                minWidth: "auto",
                padding: "6px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "darkblue",
                },
              }}
              onClick={() => setShowFilter(!showFilter)}
            >
              <FilterList sx={{ color: "white", fontSize: "20px" }} />
            </Button>

            {showFilter && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  top: "50px",
                  marginTop: "6%",
                  right: "30px",
                  width: "300px",
                  padding: "10px",
                  backgroundColor: "white",
                  zIndex: 1000,
                }}
              >
                <Typography variant="h6">Filter Orders</Typography>
                <FilterInventory onFilterChange={handleFilterChange} />
              </Paper>
            )}
          </Tooltip> */}

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
              onClick={handleResetChange} // Directly call handleResetChange
            >
              <Refresh sx={{ color: "white", fontSize: "20px" }} />
            </Button>
          </Tooltip>

          <Typography variant="body2">
            Total Inventory: {orderCount ? orderCount : "0"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ paddingTop: "150px" }}>
        {loading ? (
          // Show loading indicator when loading is true
          <div style={{ textAlign: "center", padding: "20px" }}>
            <DottedCircleLoading />
          </div>
        ) : inventoryList.length === 0 ? (
          // Show no data message if not loading and inventoryList is empty
          <div style={{ textAlign: "center", padding: "20px" }}>
            No Data Found
          </div>
        ) : (
          // Show the table when data is available and not loading
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
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Product Title</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Quantity
                    <IconButton onClick={(e) => handleOpenMenu(e, "quantity")}>
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                    Price
                    <IconButton onClick={(e) => handleOpenMenu(e, "price")}> {/* Changed to 'price' for consistency */}
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {inventoryList.map((order) => {
                  const marketplace = logoMarket.find(
                    (market) => market.name === order.marketplace_name
                  );

                  return (
                    <TableRow key={order.id} hover style={{ cursor: "pointer" }}>
                      <TableCell sx={{ textAlign: "center" }}>
                        <img
                          src={order.image_url || soon}
                          alt="Product"
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 5,
                          }}
                        />
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
                        {order.sku || "N/A"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", minWidth: 280, width: 280 }}>
                        {order.product_title}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", paddingLeft: "3px" }}>
                        {order.quantity || 0}
                      </TableCell>
                      <TableCell
                        sx={{
                          paddingLeft: "3px",
                          textAlign: "center",
                          minWidth: 120,
                          width: 120,
                        }}
                      >
                        {order.price || "$0.00"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 2 }}>
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
          color="primary"
          size="small"
        />
      </Box>

      {/* Sorting Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
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

        {currentColumn === "price" && ( // Changed from "order_total" to "price"
          <>
            <MenuItem onClick={() => handleSelectSort("price", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("price", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}

        {currentColumn === "quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("quantity", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("quantity", "desc")}>
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
      </Menu>
    </Box>
  );
};

export default InventoryList;