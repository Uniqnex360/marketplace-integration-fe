import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import DateRangeSales from '../../DateRange/DateRangeSalesOverview';

import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GraphDateRange from './grpahDateRange';

const sampleData = [
  { date: '2025-05-02', price: 9.74 },
  { date: '2025-05-10', price: 9.74 },
  { date: '2025-05-14', price: 9.76 },
  { date: '2025-05-16', price: 9.77 },
  { date: '2025-05-17', price: 10.87 },
  { date: '2025-05-22', price: 10.87 }
];

const GrpahForOverview = ({ onClose }) => {
  const { id } = useParams();
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: dayjs('2025-05-02'),
    endDate: dayjs('2025-05-22'),
    text: 'May 02, 2025 - May 22, 2025',
  });
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [chartData, setChartData] = useState(sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchpriceGraph = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';

      if (!id) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_IP}priceGraph/`, {
        params: {
          preset: '',
          product_id: id,
          user_id: userId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          start_date: selectedDateRange.startDate?.format('YYYY-MM-DD'),
          end_date: selectedDateRange.endDate?.format('YYYY-MM-DD'),
        },
      });

      if (response.data.data && response.data.data.length > 0) {
        const transformedData = response.data.data.map(item => ({
          date: item.date,
          price: item.price
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Error fetching COGS data:", err);
      setError(err.message || 'Failed to fetch COGS data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchpriceGraph();
    }
  }, [id, selectedDateRange]);

  const handleDateRangeChange = (newRange) => {
    setSelectedPreset(newRange.preset || null);
    setSelectedDateRange({
      startDate: newRange.startDate ? dayjs(newRange.startDate) : null,
      endDate: newRange.endDate ? dayjs(newRange.endDate) : null,
      text: newRange.text,
    });
  };

  const formatDateForXAxis = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd');
  };

  const formatDateForXAxisTooltip = (dateString, formatStr = 'MM/dd') => {
    
  const date = new Date(dateString);
  return format(date, formatStr, { locale: enIN });
};

 const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p>{formatDateForXAxisTooltip(label, 'MMMM dd, yyyy')}</p>

      <p>
  Price: <strong>${payload[0].value.toFixed(2)}</strong>
</p>

      </div>
    );
  }
  return null;
};

  return (
    <Card
      sx={{
        border:'solid 1px #ddd',
        width: '90%',
        maxWidth: 800,
        mx: 'auto',
        mt: 5,
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
        fontSize: '12px'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* <Typography variant="h6" sx={{ fontFamily: 'inherit', fontSize: '24px' }}>
          Price: B000052YJU (amazon.com)
        </Typography> */}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>



      {/* <GraphDateRange
        reflectDate={selectedDateRange.text}
        onDateChange={handleDateRangeChange}
        initialDateRange={selectedDateRange}
      /> */}

      <Box sx={{ height: 300, mt: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#ccc" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDateForXAxis} />
            <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={(value) => value.toFixed(2)} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="price" stroke="#1976d2" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={onClose} sx={{ fontFamily: 'inherit' }}>
          Close
        </Button>
      </Box>
    </Card>
  );
};

export default GrpahForOverview;
