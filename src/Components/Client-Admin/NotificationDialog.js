// src\Components\Client-Admin\NotificationDialog.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { Close, VisibilityOff, Delete, Visibility } from "@mui/icons-material";

const notificationsData = [
  {
    title: "Revise Listings - Action Completed",
    message: "1 Product revised successfully.",
    time: "Feb 25 2025 11:14",
    category: "Products",
    read: true,
  },
  {
    title: "Orders Report - Action Completed",
    message: "Orders Exported to CSV successfully.",
    time: "Feb 24 2025 16:18",
    category: "Reports",
    read: false,
  },
  {
    title: "Import Products - Action Completed",
    message: "Products imported successfully from 🏪 My Store.",
    time: "Feb 24 2025 15:56",
    category: "Products",
    read: false,
  },
];

const NotificationsDialog = ({ open, handleClose }) => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState("all");

  const handleMarkAsRead = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications[index].read = true;
    setNotifications(updatedNotifications);
  };

  const handleDelete = (index) => {
    const updatedNotifications = notifications.filter((_, i) => i !== index);
    setNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || (filter === "unread" && !n.read)
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Notifications
        <IconButton onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Button
              onClick={() => setFilter("all")}
              sx={{ textTransform: "none", fontWeight: filter === "all" ? "bold" : "normal" }}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter("unread")}
              sx={{ textTransform: "none", fontWeight: filter === "unread" ? "bold" : "normal" }}
            >
              Unread
            </Button>
          </Box>
          <Button onClick={handleMarkAllAsRead} variant="outlined" size="small">
            Mark All As Read
          </Button>
        </Box>

        <TextField fullWidth size="small" placeholder="Search" sx={{ mb: 2 }} />

        {filteredNotifications.map((notif, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: notif.read ? "#f8f9fa" : "#e3f2fd",
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: notif.read ? "#121212" : "green" }}>
                {notif.title}
              </Typography>
              <Typography variant="body2">{notif.message}</Typography>
              <Typography variant="caption" sx={{ color: "gray" }}>
                {notif.time}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleMarkAsRead(index)} size="small">
                {notif.read ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              <IconButton onClick={() => handleDelete(index)} size="small">
                <Delete />
              </IconButton>
            </Box>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
