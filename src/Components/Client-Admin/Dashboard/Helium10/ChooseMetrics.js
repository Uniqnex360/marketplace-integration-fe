import React, { useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import axios from 'axios';
import moment from 'moment';

const metricMap = {
  gross_revenue: 'Gross Revenue',
  total_cogs: 'COGS',
  orders: 'Orders',
  profit_margin: 'Margin',
  units_sold: 'Units Sold',
  // business_value: 'Business Value',
 
  refund_quantity: 'Refunds (Units)',
 
 
  // acos: 'ACoS',
  // tacos: 'TACoS',
  // net_profit: 'Net Profit',
  // refund_amount: 'Refund Amount',
  // roas: 'ROAS',
  // ppc_spend: 'PPC Spend',
};

const ChooseMetrics = ({
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
}) => {
  const [metricsState, setMetricsState] = useState({});
  const [initialMetricsState, setInitialMetricsState] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainChooseMatrix/`,
        {
          params: {
            name: 'Today Snapshot',
            user_id: userId,
          },
        }
      );

      const data = response.data;

      const filtered = Object.keys(data).reduce((acc, key) => {
        if (metricMap[key] !== undefined) {
          acc[key] = !!data[key]; // Ensure boolean value
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
    const selectedCount = Object.values(metricsState).filter((value) => value).length;
    const allCount = Object.keys(metricMap).length;

    if (selectedCount === allCount) {
      setSelectAll(true);
      setIsIndeterminate(false);
    } else if (selectedCount > 0) {
      setSelectAll(false);
      setIsIndeterminate(true);
    } else {
      setSelectAll(false);
      setIsIndeterminate(false);
    }

    // Check if there are any changes
    const changesDetected = Object.keys(metricsState).some(
      (key) => metricsState[key] !== initialMetricsState[key]
    );
    setHasChanges(changesDetected);

  }, [metricsState, initialMetricsState]);

  const handleToggleAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    setIsIndeterminate(false);
    const newState = Object.keys(metricMap).reduce((acc, key) => {
      acc[key] = checked;
      return acc;
    }, {});
    setMetricsState(newState);
  };

  const handleToggleMetric = (key) => {
    setMetricsState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApply = async () => {
    if (!hasChanges) {
      return; // Do nothing if no changes
    }

    const keys = Object.keys(metricMap);
    const selectedCount = keys.filter((key) => metricsState[key]).length;

    // Prepare payload
    const payload = {
      name: 'Today Snapshot',
      user_id: userId,
    };

    if (selectAll && !isIndeterminate) {
      payload.select_all = true;
    } else {
      keys.forEach((key) => {
        payload[key] = !!metricsState[key];
      });
    }

    try {
      // First API call: updateChooseMatrix
      const updateResponse = await axios.post(
        `${process.env.REACT_APP_IP}updateChooseMatrix/`,
        payload
      );

      // Check if updateResponse.data.status is "success"
      if (updateResponse && updateResponse.data && updateResponse.data.status === "success") {
        onClose();
        // You might want to trigger fetchMetricsChoose here to get the updated data
        fetchMetricsChoose();
        setInitialMetricsState(metricsState); // Update initial state after applying
        setHasChanges(false);
      } else {
        console.error('Error applying metrics:', updateResponse && updateResponse.data);
        // ❗ Optional: show an error toast or alert here
      }
    } catch (error) {
      console.error('Error applying metrics:', error);
      // ❗ Optional: show an error toast or alert here
    }
  };

  const fetchMetricsChoose = async (date) => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';
      const response = await axios.get(
        `${process.env.REACT_APP_IP}get_metrics_by_date_range/`,
        {
          params: {
            target_date: (date || moment()).format('DD/MM/YYYY'),
            user_id: userId,
            
          },
        }
      );

      if (response && response.data && response.data.data) {
        const data = response.data.data;
        setMetrics(data.targeted || {});
        setPrevious(data.previous || {});
        setDifference(data.difference || {});

        const transformedGraphData = Object.entries(data.graph_data || {}).map(
          ([rawDate, values]) => {
            const capitalizedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
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
      } else {
        console.error('Error fetching metrics:', response && response.data);
        // Optionally display an error to the user
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Optionally display an error to the user
    } finally {
      setLoading(false);
    }
  };

  const allMetricsSelected = Object.values(metricsState).every((val) => val);
  const selectAllIcon = isIndeterminate ? <IndeterminateCheckBoxIcon /> : selectAll ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />;

  return (
    <Box p={3} width="100%" maxWidth="500px" sx={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography fontWeight="bold" fontSize={24} sx={{   fontFamily:
          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    }} mb={0.5}>
            Choose Metrics - Today Snapshot
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ color:'#485E75',fontSize: '16px',  fontFamily:
          "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
     }}>
            Choose which metrics you want to show in your Today chart on your Dashboard.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box mt={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectAll}
              indeterminate={isIndeterminate}
              onChange={handleToggleAll}
              size="small"
              icon={<CheckBoxOutlineBlankIcon />}
              checkedIcon={<CheckBoxIcon />}
              indeterminateIcon={<IndeterminateCheckBoxIcon />}
              sx={{ color: '#000080 !important' }}
            />
          }
          label={<Typography sx={{ fontSize: '16px', color: '#485E75',fontSize:'16px',      fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    }}>Select All</Typography>}
        />
      </Box>

      <Box mt={1} display="flex" flexWrap="wrap">
        {Object.keys(metricMap).map((key) => (
          <Box key={key} width="50%">
            <FormControlLabel
              control={
                <Checkbox
                  checked={metricsState[key] || false}
                  onChange={() => handleToggleMetric(key)}
                  size="small"
                 sx={{color: '#000080 !important'}}
                />
              }
              label={<Typography sx={{ fontSize: '16px' , color: '#485E75',  fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
          }}>{metricMap[key]}</Typography>}
            />
          </Box>
        ))}
      </Box>

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

export default ChooseMetrics;