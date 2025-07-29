import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ListItemText,
  List,
  Avatar,
  ListItem,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Notifications,
  AccountCircle,
  ExitToApp,
  CreditCard,
  HelpOutline,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const accentColor = " #000080  "; // Change as needed

function Notificationbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate("/");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: accentColor, zIndex: 1201 }}
    >
      <Toolbar>
        {/* <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton> */}

        <IconButton edge="start" color="inherit" aria-label="menu">
          <img
            src={require("../../assets/One Tree Brands Main Logo 2400x1800 (HIGH RES).607b435d3277b92df838.png")}
            alt="Logo"
            style={{ height: "40px", width: "auto" }}
          />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          MarketPlace Management
        </Typography>

        {/* Right-aligned Box */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "67px",
            justifyContent: "flex-end",
          }}
        >
          {/* Notification Icon */}
          <ListItem sx={{ display: "flex", alignItems: "center", padding: 0 }}>
            <Notifications sx={{ fontSize: 28, color: "#fff" }} />
          </ListItem>

          {/* Profile Section */}
          <List
            sx={{
              width: "100%",
              textAlign: "right",
              marginTop: "13px",
              marginBottom: 2,
            }}
          >
            <ListItem
              button
              onClick={handleProfileClick}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <Avatar sx={{ bgcolor: "white", color: "blue" }}>
                <AccountCircle sx={{fontSize:28}}/>
              </Avatar>
              {/* <ListItemText primary="User" sx={{ color: "#fff", fontSize: "14px", marginTop: "4px" }} /> */}
            </ListItem>
          </List>
        </Box>
      </Toolbar>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{ mt: 1 }}
      >
        <MenuItem disabled>
          <ListItemText
            primary="Hello, MarketPlace User01"
            secondary="marketplace@user1gmail.com"
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <CreditCard />
          </ListItemIcon>
          <ListItemText primary="Billing" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <HelpOutline />
          </ListItemIcon>
          <ListItemText primary="Get Help" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

export default Notificationbar;
