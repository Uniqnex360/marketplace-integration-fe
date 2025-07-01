// src\App.js
import React from 'react';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';  // Import ToastContainer
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
function App() {
  return <>
  
<ThemeProvider theme={theme}>
  <AppRoutes />
  <ToastContainer />
  </ThemeProvider>
  {/* <ToastContainer /> */}
  </>
}

export default App;
