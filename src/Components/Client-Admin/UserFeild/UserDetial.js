import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { useParams} from "react-router-dom";

const UserDetail = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState("");
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.id) {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}fetchUserDetails/`, {
              params: {
                user_id: user.id,
                target_user_id: id
              }
            }
          );

          const userData = response.data.data.user_obj;

          // Make sure userData contains the expected fields
          setUserDetails(userData);
          setUserImage(userData.profile_image || null);
        } else {
          setError("No user found in local storage");
        }
      } catch (err) {
        setError("Error fetching user details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]); // Only re-run if `id` changes


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImageError("");

    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image (JPG, JPEG, PNG, or SVG).");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setImageError("Please upload an image smaller than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
<Box sx={{ marginTop: '6%' }}>
  <Paper
    sx={{
      p: 4,
      width: "80%",
      maxWidth: 800,
      mx: "auto",
      mt: 4, // If you want margin-top on the Paper as well
      borderRadius: 3,
      boxShadow: 3,
    }}
  >
    {/* Profile Header */}
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center">
        <Avatar
          src={userImage || "https://via.placeholder.com/100"}
          sx={{ width: 100, height: 100, mr: 2 }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {userDetails.first_name} {userDetails.last_name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userDetails.email}
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Image Upload */}
    {isEditing && (
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Button
          variant="outlined"
          component="label"
          startIcon={<AddPhotoAlternateIcon />}
          sx={{ mb: 2, textTransform: 'capitalize' }}
        >
          Change Profile Picture
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>

        {imageError && <Typography color="error">{imageError}</Typography>}
      </Box>
    )}

    {/* User Details Form */}
    <Grid container spacing={3} mt={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2">First Name</Typography>
        <TextField
          fullWidth
          value={userDetails.first_name}
          InputProps={{
            readOnly: !isEditing, // Makes the field editable only in editing mode
          }}
          onChange={(e) => {
            setUserDetails({ ...userDetails, first_name: e.target.value });
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2">Last Name</Typography>
        <TextField
          fullWidth
          value={userDetails.last_name}
          InputProps={{
            readOnly: !isEditing, // Makes the field editable only in editing mode
          }}
          onChange={(e) => {
            setUserDetails({ ...userDetails, last_name: e.target.value });
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2">Email</Typography>
        <TextField
          fullWidth
          value={userDetails.email}
          InputProps={{
            readOnly: !isEditing, // Makes the field editable only in editing mode
          }}
          onChange={(e) => {
            setUserDetails({ ...userDetails, email: e.target.value });
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2">Role</Typography>
        <TextField
          fullWidth
          value={userDetails.role_name}
          InputProps={{
            readOnly: !isEditing, // Makes the field editable only in editing mode
          }}
          onChange={(e) => {
            setUserDetails({ ...userDetails, role_name: e.target.value });
          }}
        />
      </Grid>
    </Grid>

    <Divider sx={{ mt: 4, mb: 4 }} />
  </Paper>
</Box>

  );
};

export default UserDetail;
