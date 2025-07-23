import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Paper, Box, CircularProgress, IconButton, ListItemText, MenuItem, ListItemIcon, Menu } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import moment from 'moment'; // Import moment for date formatting
import {
  Download as DownloadIcon, Delete,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon, // Correct icon for image downloads
} from '@mui/icons-material';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver'; // Typically for blobs, but can be used for direct file saves too

// Import xlsx for XLS download (install with `npm install xlsx` or `yarn add xlsx`)
import * as XLSX from 'xlsx';

// Define the common font family and color
const commonFontFamily = "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";
const commonColor = '#485E75';

// Define the color palette and typography with the common font family and color.
const inventoryTheme = createTheme({
  typography: {
    fontFamily: commonFontFamily,
    h6: {
      color: commonColor,
    },
    subtitle2: {
      color: commonColor,
    },
    body2: {
      color: commonColor,
    },
  },
  palette: {
    available: {
      main: 'rgb(0, 56, 115)', // Dark Blue
    },
    reserved: {
      main: 'rgb(35, 136, 255)', // Light Blue
    },
    inbound: {
      main: 'rgb(76, 229, 178)', // Light Green
    },
    unfulfillable: {
      main: 'rgb(166, 183, 201)', // Light Red
    },
    text: { // Ensure textSecondary and other text colors use this
      secondary: commonColor,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          color: commonColor, // Apply common color to the Paper component's text
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: commonColor, // Apply common color to all Typography components by default
        },
      },
    },
    // You might need to add overrides for Recharts components if their text doesn't inherit
    // For XAxis, YAxis ticks, and Tooltip, you might need to set style directly in the component.
  },
});

const CustomTooltip = ({ active, payload, label, inventoryTheme }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // Access the entire data object for the hovered bar

    return (
      <Paper
        elevation={3}
        sx={{
          padding: '12px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          fontFamily: commonFontFamily,
          color: commonColor,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '8px', color: '#121212' }}>
          {moment(label).format('MMM D')} {/* Format the date as "May 15" */}
        </Typography>
        {/* Render each item from the tooltip based on the image */}

        <Box display="flex" alignItems="center" mb={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: inventoryTheme.palette.available.main, mr: 1 }} />
          <Typography variant="body2">Available: <span style={{ fontWeight: 'bold' }}>{dataPoint.Available || 0}</span></Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: inventoryTheme.palette.reserved.main, mr: 1 }} />
          <Typography variant="body2">Reserved: <span style={{ fontWeight: 'bold' }}>{dataPoint.Reserved || 0}</span></Typography>
        </Box>
           <Box display="flex" alignItems="center" mb={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: inventoryTheme.palette.inbound.main, mr: 1 }} />
          <Typography variant="body2">Inbound: <span style={{ fontWeight: 'bold' }}>{dataPoint.inbound || 0}</span></Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: inventoryTheme.palette.unfulfillable.main, mr: 1 }} />
          <Typography variant="body2">Unfulfillable: <span style={{ fontWeight: 'bold' }}>{dataPoint.unfulfillable || 0}</span></Typography>
        </Box>
        {/* You can add more categories if they are present in your data */}
      
      </Paper>
    );
  }
  return null;
};


