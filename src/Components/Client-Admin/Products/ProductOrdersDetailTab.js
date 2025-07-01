import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TablePagination,MenuItem,IconButton, Menu, } from '@mui/material';
  
  import {
    Visibility,
    VisibilityOff,
    MoreVert as MoreVertIcon,
  } from "@mui/icons-material";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DottedCircleLoading from '../../Loading/DotLoading';

function ProductOrdersDetailTab() {
  const { id } = useParams(); // Get the product ID from the route params
  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // State to hold the total count
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Initialize page to 0
  const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentColumn, setCurrentColumn] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  
  const userData = localStorage.getItem("user");
  let userIds = "";
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

 let lastParamsRef = useRef("");
  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

  useEffect(() => {

        const currentParams = JSON.stringify({
id, userIds, page, rowsPerPage, sortConfig,
    });

        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
            fetchOrderDetails();
        }

  }, [id, userIds, page, rowsPerPage, sortConfig,]); // Re-fetch when page or rowsPerPage changes
  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1); // Reset page to 1 when sorting is applied
    setAnchorEl(null); // Close the menu after selection
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };


 const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const skip = page * rowsPerPage; // Calculate skip based on current page
        // Calculate the limit based on the current page and rows per page
        const limit = (page + 1) * rowsPerPage;

        const response = await axios.get(`${process.env.REACT_APP_IP}getOrdersBasedOnProduct/`, {
          params: {
            product_id: id,
            user_id: userIds, // Pass the user IDs to the API
            skip: skip,
            limit: limit,
              sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          },
        });

        if (response.data.data?.orders) {
          setOrdersData(response.data.data.orders);
        } else {
          setOrdersData([]);
        }
        // Set the total count from the response
        if (response.data.data?.total_count) {
          setTotalCount(response.data.data.total_count);
        } else {
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to the first when rows per page changes
  };

  // const emptyRows = rowsPerPage - Math.min(rowsPerPage, ordersData.length - page * rowsPerPage);
console.log("Orders Data:", ordersData);

  // const currentOrders = ordersData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const currentOrders = ordersData;

console.log("Current Orders:", currentOrders);

  return (
    <Paper sx={{ padding: 2, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1300 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Purchase Order ID
                          <IconButton
                          onClick={(e) => handleOpenMenu(e, "purchase_order_id")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Order Status
                         
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Order Date
                          <IconButton
                          onClick={(e) => handleOpenMenu(e, "order_date")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Channel Name
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Total
                          <IconButton
                          onClick={(e) => handleOpenMenu(e, "order_total")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }} align="center">
                Currency
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><DottedCircleLoading/></TableCell>
              </TableRow>
            ) : currentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No data founds</TableCell>
              </TableRow>
            ) : (
              currentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  hover
                  onClick={() => {
                    if (order.marketplace_name === "custom") {
                      navigate(`/Home/orders/customList/${order.id}?page=${page + 1}&rowsPerPage=${rowsPerPage}&detail=${'detail-name'}&productId=${id}`);
                    } else {
                      navigate(`/Home/orders/details/${order.id}?detail=${'detail-name'}&productId=${id}&rowsPerPage=${rowsPerPage}`);
                    }
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell align="center">{order.purchase_order_id || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.order_status || "N/A"}
                      color={
                        order.order_status === "Shipped"
                          ? "success"
                          : order.order_status === "Pending"
                            ? "warning"
                            : "default"
                      }
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                  
              
{order.order_date ? (
  new Date(`${order.order_date.replace(' ', 'T')}Z`).toLocaleString(('en-GB'), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: systemTimeZone,
  })
) : 'N/A'}

                    {/* {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"} */}
                  </TableCell>
                  <TableCell align="center">{order.marketplace_name || "N/A"}</TableCell>
                  <TableCell align="center">{order.order_total || "N/A"}</TableCell>
                  <TableCell align="center">{order.currency || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
            {/* {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )} */}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount} // Use totalCount here
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />


        <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
       

              {/* Sorting for Brand */}
              {currentColumn === "purchase_order_id" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("purchase_order_id", "asc")}
                  >
              Sort Low to High
               
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("purchase_order_id", "desc")}
                  >
                      Sort High to Low
                  </MenuItem>
                </>
              )}

              {currentColumn === "order_date" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("order_date", "asc")}
                  >
               Oldest
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("order_date", "desc")}
                  >
                  Latest
                  </MenuItem>
                </>
              )}

              {currentColumn === "order_total" && (
                <>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "order_total",
                        "asc"
                      )
                    }
                  >
                
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "order_total",
                        "desc"
                      )
                    }
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}
              
         

            </Menu>
    </Paper>


  
  
  );
}

export default ProductOrdersDetailTab;