import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const commonStyles = {
  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
  color: '#485E75',
};

// Function to format amount as currency
const formatCurrency = (value) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `$${value.toFixed(2)}`;
  }
  return '-';
};

// Function to format percentage (this function is still useful for calculations, even if not displayed)
const formatPercentage = (value) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return `${value.toFixed(2)}%`;
  }
  return '-';
};

const AmazonNetUnitProfitability = ({ profitabilityData, unitProfitability, widgetData, startDate, endDate }) => {
  console.log('Net Profitability Data:', profitabilityData);
  // console.log('Unit Profitability Data:', unitProfitability);

  // State for Amazon Unit Profitability export menu
  const [amazonAnchorEl, setAmazonAnchorEl] = useState(null);
  const handleAmazonClick = (event) => setAmazonAnchorEl(event.currentTarget);
  const handleAmazonClose = () => setAmazonAnchorEl(null);

  // State for Walmart Unit Profitability export menu
  const [walmartAnchorEl, setWalmartAnchorEl] = useState(null);
  const handleWalmartClick = (event) => setWalmartAnchorEl(event.currentTarget);
  const handleWalmartClose = () => setWalmartAnchorEl(null);

  // State for Net Profit (All Sales) export menu
  const [netProfitAnchorEl, setNetProfitAnchorEl] = useState(null);
  const handleNetProfitClick = (event) => setNetProfitAnchorEl(event.currentTarget);
  const handleNetProfitClose = () => setNetProfitAnchorEl(null);

  // Data for the Overall Net Profit table
  const overallProfitData = (Array.isArray(profitabilityData) && profitabilityData.length > 0)
    ? profitabilityData[0]
    : (profitabilityData || {});

  // Determine Amazon and Walmart unit profitability data
  const amazonUnitData = Array.isArray(unitProfitability)
    ? unitProfitability.find(data => data.channel === 'Amazon')
    : (unitProfitability && unitProfitability.channel === 'Amazon' ? unitProfitability : null);

  const walmartUnitData = Array.isArray(unitProfitability)
    ? unitProfitability.find(data => data.channel === 'Walmart')
    : (unitProfitability && unitProfitability.channel === 'Walmart' ? unitProfitability : null);

  // --- Calculations for Net Profitability (Overall Sales) ---
  const netTotalSalesBase = typeof overallProfitData.gross_revenue === 'number' && overallProfitData.gross_revenue !== 0
    ? overallProfitData.gross_revenue
    : 1;

  // This function is still needed for the arrow indicators, even if the sales column is hidden
  const calculateNetSalesPercentage = (value) => {
    if (typeof value === 'number' && !isNaN(value) && netTotalSalesBase !== 1) {
      return formatPercentage((value / netTotalSalesBase) * 100);
    }
    return '-';
  };

  const transformedNetProfitabilityData = [
    {
      label: 'Gross Revenue',
      amount: formatCurrency(overallProfitData.gross_revenue),
      sales: calculateNetSalesPercentage(overallProfitData.gross_revenue), // Still calculate for arrow indicators
      value: overallProfitData.gross_revenue
    },
    {
      label: 'Tax Price',
      amount: formatCurrency(overallProfitData.tax_price),
      sales: calculateNetSalesPercentage(overallProfitData.tax_price), // Still calculate for arrow indicators
      value: overallProfitData.tax_price,
    },
    {
      label: 'Base Price',
      amount: formatCurrency(overallProfitData.base_price),
      sales: calculateNetSalesPercentage(overallProfitData.base_price), // Still calculate for arrow indicators
      value: overallProfitData.base_price
    },
    {
      label: 'Product Cost',
      amount: formatCurrency(overallProfitData.product_cost),
      sales: calculateNetSalesPercentage(overallProfitData.product_cost), // Still calculate for arrow indicators
      value: overallProfitData.product_cost,
    },
    {
      label: 'Shipping Cost',
      amount: formatCurrency(overallProfitData.shipping_cost),
      sales: calculateNetSalesPercentage(overallProfitData.shipping_cost), // Still calculate for arrow indicators
      value: overallProfitData.shipping_cost,
    },
    {
      label: 'COGS',
      amount: formatCurrency(overallProfitData.cogs),
      sales: calculateNetSalesPercentage(overallProfitData.cogs), // Still calculate for arrow indicators
      value: overallProfitData.cogs,
    },
    {
      label: 'Channel Fee',
      amount: formatCurrency(overallProfitData.channel_fee),
      sales: calculateNetSalesPercentage(overallProfitData.channel_fee), // Still calculate for arrow indicators
      value: overallProfitData.channel_fee,
    },
    {
      label: 'Gross Profit',
      amount: formatCurrency(overallProfitData.gross_profit),
      sales: calculateNetSalesPercentage(overallProfitData.gross_profit), // Still calculate for arrow indicators
      value: overallProfitData.gross_profit
    },
    {
      label: 'Net Profit',
      amount: formatCurrency(overallProfitData.net_profit),
      sales: calculateNetSalesPercentage(overallProfitData.net_profit), // Still calculate for arrow indicators
      value: overallProfitData.net_profit
    },
  ];

  // --- Function to generate transformed data for Unit Profitability ---
  const getTransformedUnitData = (data, channelName) => {
    if (!data) return [];

    const unitTotalSalesBase = typeof data.base_price === 'number' && data.base_price !== 0
      ? data.base_price
      : 1;

    // This function is still needed for the arrow indicators, even if the sales column is hidden
    const calculateUnitSalesPercentage = (value) => {
      if (typeof value === 'number' && !isNaN(value) && unitTotalSalesBase !== 1) {
        return formatPercentage((value / unitTotalSalesBase) * 100);
      }
      return '-';
    };

    return [
      {
        label: 'Base Price',
        amount: formatCurrency(data.base_price),
        sales: formatPercentage(100), // Still calculate for arrow indicators
        value: data.base_price
      },
      {
        label: 'Product Cost',
        amount: formatCurrency(data.product_cost),
        sales: calculateUnitSalesPercentage(data.product_cost), // Still calculate for arrow indicators
        value: data.product_cost,
      },
      {
        label: 'Shipping Cost',
        amount: formatCurrency(data.shipping_cost),
        sales: calculateUnitSalesPercentage(data.shipping_cost), // Still calculate for arrow indicators
        value: data.shipping_cost,
      },
      {
        label: 'COGS',
        amount: formatCurrency(data.cogs),
        sales: calculateUnitSalesPercentage(data.cogs), // Still calculate for arrow indicators
        value: data.cogs,
      },
      {
        label: 'Gross Profit',
        amount: formatCurrency(data.gross_profit),
        sales: calculateUnitSalesPercentage(data.gross_profit), // Still calculate for arrow indicators
        value: data.gross_profit,
      },
      {
        label: `${channelName} Fee`, // Dynamically set fee label
        // Use specific fee property based on channel, default to 0 if not present
        amount: formatCurrency(data[`${channelName.toLowerCase()}_fee`] || 0),
        sales: calculateUnitSalesPercentage(data[`${channelName.toLowerCase()}_fee`] || 0), // Still calculate for arrow indicators
        value: data[`${channelName.toLowerCase()}_fee`] || 0
      },
      {
        label: 'Net Profit',
        amount: formatCurrency(data.net_profit),
        sales: calculateUnitSalesPercentage(data.net_profit), // Still calculate for arrow indicators
        value: data.net_profit,
      },
    ];
  };

  const transformedAmazonUnitProfitabilityData = getTransformedUnitData(amazonUnitData, 'Amazon');
  const transformedWalmartUnitProfitabilityData = getTransformedUnitData(walmartUnitData, 'Walmart');

  // Modified renderTableContent to accept state and handlers as props
  const renderTableContent = (data, dateRange = null, channelData = null, anchorEl, handleClick, handleClose) => {
    // If data is empty, don't render the table
    if (!data || data.length === 0) {
      return null;
    }

    // Function to handle download option click
    const handleDownloadOptionClick = (type) => {
      let fileName = 'profitability_data';
      if (channelData) {
        fileName = `${channelData.channel.toLowerCase()}_unit_profitability`;
      } else {
        fileName = 'net_profit_all_sales';
      }

      const dataToExport = data.map(row => ({
        Label: row.label,
        Amount: row.amount,
        // Include sales percentage in export, even if not displayed in table
        // SalesPercentage: row.sales,
        // RawValue: row.value
      }));

      if (type === 'CSV') {
        exportToCSV(dataToExport, fileName);
      } else if (type === 'XLS') {
        exportToXLS(dataToExport, fileName);
      }
      handleClose();
    };

    // Placeholder for CSV export logic
    const exportToCSV = (data, fileName) => {
      const header = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join(','));
      const csvContent = `${header}\n${rows.join('\n')}`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Exporting ${fileName}.csv`, data);
    };

    // Placeholder for XLS export logic (simplified for demonstration)
    const exportToXLS = (data, fileName) => {
      // For a proper XLS/XLSX export, you would typically use a library like 'xlsx'
      // This is a very basic CSV-like approach, but with .xls extension
      const header = Object.keys(data[0]).join('\t');
      const rows = data.map(row => Object.values(row).map(value => `"${value}"`).join('\t'));
      const xlsContent = `${header}\n${rows.join('\n')}`;
      const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${fileName}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Exporting ${fileName}.xls`, data);
    };

    return (
      <Paper sx={{ p: 3, ...commonStyles, borderRadius: '8px', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* Conditionally render channel image or title */}
          {channelData && channelData.channel_image ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={channelData.channel_image} alt={`${channelData.channel} logo`} style={{ height: '30px', marginRight: '10px' }} />
            </Box>
          ) : (
            // <Typography variant="h6" sx={{ ...commonStyles, fontWeight: 600 }}>
            //   {dateRange ? 'Net Profit (All Sales)' : 'Unit Profitability'}
            // </Typography>
            <Typography></Typography>
          )}

          {/* Export Button with Menu */}
          <Box>
            <IconButton
              aria-label="more options"
              aria-controls={anchorEl ? 'download-menu' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon sx={{ color: '#485E75' }} />
            </IconButton>
            <Menu
              id="download-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => handleDownloadOptionClick('CSV')}>
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText sx={{
                  color: '#485E75', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                }}>Download CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleDownloadOptionClick('XLS')}>
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText sx={{
                  color: '#485E75', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                }}>Download XLS</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {dateRange && (
          <Typography variant="subtitle2" sx={{ ...commonStyles, mb: 2 }}>
            {dateRange}
          </Typography>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F8FA' }}>
                <TableCell sx={{ ...commonStyles, fontWeight: 600, borderBottom: 'none' }}> </TableCell>
                <TableCell sx={{ ...commonStyles, fontWeight: 600, borderBottom: 'none' }}>Amount</TableCell>
                {/* Commented out the % Sales column header */}
                {/* <TableCell sx={{ ...commonStyles, fontWeight: 600, borderBottom: 'none' }}>% Sales</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ ...commonStyles, borderBottom: '1px solid #EFF3F6' }}>
                    {row.label}
                    {/* COGS arrow indicator: Red for high COGS */}
                    {row.label === 'COGS' && typeof row.value === 'number' && (
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
                        {/* <ArrowDropUpIcon sx={{ color: '#EF5350', fontSize: '1rem' }} /> */}
                        {/* Display sales percentage for COGS arrow indicator */}
                        {/* <Typography variant="caption" sx={{ color: '#EF5350', fontSize: '0.7rem' }}>
                          {row.sales}
                        </Typography> */}
                      </Box>
                    )}
                    {/* Gross Profit and Net Profit arrow indicator: Green for positive, Red for negative */}
                    {(row.label === 'Gross Profit' || row.label === 'Net Profit') && typeof row.value === 'number' && (
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
                        {/* {row.value < 0 ? (
                          <ArrowDropDownIcon sx={{ color: '#EF5350', fontSize: '1rem' }} />
                        ) : (
                          <ArrowDropUpIcon sx={{ color: '#66BB6A', fontSize: '1rem' }} />
                        )} */}
                        {/* Display sales percentage for Gross/Net Profit arrow indicator */}
                        {/* <Typography variant="caption" sx={{ color: row.value < 0 ? '#EF5350' : '#66BB6A', fontSize: '0.7rem' }}>
                          {row.sales}
                        </Typography> */}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ ...commonStyles, borderBottom: '1px solid #EFF3F6' }}>{row.amount} </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#F0F2F5', minHeight: '100vh', ...commonStyles }}>
      <Grid container spacing={4}>
        {/* First Column: Amazon Unit Profitability (Always shown) */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ ...commonStyles, fontWeight: 600, mb: 1 }}>
            Amazon Unit Profitability
          </Typography>
          <Typography variant="body2" sx={{ ...commonStyles, fontSize: '0.85rem', mb: 2 }}>
            This table shows profitability per unit for the product on Amazon, based on current data.
          </Typography>
          {/* Pass amazonUnitData, and Amazon-specific state and handlers */}
          {renderTableContent(
            transformedAmazonUnitProfitabilityData,
            null, // No date range for unit profitability
            amazonUnitData,
            amazonAnchorEl,
            handleAmazonClick,
            handleAmazonClose
          )}
        </Grid>

        {/* Second Column: Walmart Unit Profitability (Conditionally shown if data exists) */}
        {walmartUnitData && (
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ ...commonStyles, fontWeight: 600, mb: 1 }}>
              Walmart Unit Profitability
            </Typography>
            <Typography variant="body2" sx={{ ...commonStyles, fontSize: '0.85rem', mb: 2 }}>
              This table shows profitability per unit for the product on Walmart, based on current data.
            </Typography>
            {/* Pass walmartUnitData, and Walmart-specific state and handlers */}
            {renderTableContent(
              transformedWalmartUnitProfitabilityData,
              null, // No date range for unit profitability
              walmartUnitData,
              walmartAnchorEl,
              handleWalmartClick,
              handleWalmartClose
            )}
          </Grid>
        )}

        {/* Third Column: Net Profit (All Sales) (Always shown) */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ ...commonStyles, fontWeight: 600, mb: 1 }}>
            Net Profit (All Sales)
          </Typography>
          <Typography variant="body2" sx={{ ...commonStyles, fontSize: '0.85rem', mb: 2 }}>
            This table summarizes the overall net profit for all sales within the specified period. Does not include store level fixed costs.
          </Typography>
          {/* For the Net Profit table, there's no specific channel image, so pass null for channelData,
              and Net Profit-specific state and handlers.
              The `dateRange` prop is now explicitly `null` to remove the date display. */}
          {renderTableContent(
            transformedNetProfitabilityData,
            null, // This is changed from 'Jun 2, 2025 - Jun 4, 2025' to null
            null, // No channelData for the overall net profit table
            netProfitAnchorEl,
            handleNetProfitClick,
            handleNetProfitClose
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AmazonNetUnitProfitability;