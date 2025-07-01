import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Box, Typography, CircularProgress, Paper } from '@mui/material';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailError, setEmailError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;

    if (!firstName) {
      setFirstNameError('First Name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName) {
      setLastNameError('Last Name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!mobileNumber) {
      setMobileNumberError('Mobile Number is required');
      isValid = false;
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      setMobileNumberError('Mobile Number must be 10 digits');
      isValid = false;
    } else {
      setMobileNumberError('');
    }

    return isValid;
  };

  const handleFieldChange = (setter, errorSetter) => (event) => {
    const value = event.target.value;
    setter(value);
    if (value.trim() !== '') {
      errorSetter(''); // Clear error when valid
    }
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const emailCheckResponse = await axios.get(`${process.env.REACT_APP_IP}checkEmailExistOrNot/`, {
        params: { email },
      });

      if (emailCheckResponse.data?.data?.is_exist) {
        setEmailError('This email is already in use. Please use a different email.');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_IP}signupUser/`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile_number: mobileNumber,
      });

      if (response.data && response.data.status) {
        alert('Registration successful! You can now login.');
        navigate('/'); // Redirect to login page
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" height="100vh">
      {/* Left side: Image banner */}
      {/* <Box flex={1} display="flex" justifyContent="center" alignItems="center">
        <Box sx={{ backgroundColor: '#A34498', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', py: 6 }}>
          <Typography variant="p" color="#fff" gutterBottom sx={{ fontWeight: '500', fontSize: '2rem', fontFamily: 'sans-serif', marginBottom: 2 }}>
            Welcome !
          </Typography>

          <Typography variant="p" color="#fff" gutterBottom sx={{ fontWeight: '400', fontSize: '1rem', fontFamily: 'sans-serif', marginBottom: 6, textAlign: 'center', width: '70%', margin: '0 auto 5rem auto' }}>
            Seamlessly extract and manage data from your invoices with our automated system. Upload your files, and let our tool quickly process and display relevant details for your review.
          </Typography>

          <img 
            style={{ maxWidth: '80%', height: 'auto', borderRadius: '6px', border: '10px solid #fff' }} // Ensure it fits well in the container
          />
        </Box>
      </Box> */}

      {/* Right side: Register Form */}
      <Box flex={1} display="flex" justifyContent="center" alignItems="center" sx={{width:'500px'}}>
        <Box component={Paper} display="flex" flexDirection="column" alignItems="center" gap={2} width="100%" maxWidth="400px" mx="auto" py={5} px={3}>
          <Typography variant="h5" color="textPrimary" gutterBottom>
            Sign Up
          </Typography>

          <TextField
            label="First Name"
            value={firstName}
            onChange={handleFieldChange(setFirstName, setFirstNameError)}
            fullWidth
            variant="outlined"
            error={!!firstNameError}
            helperText={firstNameError}
          />

          <TextField
            label="Last Name"
            value={lastName}
            onChange={handleFieldChange(setLastName, setLastNameError)}
            fullWidth
            variant="outlined"
            error={!!lastNameError}
            helperText={lastNameError}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={handleFieldChange(setEmail, setEmailError)}
            fullWidth
            variant="outlined"
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
            label="Mobile Number"
            type="text"
            value={mobileNumber}
            onChange={handleFieldChange(setMobileNumber, setMobileNumberError)}
            fullWidth
            variant="outlined"
            error={!!mobileNumberError}
            helperText={mobileNumberError}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            fullWidth
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={() => navigate('/')}
            fullWidth
            sx={{ textTransform: 'none', color: '#121212' }}
          >
            Already have an account? SignIn
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
