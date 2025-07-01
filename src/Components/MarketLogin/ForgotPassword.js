import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  // Step 1: Request OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}forgotPassword/`, { email });

      if (response.data.status) {
        setMessage(response.data.message);
        setUserId(response.data.user_id);
        setStep(2);
      } else {
        setError('Error sending OTP. Please try again.');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}changePassword/`, {
        user_id: userId,
        otp: parseInt(otp, 10),
        password: newPassword,
      });

      if (response.data.status) {
        setMessage(response.data.message);
        setTimeout(onClose, 2000);
      } else {
        setError('Error resetting password. Try again.');
      }
    } catch (err) {
      setError('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="70vh"
      width= "400px"
      sx={{ backgroundColor: '#fcdbf91c',    padding: '56px', }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 3,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          {step === 1 ? 'Forgot Password' : 'Reset Password'}
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          {step === 1
            ? 'Enter your email to receive an OTP to reset your password.'
            : 'Enter the OTP and your new password.'}
        </Typography>

        {step === 1 ? (
          <>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendOtp}
              disabled={loading || !email}
              fullWidth
              sx={{ height: 50, borderRadius: 2, fontSize: '16px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              disabled={loading || !otp || !newPassword || !confirmPassword}
              fullWidth
              sx={{ height: 50, borderRadius: 2, fontSize: '16px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </>
        )}

        {message && <Typography color="success.main" align="center">{message}</Typography>}
        {error && <Typography color="error.main" align="center">{error}</Typography>}

        <Button onClick={onClose} sx={{textTransform:'capitalize'}} color="primary" fullWidth>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