const InventoryGraph = ({ productId, widgetData, startDate, endDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastParamsRef = useRef('');
  const [inventoryDate, setInventoryDate] = useState(''); // Initialize with empty string
  const [anchorEl, setAnchorEl] = useState(null);

  const openDownloadMenu = Boolean(anchorEl);
  const downloadButtonRef = useRef(null);
  const chartContainerRef = useRef(null); // Ref for the chart container


  const handleRemoveWidget = () => {
    console.log('Remove widget clicked');
    // Implement your remove widget logic here
  };

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setAnchorEl(null);
  };

  // Dummy data for summary and summaryOther for CSV/XLS generation to prevent errors.
  // In a real application, this data would come from an API call similar to `fetchInventoryGraph`.
  // You would need to fetch this summary data alongside your graph data or as a separate call.
  const dummySummaryData = {
    grossRevenue: { current: 1000, previous: 900, delta: 100 },
    expenses: { current: 300, previous: 250, delta: 50 },
    netProfit: { current: 700, previous: 650, delta: 50 },
    refunds: { current: 20, previous: 15, delta: 5 },
  };

  const dummySummaryOtherData = {
    current: {
      cogs: 150, base_price: 1000, giftwrapPrice: 10, totalTax: 50, shipping: 20,
      shippingChargeback: 5, giftwrapChargeback: 2, reimbursements: 10, amazonFees: 80, ppcCosts: 40, totalTaxCost: 30
    },
    previous: {
      cogs: 140, base_price: 950, giftwrapPrice: 8, totalTax: 45, shipping: 18,
      shippingChargeback: 4, giftwrapChargeback: 1.5, reimbursements: 8, amazonFees: 75, ppcCosts: 35, totalTaxCost: 28
    },
  };


  const handleDownloadOptionClick = async (option) => {
    console.log(`Download option "${option}" clicked`);
    handleCloseDownloadMenu();

    if (option === 'PDF' && chartContainerRef.current) {
      setLoading(true); // Indicate loading for PDF generation
      try {
        const canvas = await html2canvas(chartContainerRef.current, { scale: 2 }); // Increase scale for better quality
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
        const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Inventory_Graph_${moment().format('YYYY-MM-DD')}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    } else if (option === 'PNG' && chartContainerRef.current) {
      try {
        const canvas = await html2canvas(chartContainerRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.download = `Inventory_Graph_${moment().format('YYYY-MM-DD')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating PNG:', error);
      }
    } else if (option === 'JPEG' && chartContainerRef.current) {
      try {
        const canvas = await html2canvas(chartContainerRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.download = `Inventory_Graph_${moment().format('YYYY-MM-DD')}.jpeg`;
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      } catch (error) {
        console.error('Error generating JPEG:', error);
      }
    } else if (option === 'CSV') {
      // Use the actual 'data' from the component's state for chart data
      // And the dummy summary data for demonstration.
      const csvContent = [];



      // Add chart data
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        csvContent.push(headers);
        data.forEach(item => {
          csvContent.push(Object.values(item).join(','));
        });
      } else {
        csvContent.push("No chart data available.");
      }

      const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      saveAs(csvBlob, `Inventory_Data_${moment().format('YYYY-MM-DD')}.csv`);

    } else if (option === 'XLS') {
      // Implement XLS download logic here using the 'xlsx' library
      // Combine summary data and chart data into a single array of objects
      const combinedData = [];

 
      // Add chart data
      if (data.length > 0) {
        data.forEach(item => combinedData.push(item));
      } else {
        combinedData.push({ Message: "No chart data available." });
      }

      const ws = XLSX.utils.json_to_sheet(combinedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory Data");
      XLSX.writeFile(wb, `Inventory_Data_${moment().format('YYYY-MM-DD')}.xlsx`);
    }
  };

  const handleDownloadCSV = () => {
    handleDownloadOptionClick('CSV');
  };

  const handleDownloadXLS = () => {
    handleDownloadOptionClick('XLS');
  };

  const formatXAxis = (tickItem) => {
    if (widgetData === 'today' || widgetData === 'yesterday') {
      return moment(tickItem, 'HH').format('h:mm a');
    }
    // Assuming API already sends "MMM DD" format for daily, so no change needed.
    // If your API sends full dates, you might need: return moment(tickItem).format('MMM D');
    return tickItem;
  };

  const displayedDateRange = () => {
    if (widgetData === 'today') {
      return moment().format('MMM D, YYYY');
    }
    if (widgetData === 'yesterday') {
      return moment().subtract(1, 'day').format('MMM D, YYYY');
    }
    if (startDate && endDate) {
      return `${moment(startDate).format('MMM D, YYYY')} - ${moment(endDate).format('MMM D, YYYY')}`;
    }
    return 'Date Range';
  };

  const fetchInventoryGraph = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';
    const payload = {
      product_id: productId,
      user_id: userId,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (widgetData) {
      payload.preset = widgetData;
    } else {
      payload.start_date = startDate?.format('YYYY-MM-DD');
      payload.end_date = endDate?.format('YYYY-MM-DD');
    }

    const paramsKey = JSON.stringify(payload);
    if (lastParamsRef.current === paramsKey) return; // Prevent duplicate fetch
    lastParamsRef.current = paramsKey;

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}getInventryLogForProductdaywise/`, payload);
      if (response?.data?.status && Array.isArray(response.data.data?.response_data)) {
        // Ensure data points have all required keys for the tooltip, even if 0
        const processedData = response.data.data.response_data.map(item => ({
          ...item,
          Inbound: item.Inbound || 0,
          Available: item.Available || 0,
          Reserved: item.Reserved || 0,
          Unfulfillable: item.Unfulfillable || 0,
        }));
        setData(processedData);
        setInventoryDate(response.data.data.date_range_label);
      } else {
        setData([]);
        setInventoryDate('');
      }
    } catch (error) {
      console.error('Inventory graph error:', error);
      setData([]);
      setInventoryDate('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchInventoryGraph();
  }, [productId, widgetData, startDate, endDate]);

  return (
    <ThemeProvider theme={inventoryTheme}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6" sx={{ color: '#121212' }}>Inventory</Typography>
            <Typography variant="subtitle2">{inventoryDate}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <IconButton
                aria-label="download"
                size="small"
                onClick={handleDownloadClick}
                ref={downloadButtonRef}
              >
                <MoreVertIcon /> {/* Use MoreVertIcon as it's typically for "more options" */}
              </IconButton>
              <Menu
                id="download-menu"
                anchorEl={anchorEl}
                open={openDownloadMenu}
                onClose={handleCloseDownloadMenu}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <Box sx={{ borderBottom: '1px solid #ddd' }}>
                  <MenuItem
                    sx={{
                      color: '#485E75',
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                    }}
                    onClick={() => handleDownloadOptionClick('PNG')}
                  >
                    <ListItemIcon>
                      <ImageIcon sx={{ width: '18px', height: '18px', paddingRight: '3px' }} />
                    </ListItemIcon>
                    <ListItemText primary="Download PNG image" />
                  </MenuItem>
                  <MenuItem
                    sx={{
                      color: '#485E75',
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                    }}
                    onClick={() => handleDownloadOptionClick('JPEG')}
                  >
                    <ListItemIcon>
                      <ImageIcon sx={{ width: '18px', height: '18px', paddingRight: '3px' }} />
                    </ListItemIcon>
                    <ListItemText primary="Download JPEG image" />
                  </MenuItem>
                  <MenuItem
                    sx={{
                      color: '#485E75',
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                    }}
                    onClick={() => handleDownloadOptionClick('PDF')}
                  >
                    <ListItemIcon sx={{ fontSize: '14px' }}>
                      <PdfIcon sx={{ width: '18px', height: '18px', paddingRight: '-7px' }} />
                    </ListItemIcon>
                    <ListItemText primary="Download PDF document" />
                  </MenuItem>
                </Box>
                <Box sx={{ borderBottom: '1px solid #ddd' }}>
                  <MenuItem
                    onClick={handleDownloadCSV}
                    sx={{
                      color: '#485E75',
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                    }}
                  >
                    <ListItemIcon>
                      <DownloadIcon sx={{ width: '18px', height: '18px', paddingRight: '3px' }} /> {/* Changed to DownloadIcon */}
                    </ListItemIcon>
                    <ListItemText primary="Download CSV" />
                  </MenuItem>
                  <MenuItem
                    onClick={handleDownloadXLS}
                    sx={{
                      color: '#485E75',
                      fontFamily: "'Nunito Sans', sans-serif",
                      fontSize: 14,
                    }}
                  >
                    <ListItemIcon>
                      <DownloadIcon sx={{ width: '18px', height: '18px', paddingRight: '3px' }} /> {/* Changed to DownloadIcon */}
                    </ListItemIcon>
                    <ListItemText primary="Download XLS" />
                  </MenuItem>
                </Box>
                <MenuItem onClick={handleRemoveWidget}>
                  <ListItemIcon>
                    <Delete sx={{ width: '18px', height: '18px', paddingRight: '3px' }} />
                  </ListItemIcon>
                  <ListItemText primary="Remove" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress sx={{ color: commonColor }} />
          </Box>
        ) : data.length > 0 ? (
          <>
            <Box ref={chartContainerRef} sx={{ width: '100%', height: 400 }}> {/* Added ref here */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="date"
                    tickFormatter={formatXAxis}
                    tick={{ fill: commonColor, fontSize: 12 }}
                    axisLine={{ stroke: commonColor }}
                  />

                  <YAxis
                    tick={{ fill: commonColor, fontSize: 12.8 }}
                    axisLine={{ stroke: commonColor }}
                  />

                  {/* Custom Tooltip */}
                  <Tooltip content={<CustomTooltip inventoryTheme={inventoryTheme} />} />

                  {/* Using stackId="a" to stack the bars */}
                  <Bar dataKey="Available" stackId="a" fill={inventoryTheme.palette.available.main} />
                  <Bar dataKey="Reserved" stackId="a" fill={inventoryTheme.palette.reserved.main} />
                  <Bar dataKey="Inbound" stackId="a" fill={inventoryTheme.palette.inbound.main} />
                  <Bar dataKey="Unfulfillable" stackId="a" fill={inventoryTheme.palette.unfulfillable.main} />
                 
                   </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Custom Legend for the main chart, as per the image */}
            <Box mt={2} display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              {[
                { label: 'Available', color: inventoryTheme.palette.available.main },
                { label: 'Reserved', color: inventoryTheme.palette.reserved.main },
                   { label: 'Inbound', color: inventoryTheme.palette.inbound.main },
                { label: 'Unfulfillable', color: inventoryTheme.palette.unfulfillable.main },
                  ].map((item) => (
                <Box key={item.label} display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              ))}
            </Box>

          </>
        ) : (
          <Typography variant="body2" align="center" color="textSecondary">
            No inventory data available for the selected date range.
          </Typography>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default InventoryGraph;