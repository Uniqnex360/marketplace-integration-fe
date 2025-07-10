import  { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register"; 
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import DottedCircleLoading from "../Loading/DotLoading";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zAZ]{2,6}$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email");
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
   
    if (!validateForm()) return;
const baseUrl = process.env.REACT_APP_IP;
console.log('BASEURL',baseUrl)
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}loginUser/`,
        { email, password }
      );
      
      if (response.data && response.data.data) {
        const userData = response.data.data;

        if (!userData.valid) {
          toast.error("Invalid credentials!"); // Show toast instead of alert
        } else {
          localStorage.setItem("user", JSON.stringify(userData));
          toast.success("Login successful!"); // Show success toast

          switch (userData.role_name) {
            case "Manager":
              navigate("/Home/");
              break;
            default:
              navigate("/");
              break;
          }
        }
      } else {
        toast.error("Invalid credentials!"); // Show toast for invalid credentials
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server Error! Please try again."); // Show toast for server error
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (event) => setEmail(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const toggleForgotPassword = () => setShowForgotPassword(!showForgotPassword);
  const toggleRegisterPage = () => setShowRegisterPage(!showRegisterPage); // Toggle Register page

  return (
    <Box display="flex" height="100vh">
      {/* Left side (image and content) */}
    


      <Box
  flex={4} // 70% of the screen
  sx={{
    // backgroundImage: `url(${backgroundLoginImage})`,
    backgroundColor: "#000080", // Set the background color to #000080 (blue)
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    color: "#fff", // Set text color to #fff
  }}
>
  <Typography
    variant="h4"
    sx={{
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: "20px",
    }}
  >
   Marketplace Management
  </Typography>
  <Typography
    variant="body1"
    sx={{
      textAlign: "center",
      marginBottom: "10px",
      maxWidth: "80%",
    }}
  >
   Our marketplace platform empowers vendors to manage products across multiple channels from one central hub. Leverage effortless product listing, real-time inventory sync, and centralized order management. Gain valuable insights with sales and profit reports, enabling smarter decisions and accurate sales forecasting.
  </Typography>
</Box>

      {/* Right side (login form) */}
      {showForgotPassword ? (
        <ForgotPassword onClose={toggleForgotPassword} />
      ) : showRegisterPage ? (
        <Register />
      ) : (
        <Box
          flex={3} // 30% of the screen
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "#fcdbf91c",
          }}
        >
          <Box
            component={Paper}
            sx={{ pt: 6, pb: 6 }}
            gap={2}
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="100%"
            maxWidth="330px"
          
            mx="auto"
            px={3}
          >
            <Typography variant="h5" color="textPrimary" gutterBottom>
              Sign In
            </Typography>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              fullWidth
              variant="outlined"
              error={!!emailError}
              helperText={emailError}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              fullWidth
              variant="outlined"
              error={!!passwordError}
              helperText={passwordError}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              color="primary"
              style={{
                cursor: "pointer",
                alignSelf: "flex-end",
                marginTop: "5px",
              }}
              onClick={toggleForgotPassword}
            >
              Forgot Password?
            </Typography>

            <Button
        variant="contained"
        onClick={handleLogin}
        fullWidth
        disabled={loading}
        sx={{
          backgroundColor: '#000080',  // Corrected to use backgroundColor
          color: '#fff',  // Ensures text color is #fff for better contrast
          position: 'relative',
          '&:hover': {
            backgroundColor: '#000066',  // Darker shade for hover effect
          },
        }} // Ensure correct color for the button
      >
     Login
      </Button>

      {/* Show the DottedCircleLoading component when loading */}
      {loading && <DottedCircleLoading />}
      

            <Button
              variant="text"
              color="secondary"
              onClick={toggleRegisterPage} // Show Register page on click
              fullWidth
              sx={{ textTransform: "none", color: "#121212" }}
            >
              Don't have an account? SignUp
            </Button>
          </Box>
        </Box>
      )}

      <ToastContainer
        position="top-right" // Position the toasts in the top-right corner
        autoClose={5000} // Close the toast after 5 seconds
        hideProgressBar={false} // Show progress bar
        newestOnTop={false} // Toasts appear in order of arrival
        closeOnClick={true} // Allow the user to close the toast by clicking
        rtl={false} // Disable RTL (right-to-left) language
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> {/* Toast container to show the toasts */}
    </Box>
  );
};

export default LoginPage;
