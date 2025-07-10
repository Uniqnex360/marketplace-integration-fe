import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, Grid, IconButton, TableCell, TableRow, TableHead,
    TableBody, Paper, Table, TableContainer, TextField, Button, Snackbar, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {  Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const CostOfGoodsSold = ({ marketplaces, dateRange, productData }) => {
    const [editMode, setEditMode] = useState(false);
    const [editableMarketplaces, setEditableMarketplaces] = useState([]);
    const [newEntry, setNewEntry] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const tableRef = useRef(null);

    // Destructure productData for easier access
    const productTitle = productData?.product_title || 'N/A';
    const asin = productData?.['asin/wpid'] || 'N/A';
    const sku = productData?.SKU || 'N/A';

    /**
     * Helper to parse dateRange string into start and end dates in YYYY-MM-DD format.
     * 'Current' is preserved as a string.
     * This function now correctly handles the `dateRange` format "MMM DD, YYYY - Current"
     * and ensures the parsed dates are in YYYY-MM-DD for consistency or 'Current'.
     */
    const parseDateRange = (rangeString) => {
        if (!rangeString) return { startDate: '', endDate: '' };

        const parts = rangeString.split(' - ');
        const startDatePart = parts[0] || '';
        const endDatePart = parts[1] || '';

        // Function to parse a display date string (e.g., "Mar 07, 2025") into YYYY-MM-DD format
        const parseDisplayDateToLocalISO = (dateString) => {
            if (!dateString || dateString.toLowerCase() === 'current') return 'Current'; // Preserve 'Current'

            try {
                // Create a Date object. For "MMM DD, YYYY" format, this usually sets the time to 00:00:00 in local time.
                const date = new Date(dateString);

                // Check if the date is valid.
                if (!isNaN(date.getTime())) {
                    // Extract local year, month, and day to avoid timezone shifts when formatting to YYYY-MM-DD.
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
                }
            } catch (e) {
                console.error("Error parsing dateString:", dateString, e);
            }
            return ''; // Return empty string if parsing fails
        };

        const startDate = parseDisplayDateToLocalISO(startDatePart);
        const endDate = parseDisplayDateToLocalISO(endDatePart);

        return { startDate, endDate };
    };

    /**
     * Helper function to format date for display (DD/MM/YYYY) or input (YYYY-MM-DD).
     * Correctly handles 'Current' and invalid dates, using local date components for consistency.
     */
    const formatDate = (dateString, forInput = false) => {
        if (!dateString || String(dateString).toLowerCase() === 'current') {
            return 'Current'; // Always return 'Current' string if the value is 'Current'
        }
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Return original if invalid date
            }

            if (forInput) {
                // Return YYYY-MM-DD for input type="date", ensuring it reflects the local date.
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } else {
                // Return DD/MM/YYYY for display.
                return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            }
        } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return dateString; // Fallback to original string on error
        }
    };


    // Initialize editableMarketplaces when props change or component mounts
    useEffect(() => {
        if (marketplaces) {
            const { startDate: parsedStartDate, endDate: parsedEndDate } = parseDateRange(dateRange);
            // console.log(parsedStartDate, 'parsedStartDate in useEffect'); // You can keep this log to verify the parsed date

            const updatedMarketplaces = marketplaces.map(mp => {
                return {
                    ...mp,
                    // Use the parsed dates directly, which are now correctly formatted as YYYY-MM-DD
                    startDate: parsedStartDate,
                    endDate: parsedEndDate,
                   product_cost: parseFloat(mp.product_cost || 0).toFixed(2),
                    shipping_cost: parseFloat(mp.shipping_cost || 0).toFixed(2),
                    total_cogs: calculateTotalCOGS(mp.product_cost, mp.shipping_cost),
                   };
            });
            setEditableMarketplaces(JSON.parse(JSON.stringify(updatedMarketplaces)));
        } else {
            setEditableMarketplaces([]);
        }
    }, [marketplaces, dateRange]); // Dependency on dateRange to re-parse if it changes

    const calculateTotalCOGS = (productCost, shippingCost) => {
        return (parseFloat(productCost || 0) + parseFloat(shippingCost || 0)).toFixed(2);
    };

    const handleSaveClick = () => {
        console.log("Saving changes:", editableMarketplaces);
        setSnackbarMessage("Changes saved successfully (client-side mock).");
        setSnackbarOpen(true);
        setEditMode(false);
        setNewEntry(null);
    };

    const handleCancelClick = () => {
        if (marketplaces) {
            const { startDate: parsedStartDate, endDate: parsedEndDate } = parseDateRange(dateRange);
            const initialMarketplaces = marketplaces.map(mp => {
                return {
                    ...mp,
                    startDate: parsedStartDate,
                    endDate: parsedEndDate,
                    product_cost: parseFloat(mp.product_cost || 0).toFixed(2),
                    shipping_cost: parseFloat(mp.shipping_cost || 0).toFixed(2),
                    total_cogs: calculateTotalCOGS(mp.product_cost, mp.shipping_cost),
                };
            });
            setEditableMarketplaces(JSON.parse(JSON.stringify(initialMarketplaces)));
        } else {
            setEditableMarketplaces([]);
        }
        setEditMode(false);
        setNewEntry(null);
    };

    const handleInputChange = (e, index, field) => {
        const value = e.target.value;
        setEditableMarketplaces(prevMarketplaces => {
            const updated = [...prevMarketplaces];
            let newValue = value;

            // Handle date fields specifically
            if (field === 'startDate' || field === 'endDate') {
                if (value === '') { // If the date input is cleared
                    // If it's the endDate and it was "Current", keep it as "Current" in state
                    if (field === 'endDate' && updated[index][field].toLowerCase() === 'current') {
                        newValue = 'Current';
                    } else {
                        newValue = ''; // Otherwise, set to empty string
                    }
                } else {
                    // For date inputs, value is already YYYY-MM-DD
                    newValue = value;
                }
            }

            updated[index] = {
                ...updated[index],
                [field]: newValue,
            };

            // Recalculate total_cogs if product_cost or shipping_cost changes
            if (field === 'product_cost' || field === 'shipping_cost') {
                const productCost = parseFloat(updated[index].product_cost || 0);
                const shippingCost = parseFloat(updated[index].shipping_cost || 0);
                updated[index].total_cogs = (productCost + shippingCost).toFixed(2);
            }
            return updated;
        });
    };

    const handleNewEntryInputChange = (e, field) => {
        const value = e.target.value;
        setNewEntry(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'product_cost' || field === 'shipping_cost') {
                const productCost = parseFloat(updated.product_cost || 0);
                const shippingCost = parseFloat(updated.shipping_cost || 0);
                updated.total_cogs = (productCost + shippingCost).toFixed(2);
            }
            return updated;
        });
    };


    const handleAddEntryConfirm = () => {
        // Validation for new entry
        if (!newEntry.name.trim()) {
            setSnackbarMessage("Channel name cannot be empty.");
            setSnackbarOpen(true);
            return;
        }

        // Check if at least one cost field is filled
        if (newEntry.product_cost === '' && newEntry.shipping_cost === '') {
            setSnackbarMessage("Please fill in at least one cost (Product Cost or Shipping Cost) for the new entry.");
            setSnackbarOpen(true);
            return;
        }

        setEditableMarketplaces(prev => [...prev, newEntry]);
        setNewEntry(null);
        setSnackbarMessage("New entry added.");
        setSnackbarOpen(true);
    };

    const handleAddEntryCancel = () => {
        setNewEntry(null);
    };

    const handleRemoveEntry = (indexToRemove) => {
        setEditableMarketplaces(prevMarketplaces => {
            const updated = prevMarketplaces.filter((_, index) => index !== indexToRemove);
            return updated;
        });
        setSnackbarMessage("Entry removed.");
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleDownloadClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseDownloadMenu = () => {
        setAnchorEl(null);
    };

    const handleDownloadOptionClick = async (option) => {
        handleCloseDownloadMenu();

     if (option === 'CSV') {
  const csvContent = [];
  const headers = ['Product Title', 'ASIN', 'SKU', 'Channel', 'Start Date', 'End Date', 'Product Cost', 'Shipping Cost', 'Total COGS'];
  csvContent.push(headers.join(','));

  editableMarketplaces.forEach(item => {
    const row = [
      productTitle,
      asin,
      sku,
      item.name,
      formatDate(item.startDate, false),
      formatDate(item.endDate, false),
      `$${parseFloat(item.product_cost || 0).toFixed(2)}`,
      `$${parseFloat(item.shipping_cost || 0).toFixed(2)}`,
      `$${parseFloat(item.total_cogs || 0).toFixed(2)}`,
    ].map(field => {
      if (typeof field === 'string') {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return `"${field}"`;
    }).join(',');

    csvContent.push(row);
  });

  const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  saveAs(csvBlob, `CostOfGoodsSold_Data_${new Date().toISOString().slice(0, 10)}.csv`);
  setSnackbarMessage("CSV downloaded successfully.");
  setSnackbarOpen(true);
}
 else if (option === 'XLS') {
            const dataForXLS = editableMarketplaces.map(item => ({
                'Product Title': productTitle,
                'ASIN': asin,
                'SKU': sku,
                'Channel': item.name,
                // Use formatDate for display in CSV/XLS, which handles 'Current'
                'Start Date': formatDate(item.startDate, false),
                'End Date': formatDate(item.endDate, false),
                  'Product Cost': `$${parseFloat(item.product_cost || 0).toFixed(2)}`, // Add $ symbol
                'Shipping Cost': `$${parseFloat(item.shipping_cost || 0).toFixed(2)}`, // Add $ symbol
                'Total COGS': `$${parseFloat(item.total_cogs || 0).toFixed(2)}`,        // Add $ symbol
           
            }));

            const ws = XLSX.utils.json_to_sheet(dataForXLS);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "COGS Data");
            XLSX.writeFile(wb, `CostOfGoodsSold_Data_${new Date().toISOString().slice(0, 10)}.xlsx`);
            setSnackbarMessage("XLS downloaded successfully.");
            setSnackbarOpen(true);
        }
    };

    return (
        <Grid item xs={12} >
            <Paper
                sx={{
                    border: 'solid 1px #ddd',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    padding: { xs: '24px', sm: '32px' },
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    color: '#485E75',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Typography variant="h5" component="h2" sx={{
                        fontWeight: 'bold',
                        color: '#212B36', fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

                    }}>
                        Cost of Goods Sold
                    </Typography>
                    <Box>
                        <IconButton aria-label="more options" onClick={handleDownloadClick}>
                            <MoreVertIcon sx={{ color: '#485E75' }} />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseDownloadMenu}
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


                <hr style={{ border: 'none', borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }} />


                <TableContainer ref={tableRef}>
                    <Table aria-label="cost of goods sold table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: '600', color: '#121212', borderBottom: '1px solid #e0e0e0', }}>Channel</TableCell>
                                <TableCell sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", fontWeight: '600', color: '#121212', borderBottom: '1px solid #e0e0e0' }}>Date</TableCell>
                                <TableCell align="right" sx={{
                                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: '600', color: '#485E75', borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <Box sx={{ color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <FiberManualRecordIcon sx={{ color: '#9c27b0', fontSize: '12px', mr: 0.5 }} />
                                        Product Cost
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{
                                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: '600', color: '#485E75', borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <Box sx={{ color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <FiberManualRecordIcon sx={{ color: '#ef5350', fontSize: '12px', mr: 0.5 }} />
                                        Shipping Cost
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{
                                    color: '#121212',
                                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                    fontWeight: '600', color: '#485E75', borderBottom: '1px solid #e0e0e0'
                                }}>
                                    <Box sx={{ color: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        Total COGS
                                    </Box></TableCell>
                                {editMode && <TableCell></TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {editableMarketplaces && Array.isArray(editableMarketplaces) && editableMarketplaces.length > 0 ? (
                                editableMarketplaces.map((marketplace, index) => (
                                    <TableRow key={marketplace.tempId || index}>
                                        <TableCell sx={{
                                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            color: '#485E75', borderBottom: 'none'
                                        }}>
                                            {editMode ? (
                                                <TextField
                                                    value={marketplace.name}
                                                    onChange={(e) => handleInputChange(e, index, 'name')}
                                                    size="small"
                                                    variant="standard"
                                                    sx={{ width: '100px' }}
                                                />
                                            ) : (
                                                marketplace.name
                                            )}
                                        </TableCell>
                                        <TableCell component="th" scope="row" sx={{
                                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            color: '#485E75', borderBottom: 'none'
                                        }}>
                                            {editMode ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        type="date"
                                                        // Bind startDate to input, if 'Current' or empty, show empty string
                                                        value={marketplace.startDate === 'Current' || marketplace.startDate === '' ? '' : formatDate(marketplace.startDate, true)}
                                                        onChange={(e) => handleInputChange(e, index, 'startDate')}
                                                        size="small"
                                                        variant="standard"
                                                        sx={{ width: '130px' }}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                    -
                                                    <TextField
                                                        type="date"
                                                        // Bind endDate to input, if 'Current' or empty, show empty string for date input
                                                        value={marketplace.endDate === 'Current' || marketplace.endDate === '' ? '' : formatDate(marketplace.endDate, true)}
                                                        onChange={(e) => handleInputChange(e, index, 'endDate')}
                                                        size="small"
                                                        variant="standard"
                                                        sx={{
                                                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                            width: '130px'
                                                        }}
                                                        InputLabelProps={{ shrink: true }}
                                                        // Placeholder for 'Current' if the value is 'Current'
                                                        placeholder={marketplace.endDate === 'Current' ? 'Current' : ''}
                                                    />
                                                </Box>
                                            ) : (
                                                // Display the dates as DD/MM/YYYY or 'Current'
                                                `${formatDate(marketplace.startDate, false)} - ${formatDate(marketplace.endDate, false)}`
                                            )}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                            {editMode ? (
                                                <TextField
                                                    value={marketplace.product_cost}
                                                    onChange={(e) => handleInputChange(e, index, 'product_cost')}
                                                    type="number"
                                                    size="small"
                                                    variant="standard"
                                                    inputProps={{ step: "0.01" }}
                                                    sx={{
                                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                        width: '80px'
                                                    }}
                                                />
                                            ) : (
                                                `$${parseFloat(marketplace.product_cost || 0).toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                            {editMode ? (
                                                <TextField
                                                    value={marketplace.shipping_cost}
                                                    onChange={(e) => handleInputChange(e, index, 'shipping_cost')}
                                                    type="number"
                                                    size="small"
                                                    variant="standard"
                                                    inputProps={{ step: "0.01" }}
                                                    sx={{
                                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                        width: '80px'
                                                    }}
                                                />
                                            ) : (
                                                `$${parseFloat(marketplace.shipping_cost || 0).toFixed(2)}`
                                            )}
                                        </TableCell>
                                        <TableCell align="right" sx={{
                                            fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            color: '#485E75', borderBottom: 'none'
                                        }}>
                                            ${parseFloat(marketplace.total_cogs || 0).toFixed(2)}
                                        </TableCell>
                                        {editMode && (
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleRemoveEntry(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={editMode ? 6 : 5} align="center" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                        No COGS data available for marketplaces.
                                    </TableCell>
                                </TableRow>
                            )}

                            {newEntry && (
                                <TableRow key="new-entry-row">
                                    <TableCell sx={{ color: '#485E75', borderBottom: 'none' }}>
                                        <TextField
                                            placeholder="Channel Name"
                                            value={newEntry.name}
                                            onChange={(e) => handleNewEntryInputChange(e, 'name')}
                                            size="small"
                                            variant="standard"
                                            sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", width: '100px' }}
                                        />
                                    </TableCell>
                                    <TableCell component="th" scope="row" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                type="date"
                                                value={newEntry.startDate === 'Current' || newEntry.startDate === '' ? '' : formatDate(newEntry.startDate, true)}
                                                onChange={(e) => handleNewEntryInputChange(e, 'startDate')}
                                                size="small"
                                                variant="standard"
                                                sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", width: '130px' }}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                            -
                                            <TextField
                                                type="date"
                                                value={newEntry.endDate === 'Current' || newEntry.endDate === '' ? '' : formatDate(newEntry.endDate, true)}
                                                onChange={(e) => handleNewEntryInputChange(e, 'endDate')}
                                                size="small"
                                                variant="standard"
                                                sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", width: '130px' }}
                                                InputLabelProps={{ shrink: true }}
                                                placeholder={newEntry.endDate === 'Current' ? 'Current' : ''}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                        <TextField
                                            placeholder="Product Cost"
                                            value={newEntry.product_cost}
                                            onChange={(e) => handleNewEntryInputChange(e, 'product_cost')}
                                            type="number"
                                            size="small"
                                            variant="standard"
                                            inputProps={{ step: "0.01" }}
                                            sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", width: '80px' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: '#485E75', borderBottom: 'none' }}>
                                        <TextField
                                            placeholder="Shipping Cost"
                                            value={newEntry.shipping_cost}
                                            onChange={(e) => handleNewEntryInputChange(e, 'shipping_cost')}
                                            type="number"
                                            size="small"
                                            variant="standard"
                                            inputProps={{ step: "0.01" }}
                                            sx={{ fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", width: '80px' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{
                                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                        color: '#485E75', borderBottom: 'none'
                                    }}>
                                        ${parseFloat(newEntry.total_cogs || 0).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={handleAddEntryConfirm} size="small" sx={{ minWidth: 'auto', p: '5px 10px', fontSize: '0.75rem' }}>Add</Button>
                                        <Button onClick={handleAddEntryCancel} size="small" color="error" sx={{ minWidth: 'auto', p: '5px 10px', fontSize: '0.75rem', ml: 1 }}>Cancel</Button>
                                    </TableCell>
                                </TableRow>
                            )}

                        </TableBody>
                    </Table>
                </TableContainer>

                {/* {!editMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: '24px', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => setEditMode(true)}
                            startIcon={<EditIcon />}
                            sx={{
                                backgroundColor: '#6200EE',
                                '&:hover': {
                                    backgroundColor: '#3700B3',
                                },
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                textTransform: 'none',
                                boxShadow: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                            }}
                        >
                            Edit COGS
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleAddNewRow}
                            startIcon={<AddIcon />}
                            sx={{
                                color: '#6200EE',
                                borderColor: '#6200EE',
                                '&:hover': {
                                    borderColor: '#3700B3',
                                    color: '#3700B3',
                                },
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                textTransform: 'none',
                                boxShadow: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                            }}
                        >
                            Add New Entry
                        </Button>
                    </Box>
                )}
                {editMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancelClick}
                            sx={{
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                textTransform: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                borderColor: '#E0E0E0',
                                color: '#485E75',
                                '&:hover': {
                                    borderColor: '#B0B0B0',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveClick}
                            sx={{
                                backgroundColor: '#6200EE',
                                '&:hover': {
                                    backgroundColor: '#3700B3',
                                },
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                textTransform: 'none',
                                boxShadow: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                )} */}

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    message={snackbarMessage}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                />
            </Paper>
        </Grid>
    );
};

export default CostOfGoodsSold;