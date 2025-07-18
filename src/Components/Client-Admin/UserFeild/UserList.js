import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import UserAdd from "../UserFeild/UserAdd";
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

function UserList() {
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [rowsPerPage, setRowsPerPage] = useState(25); // Initial value set to 25

  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);



  const handleDialogClose = () => {
    setOpenDialog(false);
    fetchClientData();  // Call the API again to reload the user list after close
  };
  

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async (key = "", direction = "desc") => {
    setLoading(true);
    setError(null);
    try {
      const userData = localStorage.getItem("user");
      let userIds = "";

      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }

      const sortValue = direction === "asc" ? 1 : direction === "desc" ? -1 : 1;

      const response = await axios.post(
        `${process.env.REACT_APP_IP}listUsers/`,
        {
          user_id: userIds,
          sort_by: key,
          sort_by_value: sortValue,
        }
      );
      setClientData(response.data.data.users || []);
    } catch (err) {
      setError("Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.replace(/^\s+/g, ""); // This only removes leading spaces
    setSearchTerm(value);
    setPage(0); // Reset pagination when search term changes
  };

  // Filter client data based on search term
// Ensure clientData is an array before using .filter()
const filteredClientData = (clientData || []).filter(
  (client) =>
    (client.first_name && client.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.role_name && client.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
);

  // Paginate filtered data
  const paginatedClientData = filteredClientData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Total pages calculation
  const totalPages = Math.ceil(filteredClientData.length / rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };


  

  return (
    <Box sx={{ p: 3, marginTop: '3%' }}>
      {/* Header Section */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {/* Search Field */}
        <TextField
          variant="outlined"
          value={searchTerm}
          size="small"
          onChange={handleSearchChange} // Directly bind to state
          autoFocus
          placeholder="Search by Username, Email, Role..."
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "20px" }} />
              </InputAdornment>
            ),
            style: { fontSize: "12px" },
          }}
          sx={{ maxWidth: '300px', marginRight: 2 }} // Set max width and spacing to the right
        />

        {/* Add New User Button */}
        <Button
  sx={{
    textTransform: "capitalize",
    color: '#fff',
    background: "#000080",
    "&:hover": {
      backgroundColor: "#000080",
    },
    maxWidth: '150px', // Set a max width for the button
  }}
  variant="contained"
  onClick={() => {
    setSelectedClient(null); // Make sure selectedClient is null for Add New User
    setOpenDialog(true); // Open the dialog for adding a new user
  }} 
>
  Add New User
</Button>
      </Box>

      {/* Dialog for Adding/Editing User */}
   

{/* Dialog for Adding/Editing User */}
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  maxWidth="md" // This sets the maximum width to medium
  PaperProps={{
    style: {
      width: '600px', // Set a specific width for the dialog
      maxWidth: '100%', // Ensure it doesn't exceed the screen width
    },
  }}
>
  <DialogTitle>
    {selectedClient ? "Edit Client" : "Add New User"}
  </DialogTitle>
  <CloseIcon
    style={{
      position: "absolute",
      top: "10px",
      right: "10px",
      cursor: "pointer",
    }}
    onClick={() => setOpenDialog(false)}
  />
  <UserAdd
    clientData={selectedClient} // Pass selectedClient data to UserAdd component
    onClose={handleDialogClose}
    reloadUser={fetchClientData}  // Function to reload user list after changes
  />
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} color="primary">
      Cancel
    </Button>
  </DialogActions>
</Dialog>

      {/* Loading and Error States */}
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Client Table */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ maxHeight: "70vh", 
          // overflowY: "auto", overflowX: "auto",
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
          <Table size="small">
            <TableHead    sx={{
            backgroundColor: "#f6f6f6",
            position: "sticky",
            right: 0,
            top: 0,
            zIndex: 2,
            textAlign: "center",
          }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Username
                  {/* <IconButton onClick={(e) => handleOpenMenu(e, "username")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton> */}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Email
                  {/* <IconButton onClick={(e) => handleOpenMenu(e, "email")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton> */}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Role
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClientData.length > 0 ? (
                paginatedClientData.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link to={`/Home/users/userdetails/${client.id}?page=${page}`} style={{ textDecoration: 'none', color: 'black' }}>
                        {client?.first_name || "N/A"}   {client?.last_name || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email || "N/A"}</TableCell>
                    <TableCell>{client.role_name || "N/A"}</TableCell>
                    <TableCell>
                    <IconButton onClick={() => {
    setSelectedClient(client); // Populate selectedClient with the clicked client's data
    setOpenDialog(true); // Open the dialog for editing
  }}>
    <EditIcon />
  </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination UI */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 2 }}>
        {/* Rows per page selector */}
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

        {/* Pagination component */}
        <Pagination
          count={totalPages} // Total number of pages
          page={page + 1} // Current page
          onChange={handleChangePage} // Change page handler
          color="primary"
          size="small"
        />
      </Box>
    </Box>
  );
}

export default UserList;
