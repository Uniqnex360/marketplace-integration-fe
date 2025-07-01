import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Card,
    Button,
    IconButton,
    Chip,
    MenuItem,
    Select,
    FormControl,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

function InsightOverview({ Ids }) {
    const [filterBy, setFilterBy] = useState('All Categories');
    const [sortBy, setSortBy] = useState('Most Recent');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [insights, setInsights] = useState([]);

    const commonTextStyle = {
        fontFamily:
            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
        color: '#485E75',
        fontSize: '14px',
    };

    const fetchSalesOverview = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData?.id || '';
            const response = await axios.get(`${process.env.REACT_APP_IP}InsightsProductWise/`, {
                params: {
                    product_id: Ids,
                    user_id: userId,
                },
            });

            console.log('Fetched Insights:', response.data?.alerts_feed);
            setInsights(response.data?.alerts_feed || []);
        } catch (err) {
            console.error('Fetch failed:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Ids) {
            fetchSalesOverview();
        }
    }, [Ids]);

    return (
        <Box p={2}>
            {/* Header */}
            <Box display="flex" justifyContent="flex-start" alignItems="center" gap={2} mb={2}>
                <Typography sx={{ ...commonTextStyle, fontWeight: '600', color: '#121212', fontSize: '16px' }}>
                    This product has {insights.length} Insight{insights.length !== 1 ? 's' : ''}
                </Typography>

                <FormControl
                    size="small"
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', borderRadius: 1 }}
                >
                    <Select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        displayEmpty
                        renderValue={(selected) => (
                            <span style={{ fontSize: '16px' }}>
                                <strong>Filter by:</strong> {selected || 'All Categories'}
                            </span>
                        )}
                        sx={commonTextStyle}
                    >
                        <MenuItem value="All Categories" sx={{ fontSize: '16px' }}>All Categories</MenuItem>
                        <MenuItem value="Inventory" sx={{ fontSize: '16px' }}>Inventory</MenuItem>
                        <MenuItem value="Keyword" sx={{ fontSize: '16px' }}>Keyword</MenuItem>
                        <MenuItem value="Listing Optimization" sx={{ fontSize: '16px' }}>Listing Optimization</MenuItem>
                        <MenuItem value="Product Performance" sx={{ fontSize: '16px' }}>Product Performance</MenuItem>
                        <MenuItem value="Refunds" sx={{ fontSize: '16px' }}>Refunds</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    size="small"
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', borderRadius: 1 }}
                >
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        displayEmpty
                        renderValue={(selected) => (
                            <span style={{ fontSize: '16px' }}>
                                <strong>Sort by:</strong> {selected || 'Most Recent'}
                            </span>
                        )}
                        sx={commonTextStyle}
                    >
                        <MenuItem value="Most Recent" sx={{ fontSize: '16px' }}>Most Recent</MenuItem>
                        <MenuItem value="Impact" sx={{ fontSize: '16px' }}>Impact</MenuItem>
                        <MenuItem value="Available" sx={{ fontSize: '16px' }}>Available</MenuItem>
                        <MenuItem value="Complete" sx={{ fontSize: '16px' }}>Complete</MenuItem>
                    </Select>
                </FormControl>


            </Box>


            {/* List of Insight Cards */}

            <Grid container spacing={2}>
                {insights.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <Card
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 'none',
                                borderColor: '#e0e0e0',
                            }}
                        >
                            {/* Left section */}
                            <Box display="flex" alignItems="flex-start" flexGrow={1}>

                                <Box>
                                    <Typography
                                        fontWeight="600"
                                        fontSize={14}
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontWeight: '600',
                                            textOverflow: 'ellipsis',
                                            fontFamily:
                                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

                                        }}
                                    >
                                        {item.title}{' '}
                                        <Box component="span" sx={{
                                            fontFamily:
                                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                            fontWeight: 400, fontSize: 14, color: '#485E75'
                                        }}>
                                            {item.message}
                                        </Box>
                                    </Typography>



                                    {/* Inventory & Button row */}
                                    <Box display="flex" alignItems="center" mt={1}>

                                        <Box
                                            sx={{
                                                backgroundColor: '#FEE2E2',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 1.5,
                                                mt: 0.5,
                                            }}
                                        >
                                            <NotificationsActiveOutlinedIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                                        </Box>

                                        <Chip
                                            label={item.type}
                                            icon={
                                                <OpenInNewOutlinedIcon
                                                    sx={{
                                                        fontFamily:
                                                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                        fontSize: 16,
                                                        color: item.type === 'Inventory' ? '#B45309' :
                                                            item.type === 'Automation' ? '#1360FB' :
                                                                item.type === 'Product Performance' ? '#A428E7' :
                                                                    item.type === 'Keyword' ? '#8053CE' :
                                                                        item.type === 'Listing Optimization' ? '#0C7E7D' :
                                                                            item.type === 'Refunds' ? '#447A1D' : '#000', // Default color
                                                    }}
                                                />
                                            }
                                            sx={{
                                                fontFamily:
                                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                backgroundColor: item.type === 'Inventory' ? '#FFF1E0' :
                                                    item.type === 'Automation' ? 'light blue' :
                                                        item.type === 'Product Performance' ? '#F4EBFE' :
                                                            item.type === 'Keyword' ? '#F1EDFB' :
                                                                item.type === 'Listing Optimization' ? '#E4F5F5' :
                                                                    item.type === 'Refunds' ? '#E5F8DE' : '#eee', // Default background
                                                color: item.type === 'Inventory' ? '#B45309' :
                                                    item.type === 'Automation' ? '#1360FB' :
                                                        item.type === 'Product Performance' ? '#A428E7' :
                                                            item.type === 'Keyword' ? '#8053CE' :
                                                                item.type === 'Listing Optimization' ? '#0C7E7D' :
                                                                    item.type === 'Refunds' ? '#447A1D' : '#333', // Default text color
                                                fontWeight: 600,
                                                fontSize: 12,
                                                height: 26,
                                                borderRadius: '16px',
                                                mr: 1,
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontFamily:
                                                    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                                                fontSize: 14,
                                                fontWeight: 500,
                                                textTransform: 'none',
                                                borderColor: '#2563EB',
                                                color: '#2563EB',
                                                px: 2,
                                                height: 28,
                                                mr: 0.5,
                                            }}
                                        >
                                            Open
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Right: Close button */}
                            <IconButton size="small">
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Card>
                    </Grid>
                ))}
            </Grid>


        </Box>
    );
}

export default InsightOverview;