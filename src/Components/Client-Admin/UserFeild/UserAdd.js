import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Grid,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { CameraAlt } from "@mui/icons-material"; // To show camera icon for uploading image

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function UserAdd({ clientData, onClose, reloadUser }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id; // Assuming the user data is stored in localStorage

  // Initialize state values from clientData or default
  const [editId, setUserId] = useState('');
  const [name, setName] = useState(clientData ? clientData.first_name : "");
  const [lastname, setLastname] = useState(clientData ? clientData.last_name : "");
  const [email, setEmail] = useState(clientData ? clientData.email : "");
  const [password, setPassword] = useState(""); // Password field, only for new users
  const [errors, setErrors] = useState({ name: "", lastname: "", email: "", password: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [industry, setIndustry] = useState(clientData ? clientData.role_id : ""); // role_id instead of role_name
  const [industryList, setIndustryList] = useState([]); // List of available roles
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(clientData ? clientData.profile_image : ""); // Store the image URL or base64 string
  const [imagePreview, setImagePreview] = useState(clientData ? clientData.profile_image : ""); // Preview image before upload

  const debouncedEmail = useDebounce(email, 500); // Use debounce for email

  // Fetch industries (roles) for the user
  const fetchIndustry = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_IP}fetchRoles/`, {
        params: { user_id: userId }  // Pass the userId as a query parameter
      });
      setIndustryList(response.data.data || []); // Set industry list
    } catch (error) {
      console.error("Error fetching industry list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustry(); // Fetch industry list when the component is mounted
  }, []);

  useEffect(() => {
    if (clientData) {
      console.log('clientData', clientData);
      setUserId(clientData.id || '');
      setName(clientData.first_name || '');  // Set name from clientData
      setLastname(clientData.last_name || '');  // Set lastname from clientData
      setEmail(clientData.email || '');  // Set email from clientData
      setIndustry(clientData.role_id || "");  // Set role_id properly
      setProfileImage(clientData.profile_image || "");  // Set profile image from clientData
      setImagePreview(clientData.profile_image || ""); // Set image preview if available
    }
  }, [clientData]);

  // Validate fields
  const validateFields = () => {
    let valid = true;
    let errors = { name: "", lastname: "", email: "", password: "" };

    if (!name.trim()) {
      errors.name = "Name is required.";
      valid = false;
    }

    if (!lastname.trim()) {
      errors.lastname = "Lastname is required.";
      valid = false;
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid.";
      valid = false;
    }

    if (!password.trim() && !clientData) { // Only validate password if it's a new user
      errors.password = "Password is required.";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Preview the image
        setProfileImage(reader.result); // Save base64 string of the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    const userData = {
      first_name: name,
      last_name: lastname,
      email,
      password,
      role_id: industry,  // Use role_id here
      user_id: userId,
      profile_image: profileImage, // Include image data
    };

    const userDataUpdate = {
      first_name: name,
      last_name: lastname,
      email,
      role_id: industry,  // Use role_id here
      profile_image: profileImage, // Include image data
    };

    try {
      setLoading(true);

      // If `clientData` exists, it's an update operation; otherwise, it's a create operation
      const response = clientData
        ? await axios.post(`${process.env.REACT_APP_IP}updateUser/`, {
            user_id: userId,               // Existing user's ID
            target_user_id: clientData.id, // Target user's ID (for updating)
            update_obj: userDataUpdate,           // Data to update
          })
        : await axios.post(`${process.env.REACT_APP_IP}createUser/`, userData); // Create new user

      if (response.status === 200) {
        setSuccessMessage("User added/updated successfully.");
        reloadUser(); // Reload the user list after successful submission
        onClose(); // Close the dialog
      }
    } catch (error) {
      console.error("Error submitting user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* User Information Form */}
      <Box component="form" noValidate autoComplete="off" sx={{ padding: 2 }}>
        <Grid container spacing={2}>

          <Grid item xs={12} md={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Image Preview and Upload Section */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden',
                  marginBottom: 2,
                }}
              >
                <img
                  src={imagePreview || 'https://via.placeholder.com/100'}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              {/* Image Upload Button */}
              <input
                accept="image/*"
                type="file"
                id="image-upload"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <IconButton component="span">
                  <CameraAlt />
                </IconButton>
              </label>
            </Box>
          </Grid>

          {/* Name Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* Lastname Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Lastname"
              variant="outlined"
              margin="normal"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              error={!!errors.lastname}
              helperText={errors.lastname}
            />
          </Grid>

          {/* Email Field */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Password Field (only for new users) */}
          {!clientData && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
          )}

          {/* Role (Industry) Selector */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                label="Role"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industryList.map((industryItem) => (
                  <MenuItem key={industryItem.id} value={industryItem.id}>
                    {industryItem.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {clientData ? "Update" : "Add"} User
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Container>
  );
}

export default UserAdd;
