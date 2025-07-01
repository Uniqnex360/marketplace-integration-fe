import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  Button,
} from '@mui/material';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

function RevenueCompare({ compare, onDateChange }) {
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [customEndDate, setCustomEndDate] = useState(null);

  const [dateRange, setDateRange] = useState({
    current: { start: dayjs(), end: dayjs() }, // Example current date range
    previous: { start: dayjs().subtract(1, 'month'), end: dayjs().subtract(1, 'month') }, // Example previous date range
  });

  const [compareStartDate, setCompareStartDate] = useState(null);
  const [compareEndDate, setCompareEndDate] = useState(null);
  
  useEffect(() => {
    console.log('compare');
  }, []);
  
  const onCustomDateSelect = (customDates) => {
    onDateChange(customDates.start, customDates.end);
  };

  const handleCompareChange =()=>{

  }

  const handleCustomDateApply = () => {
    if (customEndDate && dateRange.current.start) {
      setIsCustomDatePickerOpen(false);
      onCustomDateSelect({ start: dateRange.current.start, end: customEndDate });
      // setCompare(''); // Reset the compare dropdown
      setCustomEndDate(null);
    } else {
      console.warn("Custom end date or current start date is not available.");
    }
  };

  const handleCustomDateCancel = () => {
    setIsCustomDatePickerOpen(false);
    // setCompare(''); // Reset the compare dropdown
    setCustomEndDate(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.format('MMM D, YYYY');
  };

  return (
    <div>
    <FormControl size="small" sx={{ minWidth: 220, paddingLeft: '8px' }}>
  <Select
    value={compare}
    onChange={handleCompareChange}
    displayEmpty
    sx={{
      fontSize: '14px',
      height: 36,
      '.MuiSelect-select': {
        display: 'flex',
        alignItems: 'center',
        py: 0.5,
      },
      '&.Mui-focused .MuiSelect-select': {
        backgroundColor: '#e3f2fd', // Light blue background on focus/selection
      },
    }}
    renderValue={(selected) => {
      if (selected === 'Previous period' && dateRange.previous.start) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '14px' }}>Comparing to previous period</div>
            <div style={{ fontSize: '12px', color: 'grey' }}>
              {formatDate(dateRange.previous.start)} - {formatDate(dateRange.previous.end)}
            </div>
          </div>
        );
      }
      if (selected === 'Previous week' && dateRange.current.start) {
        const start = dayjs(dateRange.current.start).subtract(1, 'week').startOf('week');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '14px' }}>Comparing to previous week</div>
            <div style={{ fontSize: '12px', color: 'grey' }}>
              {formatDate(start)}  {/* Show start date of previous week */}
            </div>
          </div>
        );
      }
      if (selected === 'Previous month' && dateRange.current.start) {
        const start = dayjs(dateRange.current.start).subtract(1, 'month').startOf('month');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '14px' }}>Comparing to previous month</div>
            <div style={{ fontSize: '12px', color: 'grey' }}>
              {formatDate(start)}  {/* Show start date of previous month */}
            </div>
          </div>
        );
      }
      if (selected === 'Previous year' && dateRange.current.start) {
        const start = dayjs(dateRange.current.start).subtract(1, 'year').startOf('year');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '14px' }}>Comparing to previous year</div>
            <div style={{ fontSize: '12px', color: 'grey' }}>
              {formatDate(start)}  {/* Show start date of previous year */}
            </div>
          </div>
        );
      }
      if (selected === 'Today') {
        return (
          <div style={{ fontSize: '14px' }}>
            Today - {formatDate(dayjs())} {/* Show today's date */}
          </div>
        );
      }
      if (selected === 'Yesterday') {
        return (
          <div style={{ fontSize: '14px' }}>
            Yesterday - {formatDate(dayjs().subtract(1, 'day'))} {/* Show yesterday's date */}
          </div>
        );
      }
      return 'Compare to past';
    }}
  >
    <MenuItem value="Compare to past" sx={{ fontSize: '14px', py: 1 }}>
      Compare to past
    </MenuItem>

    <MenuItem value="Previous period" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
      <div style={{ fontSize: '14px' }}>Previous period</div>
      {dateRange.current.start && dateRange.previous.start && (
        <div style={{ fontSize: '12px', color: 'grey' }}>
          {formatDate(dateRange.previous.start)} - {formatDate(dateRange.previous.end)}
        </div>
      )}
    </MenuItem>

    <MenuItem value="Previous week" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
      <div style={{ fontSize: '14px' }}>Previous week</div>
      {dateRange.current.start && (
        <div style={{ fontSize: '12px', color: 'grey' }}>
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'week').startOf('week'))} -{' '}
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'week').endOf('week'))}
        </div>
      )}
    </MenuItem>

    <MenuItem value="Previous month" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
      <div style={{ fontSize: '14px' }}>Previous month</div>
      {dateRange.current.start && (
        <div style={{ fontSize: '12px', color: 'grey' }}>
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'month').startOf('month'))} -{' '}
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'month').endOf('month'))}
        </div>
      )}
    </MenuItem>

    <MenuItem value="Previous year" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
      <div style={{ fontSize: '14px' }}>Previous year</div>
      {dateRange.current.start && (
        <div style={{ fontSize: '12px', color: 'grey' }}>
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'year').startOf('year'))} -{' '}
          {formatDate(dayjs(dateRange.current.start).subtract(1, 'year').endOf('year'))}
        </div>
      )}
    </MenuItem>

    <MenuItem value="Select custom date range" sx={{ fontSize: '14px', py: 1 }}>
      Select custom date range
    </MenuItem>
  </Select>
</FormControl>



      <Dialog open={isCustomDatePickerOpen} onClose={handleCustomDateCancel}>
        <DialogTitle>Select an end date</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: 16 }}>
            Select end date for custom date range comparison
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select End Date"
              value={customEndDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </LocalizationProvider>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCustomDateCancel}>Cancel</Button>
            <Button onClick={handleCustomDateApply} variant="contained" color="primary" disabled={!customEndDate}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RevenueCompare;