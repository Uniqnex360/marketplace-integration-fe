import React, { useEffect, useState } from 'react';
import {
    Box,
    Checkbox,
    FormControlLabel,
    Typography,
    IconButton,
    Button,
    Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const metricMap = {
    gross_revenue: 'Gross Revenue',
    profit_margin: 'Profit Margin',
    net_profit: 'Net Profit',
    orders: 'Orders',
    units_sold: 'Units Sold',
    refund_amount: 'Refund Amount',
    refund_quantity: 'Refunds Quantity',
    ppc_spend: 'PPC Spend',
    acos: 'ACoS',
    tacos: 'TACoS',
    roas: 'ROAS',
};

const metricOrder = [
    'gross_revenue',
    'profit_margin',
    'net_profit',
    'orders',
    'units_sold',
    'refund_amount',
    'refund_quantity',
    'ppc_spend',
    'acos',
    'tacos',
    'roas',
];

const RevenueChooseMetrics = ({
    selectedMetrics,
    onChange,
    onReset,
    onClose,
    onApply,
    userId,
    setMetrics,
    setPrevious,
    setDifference,
    setBindGraph,
    widgetData
}) => {
    const [metricsState, setMetricsState] = useState({});
    const [initialMetricsState, setInitialMetricsState] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    const fetchMetrics = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_IP}obtainChooseMatrix/`,
                {
                    params: {
                        name: 'Revenue',
                        user_id: userId,
                    },
                }
            );

            const data = response.data;
            const filtered = metricOrder.reduce((acc, key) => {
                if (metricMap[key] !== undefined) {
                    acc[key] = !!data[key];
                }
                return acc;
            }, {});
            setMetricsState(filtered);
            setInitialMetricsState(filtered);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [userId]);

    useEffect(() => {
        const changesDetected = metricOrder.some(key => metricsState[key] !== initialMetricsState[key]);
        setHasChanges(changesDetected);
    }, [metricsState, initialMetricsState, metricOrder]);

    const handleToggleMetric = (key) => {
        setMetricsState((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleToggleAll = () => {
        const allSelected = metricOrder.every((key) => metricsState[key]);
        const newState = {};
        metricOrder.forEach((key) => {
            newState[key] = !allSelected;
        });
        setMetricsState(newState);
    };

    const handleApply = async () => {
        if (!hasChanges) {
            return;
        }

        const selectedCount = metricOrder.filter((key) => metricsState[key]).length;

        const payload = {
            name: 'Revenue',
            user_id: userId,
        };

        if (selectedCount === metricOrder.length) {
            payload.select_all = true;
        } else {
            metricOrder.forEach((key) => {
                payload[key] = !!metricsState[key];
            });
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_IP}updateChooseMatrix/`,
                payload
            );

            const data = response.data.data;
            onClose();
            setMetrics(data.targeted || {});
            setPrevious(data.previous || {});
            setDifference(data.difference || {});

            const transformedGraphData = Object.entries(data.graph_data || {}).map(
                ([rawDate, values]) => {
                    const capitalizedDate =
                        rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
                    const parsedDate = new Date(capitalizedDate);
                    const formattedDate = parsedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    });

                    return {
                        date: formattedDate,
                        revenue: values.gross_revenue,
                        fullDate: parsedDate,
                    };
                }
            );

            setBindGraph(transformedGraphData);
            setInitialMetricsState(metricsState);
            setHasChanges(false);

            if (onApply) onApply();
        } catch (error) {
            console.error('Error applying metrics or fetching revenue data:', error);
        }
    };

    const allSelected = metricOrder.every((key) => metricsState[key]);
    const noneSelected = metricOrder.every((key) => !metricsState[key]);
    const someSelected = !allSelected && !noneSelected;

    // Define the desired order of metrics as seen in the image
    const displayOrder = [
        'gross_revenue',
        'units_sold',
        'acos',
        'profit_margin',
        'refund_amount',
        'tacos',
        'net_profit',
        'refund_quantity',
        'roas',
        'orders',
        'ppc_spend',
        // Add any other metrics if they appear in the image but not in metricOrder
    ];

    return (
        <Box p={3} width="100%" maxWidth="600px" sx={{ fontFamily: "'Nunito Sans', sans-serif" }} >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography fontWeight="bold" sx={{
                        fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }} fontSize={24} mb={0.5}>
                        Choose Metrics - Revenue
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '16px', fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}>
                        Choose which metrics you want to show in the Revenue tab of the Metrics chart on your Dashboard.
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

      <Box mt={0.5}> {/* reduced from 2 to 0.5 */}
    <FormControlLabel
        control={
            <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleAll}
                size="small"
                sx={{ color: '#000080 !important' }}
            />
        }
        label={<Typography sx={{  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",color: '#485E75',fontSize:'16px', }}>Select All</Typography>}
    />
</Box>

<Grid container mt={0.5} spacing={2}> {/* reduced from 1 to 0.5 */}
    {displayOrder.map((key) => (
        metricMap[key] && (
            <Grid item xs={12} sm={6} md={4} key={key}>
                <FormControlLabel
                    control={
                        <Checkbox
                          
                            checked={metricsState[key] || false}
                            onChange={() => handleToggleMetric(key)}
                            size="small"
                            sx={{ fontSize:'16px', color: '#000080 !important',     fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                     }}
                        />
                    }
                    label={
                        <Typography
                            sx={{
                                fontSize: '16px',
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                            }}
                        >
                            {metricMap[key]}
                        </Typography>
                    }
                />
            </Grid>
        )
    ))}
</Grid>

            <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                    onClick={onClose}
                    variant="text"
                    sx={{
                        fontFamily:
                            "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#121212',
                        textTransform: 'capitalize',
                    }}
                >
                    Cancel
                </Button>

                <Box display="flex" gap={2}>
                    <Button
                        onClick={onReset}
                        variant="outlined"
                        disabled={!hasChanges}
                        sx={{
                            fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                            fontWeight: 700,
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            color: hasChanges ? 'rgb(10, 111, 232)' : 'rgba(0, 0, 0, 0.26)',
                            borderColor: hasChanges ? 'rgb(10, 111, 232)' : 'rgba(0, 0, 0, 0.12)',
                            '&:hover': {
                                borderColor: hasChanges ? 'rgb(2, 83, 182)' : 'rgba(0, 0, 0, 0.12)',
                                color: hasChanges ? 'rgb(2, 83, 182)' : 'rgba(0, 0, 0, 0.26)',
                            },
                        }}
                    >
                        Reset To Default
                    </Button>

                    <Button
                        onClick={handleApply}
                        variant="contained"
                        disabled={!hasChanges}
                        sx={{
                            fontFamily:
                                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                            fontSize: '14px',
                            textTransform: 'capitalize',
                            color: 'white',
                            backgroundColor: hasChanges ? 'rgb(10, 111, 232)' : 'rgba(0, 0, 0, 0.12)',
                            '&:hover': {
                                backgroundColor: hasChanges ? 'rgb(2, 83, 182)' : 'rgba(0, 0, 0, 0.12)',
                                color: 'white',
                            },
                        }}
                    >
                        Apply Changes
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default RevenueChooseMetrics;