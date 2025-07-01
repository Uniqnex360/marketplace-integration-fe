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
  Slide, Menu, IconButton
} from "@mui/material";
import { FilterList, Refresh, Visibility } from "@mui/icons-material";
import { Link ,useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import DottedCircleLoading from "../../Loading/DotLoading"; // Assuming this is your loading spinner component
import AddIcon from '@mui/icons-material/Add'; // Import the AddIcon
import MannualOrder from "./MannualOrder";
import FilterOrders from "./FilterOrders";
import MarketplaceOption from "../Products/MarketplaceOption";
import ChannelOrder from "./ChannelOrder";
import {

  MoreVert as MoreVertIcon,

} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderList = ({fetchOrdersFromParent  }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
    const [currentColumn, setCurrentColumn] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [manualOrders, setManualOrders] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({});
 const [totalPages, setTotalPages] = useState(1);   // Total pages
  const [orderCount, setOrderCount] = useState(0);   // Total count of products

  const [customStatus, setCustomStatus] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [logoMarket,   setLogoMarket] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Retrieve the selected category from localStorage when the component mounts
  useEffect(() => {
    // console.log('ppp',close)
    const storedCategory = localStorage.getItem("selectedCategory");

    if (storedCategory) {
      const parsedCategory = JSON.parse(storedCategory);   // Parse the stored JSON data
      setSelectedCategory(parsedCategory);   // Set the parsed data into the state
    }
  }, []);   // Empty dependency array ensures this effect runs only once after the component mounts

  // Optionally, you can use selectedCategory here in your component
  console.log(selectedCategory);   // For debugging purposes

  const [categories, setCategories] = useState(['All', 'Category 1', 'Category 2']);
  const [open, setOpen] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);

  const initialPage = parseInt(queryParams.get('page'), ) || 1; // Default to 0 if no page param exists
  const initialRowsPerPage = parseInt(queryParams.get('rowsPerPage'), 10) || 25; // Default to 25 if no rowsPerPage param exists
  const [page, setPage] = useState(initialPage);
  const [market, setMarket] = useState(null);
  const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  const handlePageChange = (event, newPage) => {
    setPage(newPage); // Update the page state
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`); // Update the URL with the new page number
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    navigate(`/Home/orders?page=${page}&rowsPerPage=${event.target.value}`); // Update URL
    setPage(1); // Reset to the first page when rows per page changes
  };


useEffect(() => {
  setRowsPerPage(initialRowsPerPage);
}, [location.search]);
  useEffect(() => {
    console.log('pagination',page)
    // Check if the state contains searchQuery and set it
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery); // Set the search query from location.state
    }
  }, [location.state]);

  useEffect(() => {
    console.log('9090',selectedCategory)
    // Reset current page to 1 when selectedCategory changes
    // setPage(1);
  }, [selectedCategory]);


  // First, define the function to fetch data
const fetchOrderData = async (marketId = "all", page, rowsPerPage) => {
  setLoading(true);

  const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 50;
  const skip = (page -1) * validRowsPerPage;

  try {
    const userData = localStorage.getItem("user");
    let userIds = "";
    if (userData) {
      const data = JSON.parse(userData);
      userIds = data.id;
    }

    const marketplaceId = localStorage.getItem("selectedCategory")
      ? JSON.parse(localStorage.getItem("selectedCategory")).id
      : "all"; // Default to "all" if no selectedCategory is found

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
        timezone: systemTimeZone, // Pass the system time zone
      }
    );

    // Process response
    if (response.data.data.manual_orders) {
      setManualOrders(response.data.data.manual_orders);
      setCustomStatus(response.data.data.status);
      setOrderCount(response.data.data.total_count);
      setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
    }

    if (response.data.data.orders) {
      setOrders(response.data.data.orders);
      setCustomStatus(response.data.data.status);
      setOrderCount(response.data.data.total_count);
      setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
      setLogoMarket(Array.isArray(response.data.data.marketplace_list) ? response.data.data.marketplace_list : []);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
};

// Ref to track previous params for comparison
const prevParams = useRef({
  selectedCategoryId: selectedCategory.id,
  page,
  rowsPerPage,
  sortConfig,
  searchQuery,
});

// useEffect to handle changes in parameters and fetch orders accordingly
useEffect(() => {
  const shouldFetch =
    selectedCategory.id !== prevParams.current.selectedCategoryId ||
    page !== prevParams.current.page ||
    rowsPerPage !== prevParams.current.rowsPerPage ||
    JSON.stringify(sortConfig) !== JSON.stringify(prevParams.current.sortConfig) ||
    searchQuery !== prevParams.current.searchQuery;

  if (shouldFetch) {
    // Fetch orders only if parameters have changed
    fetchOrderData(selectedCategory.id, page, rowsPerPage);

    // Update the previous parameters with the current ones
    prevParams.current = {
      selectedCategoryId: selectedCategory.id,
      page,
      rowsPerPage,
      sortConfig,
      searchQuery,
    };
  }
}, [selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery]);  // Dependencies to re-run effect when any of these change

// useEffect to initialize selectedCategory and fetch orders on mount
useEffect(() => {
  const storedCategory = localStorage.getItem("selectedCategory");
  if (storedCategory) {
    const category = JSON.parse(storedCategory);
    setSelectedCategory(category);
  }

  // Fetch orders only on initial mount or when category or other params change
  fetchOrderData(selectedCategory.id, page, rowsPerPage); // This should be the first API call when component is mounted
}, []);  // Empty dependency array for initial fetch




// Handle close of the modal and re-fetch orders
const handleClose = () => {
  setOpen(false);
  fetchOrderData(selectedCategory.id, page, rowsPerPage); // Re-fetch orders on modal close
};

  
  
  // // Only re-run effect if these dependencies change
  // const fetchOrderData = async (marketId = "all", page, rowsPerPage) => {
  //   setLoading(true);

  //   const validRowsPerPage = rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 50;
  //   const skip = (page - 1) * validRowsPerPage;

  //   try {
  //     const userData = localStorage.getItem("user");
  //     let userIds = "";
  //     if (userData) {
  //       const data = JSON.parse(userData);
  //       userIds = data.id;
  //     }
      
  //     const marketplaceId = localStorage.getItem("selectedCategory")
  //       ? JSON.parse(localStorage.getItem("selectedCategory")).id
  //       : "all"; // Default to "all" if no selectedCategory is found
    
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_IP}fetchAllorders/`,
  //       {
  //         user_id: userIds,
  //         skip: skip >= 0 ? skip : 0,
  //         limit: validRowsPerPage,
  //         marketplace_id: marketplaceId,
  //         search_query: searchQuery,
  //         sort_by: sortConfig.key,
  //         sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
  //       }
  //     );

  //     if (response.data.data.manual_orders) {
  //       setManualOrders(response.data.data.manual_orders);
  //       setCustomStatus(response.data.data.status);
  //       setOrderCount(response.data.data.total_count);
  //       setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
  //     }

  //     if (response.data.data.orders) {
  //       setOrders(response.data.data.orders);
  //       setCustomStatus(response.data.data.status);
  //       setOrderCount(response.data.data.total_count);
  //       setTotalPages(Math.ceil(response.data.data.total_count / validRowsPerPage));
  //       setLogoMarket(Array.isArray(response.data.data.marketplace_list) ? response.data.data.marketplace_list : []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching orders:", error);
  //     // toast.error("An error occurred while fetching orders.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Ref to track previous params for comparison
  // const prevParams = useRef({
  //   selectedCategoryId: selectedCategory.id,
  //   page,
  //   rowsPerPage,
  //   sortConfig,
  //   searchQuery,
  // });

  // // useEffect to handle changes in parameters and fetch orders accordingly
  // useEffect(() => {
  //   const shouldFetch = 
  //     selectedCategory.id !== prevParams.current.selectedCategoryId ||
  //     page !== prevParams.current.page ||
  //     rowsPerPage !== prevParams.current.rowsPerPage ||
  //     JSON.stringify(sortConfig) !== JSON.stringify(prevParams.current.sortConfig) ||
  //     searchQuery !== prevParams.current.searchQuery;

  //   if (shouldFetch) {
  //     // Fetch orders only if parameters have changed
  //     fetchOrderData(selectedCategory.id, page, rowsPerPage); // Using renamed function

  //     // Update the previous parameters with the current ones
  //     prevParams.current = {
  //       selectedCategoryId: selectedCategory.id,
  //       page,
  //       rowsPerPage,
  //       sortConfig,
  //       searchQuery,
  //     };
  //   }
  // }, [selectedCategory.id, page, rowsPerPage, sortConfig, searchQuery]);  // Dependencies to re-run effect when any of these change

  // // useEffect to initialize selectedCategory and fetch orders on mount
  // useEffect(() => {
  //   const storedCategory = localStorage.getItem("selectedCategory");
  //   if (storedCategory) {
  //     const category = JSON.parse(storedCategory);
  //     setSelectedCategory(category);
  //   }

  //   // Fetch orders only on initial mount or when category or other params change
  //   fetchOrderData(selectedCategory.id, page, rowsPerPage); // Call renamed function
  // }, [page]);  // Empty dependency array for initial fetch

  // // Handle close of the modal and re-fetch orders
  // const handleClose = () => {
  //   setOpen(false);
  //   fetchOrderData(selectedCategory.id, page, rowsPerPage); // Re-fetch orders on modal close
  // };



  const filteredOrders = orders.filter((order) => {
    const purchaseOrderId = order.purchaseOrderId ? order.purchaseOrderId.toLowerCase() : "";
    const customerOrderId = order.customerOrderId ? order.customerOrderId.toLowerCase() : "";

    return (
      purchaseOrderId.includes(searchQuery.toLowerCase()) ||
      customerOrderId.includes(searchQuery.toLowerCase())
    );
  });



  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };



  //pagination page change
  const handleChangePage = (event, newPage) => {
    navigate(`/Home/orders?page=${newPage}&rowsPerPage=${rowsPerPage}`); // Update the URL with the new page number
    setPage(newPage);
  };

      //dropdown open menu
      const handleOpenMenu = (event, column) => {
        setAnchorEl(event.currentTarget);
        setCurrentColumn(column); // Set column to either "price" or "availability"
      };
  
  
      const handleSelectSort = (key, direction) => {
        console.log('army',key, direction)
        setSortConfig({ key, direction });
        // setPage(0);  // Reset page to 0 when sorting is applied
        // fetchData( key, direction);
        setAnchorEl(null);  // Close the menu after selection
      };
  
      const handleCloseMenu = () => {
        setAnchorEl(null);
      };

  const handleProduct = (category) => {
    console.log('555',category)
    setSelectedCategory(category);  // Update the selected category
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Here you can also update the state or trigger any API calls as needed
  };
  
  
const handleResetChange = () => {
  // Always reset fields
  setSearchQuery("");
  setSortConfig({ key: "", direction: "asc" });

  // Reset selected category to "All Channels"
  setSelectedCategory({ id: "all", name: "All Channels" });
  localStorage.setItem("selectedCategory", JSON.stringify({ id: "all", name: "All Channels" }));

  // Always show toast
  toast.success("Reset Successfully", {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

  


  return (
    <Box sx={{ flex: 1, width: "100%"}}>
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
        {/* Filters and controls */}
        <Box
         sx={{
          display: "flex",
          gap: 2,
          my: 2,
          marginRight:'4%',
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "6%",
          width: "100%", // Ensure full width
        }}
        >
          
          <Box sx={{marginTop:'-7px'}}>
          <ChannelOrder handleProduct={handleProduct} clearChannel={selectedCategory} />
          </Box>




<TextField
  size="small"
  placeholder="Search Purchase Order ID "
  value={searchQuery}
  onChange={handleSearchChange}
  sx={{
    width: 300,
    '& input': {
       fontSize:'14px',
     // Center the text (and placeholder) inside the input
    }
  }}
/>


{selectedCategory.id == 'custom' && (
  <Button
    variant="text"
    color="primary"
    sx={{
      backgroundColor: "#000080",
      fontSize: "14px",
      color: "white",
      fontWeight: 400,
      minWidth: "auto",
      padding: "8px 17px", // Adjust padding to match TextField
      textTransform: "capitalize",
      height: "35px", // Set consistent height
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
        // onClick={() => setShowFilter(!showFilter)}
      >
        <FilterList sx={{ color: "white", fontSize: "20px" }} />
      </Button>

      {showFilter && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "50px",
            marginTop: '6%',
            right: "30px",
            width: "300px",
            padding: "10px",
            backgroundColor: "white",
            zIndex: 1000,
          }}
        >
          <Typography variant="h6">Filter Orders</Typography>
             <FilterOrders onFilterChange={handleFilterChange} />
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
    onClick={() => {
      handleResetChange(); // Call the fetchOrders function
    }}
  >
    <Refresh sx={{ color: "white", fontSize: "20px" }} />
  </Button>
</Tooltip>

          <Typography variant="body2">
            Total Orders: {orderCount ? orderCount : '0'}
          </Typography>
        </Box>

            
        
      </Box>
<Box sx={{ paddingTop: "150px" }}>
  {/* Conditionally render the first table if customStatus is 'custom' */}
  {customStatus === 'custom' ? (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: "70vh",
        display: 'flex',
        justifyContent: 'center',
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
      <Table sx={{ minWidth: 650, margin: '0 auto' }}>
        <TableHead
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#f6f6f6",
          }}
        >
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Purchase Order Id
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Customer Name
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Order Date
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Currency
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>
              Quantity
              <IconButton onClick={(e) => handleOpenMenu(e, "total_quantity")}>
                <MoreVertIcon sx={{ fontSize: "14px" ,paddingRight:'3px'}} />
              </IconButton>
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", backgroundColor: "#f6f6f6" }}>
              Order Value
              <IconButton onClick={(e) => handleOpenMenu(e, "total_price")}>
                <MoreVertIcon sx={{ fontSize: "14px" }} />
              </IconButton>
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
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
                             onClick={() => navigate(`/Home/orders/customList/${order.id}?page=${page}`)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell sx={{
                  textAlign: "center",
                  minWidth: 140,
                  width: 140,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {order.order_id ? order.order_id : 'N/A'}
                </TableCell>
                <TableCell sx={{
                  textAlign: "center",
                  minWidth: 120,
                  width: 120,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {order.customer_name ? order.customer_name : 'N/A'}
                </TableCell>
                <TableCell sx={{ textAlign: "center" ,minWidth: 120,
                  width: 120}}>
                      {order.purchase_order_date ? (
  new Date(order.purchase_order_date+ 'Z').toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: systemTimeZone,
  })
) : 'N/A'} 
                  {/* {order.purchase_order_date ? new Date(order.purchase_order_date).toLocaleDateString('en-GB') : 'N/A'} */}
                </TableCell>
                <TableCell align="center" >
                  {order.currency ? order.currency : 'USD'}
                </TableCell>
                <TableCell align="center" sx={{paddingLeft:'3px' , minWidth: 130,
                  width: 130}}>
                  {order.total_quantity ? order.total_quantity : 'N/A'}
                </TableCell>
                <TableCell align="center" sx={{paddingLeft:'3px'}}>
                  {order.total_price && !isNaN(order.total_price) ? `$${order.total_price.toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell sx={{
                  textAlign: "center",
                  minWidth: 120,
                  width: 120,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {order.order_status ? order.order_status : 'N/A'}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title="View Order Details" arrow>
                    <Button variant="text" sx={{ color: "#000080" }} onClick={() => handleOpen}>
                      <Visibility sx={{ fontSize: 20 }} />
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : !loading && (!manualOrders || manualOrders.length === 0) ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ fontWeight: "bold", color: "red" }}>
                No Custom Orders Found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  ) : null}

  {/* Conditionally render the second table if customStatus is not 'custom' */}
  {customStatus !== 'custom' ? (
    <TableContainer component={Paper} sx={{ maxHeight: "70vh",
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
     }}>
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
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Purchase Order ID
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Channel Name
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Order Date
              <IconButton onClick={(e) => handleOpenMenu(e, "order_date")}>
                <MoreVertIcon sx={{ fontSize: "14px" }} />
              </IconButton>
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Currency
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Quantity
              <IconButton onClick={(e) => handleOpenMenu(e, "items_order_quantity")}>
                <MoreVertIcon sx={{ fontSize: "14px" }} />
              </IconButton>
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Order Value
              <IconButton onClick={(e) => handleOpenMenu(e, "order_total")}>
                <MoreVertIcon sx={{ fontSize: "14px" }} />
              </IconButton>
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center", backgroundColor: "#f6f6f6" }}>
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
              <TableCell colSpan={8} align="center" sx={{ fontWeight: "bold", color: "red" }}>
                No Orders To Show
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const marketplace = logoMarket.find((market) => market.name === order.marketplace_name);

              return (
                <TableRow
                  key={order.id}
                  hover
                 onClick={() => navigate(`/Home/orders/details/${order.id}?page=${page}&rowsPerPage=${rowsPerPage}`)}
                  state={{ searchQuery: searchTerm }}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {order.purchase_order_id}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {marketplace && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {marketplace.image_url ? (
                          <img
                            src={marketplace.image_url}
                            alt={marketplace.name}
                            style={{ width: 20, height: 20, marginRight: 8 }}
                          />
                        ) : (
                          <div style={{ width: 20, height: 20, marginRight: 8, backgroundColor: '#ccc' }} />
                        )}
                        {marketplace.marketplace_name}
                      </div>
                    )}
                    {order.marketplace_name}
                  </TableCell>

                <TableCell sx={{ textAlign: "center", paddingLeft: '3px' }}>
  {order.order_date ? (
  new Date(order.order_date+ 'Z').toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: systemTimeZone,
  })
) : 'N/A'} 
</TableCell>

                  <TableCell sx={{ textAlign: "center" }}>{order.currency}</TableCell>
                  <TableCell sx={{ textAlign: "center" ,paddingLeft:'3px'}}>
                    {order.items_order_quantity ? order.items_order_quantity : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" ,paddingLeft:'3px'}}>
                    ${order.order_total && !isNaN(order.order_total) ? order.order_total.toFixed(2) : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {order.order_status || 'N/A'}
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


       {/* Pagination Controls */}
       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 2 }}>
        <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small" sx={{ minWidth: 70 }}>
          <MenuItem value={25}>25/page</MenuItem>
          <MenuItem value={50}>50/page</MenuItem>
          <MenuItem value={75}>75/page</MenuItem>
        </Select>

        <Pagination
          count={totalPages}  // Total number of pages
          page={page}  // Current page
          onChange={handlePageChange}  // Change page handler
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          color="primary"
          size="small"
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
            setPage(1); // Reset to first page when rows per page change
          }}
        />
      </Box>


      <Modal open={open} onClose={handleClose}>
        <Slide direction="left" in={open} mountOnEnter unmountOnExit>
          <Box     sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 900, // Adjust the width as needed
              height: '100vh',
              bgcolor: 'background.paper',
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
             
      
                    {/* Sorting for Brand */}
                    {currentColumn === "customer_name" && (
                      <>
                        <MenuItem
                          onClick={() => handleSelectSort("customer_name", "asc")}
                        >
                          Sort A-Z
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleSelectSort("customer_name", "desc")}
                        >
                          Sort Z-A
                        </MenuItem>
                      </>
                    )}


                          {/* Sorting for Price */}
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
                        <MenuItem
                          onClick={() =>
                            handleSelectSort(
                              "order_date",
                              "asc"
                            )
                          }
                        >
                        Oldest
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            handleSelectSort(
                              "order_date",
                              "desc"
                            )
                          }
                        >
                        Latest
                        </MenuItem>
                      </>
                    )}
             {/* Sorting for Price */}
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

                        {/* Sorting for Price */}
             {currentColumn === "total_quantity" && (
                      <>
                        <MenuItem onClick={() => handleSelectSort("total_quantity", "asc")}>
                          Sort Low to High
                        </MenuItem>
                        <MenuItem onClick={() => handleSelectSort("total_quantity", "desc")}>
                          Sort High to Low
                        </MenuItem>
                      </>
                    )}
      
      
               
      
                  </Menu>
    </Box>
  );
};

export default OrderList;
