import React from 'react';
import { Grid, Paper, Typography, Button, Box } from '@mui/material';

const DatePresents = ({ onPresetSelect }) => {

    const [compare, setCompare] = React.useState('Compare to past');
    const [events, setEvents] = React.useState(true);
    const [startDateHelium, setStartDateHelium] = useState(dayjs('2025-04-10'));
    const [endDateHelium, setEndDateHelium] = useState(dayjs('2025-04-16'));
  
    localStorage.removeItem('selectedCategory');
  
    let userIds = "";
  
    if (userData) {
      const data = JSON.parse(userData);
      userIds = data.id;
    }
  
    const presets = [
      'Today', 'Yesterday', 'This Week', 'Last Week',
      'Last 7 days', 'Last 14 days', 'Last 30 days',
      'Last 60 days', 'Last 90 days', 'This Month',
      'Last Month', 'This Quarter', 'Last Quarter',
      'This Year', 'Last Year'
    ];
  
    
      const handleStartDateChangeHelium = (newDate) => {
        setStartDateHelium(newDate);
      };
    
      const handleEndDateChangeHelium = (newDate) => {
        setEndDateHelium(newDate);
      };
    
      const [value, setValue] = useState([dayjs().subtract(6, 'day'), dayjs()]);
      const [selectedPreset, setSelectedPreset] = useState('Last 7 days');
    
      const handleChange = (newValue) => {
        setValue(newValue);
      };
    
      const handlePresetSelect = (preset) => {
        setSelectedPreset(preset);
    
        const today = dayjs();
        let newStartDate, newEndDate;
    
        switch (preset) {
          case 'Today':
            newStartDate = today;
            newEndDate = today;
            break;
          case 'Yesterday':
            newStartDate = today.subtract(1, 'day');
            newEndDate = today.subtract(1, 'day');
            break;
          case 'This Week':
            newStartDate = today.startOf('week');
            newEndDate = today;
            break;
          case 'Last Week':
            newEndDate = today.startOf('week').subtract(1, 'day');
            newStartDate = newEndDate.startOf('week');
            break;
          case 'Last 7 days':
            newEndDate = today;
            newStartDate = today.subtract(6, 'day');
            break;
          case 'Last 14 days':
            newEndDate = today;
            newStartDate = today.subtract(13, 'day');
            break;
          case 'Last 30 days':
            newEndDate = today;
            newStartDate = today.subtract(29, 'day');
            break;
          case 'Last 60 days':
            newEndDate = today;
            newStartDate = today.subtract(59, 'day');
            break;
          case 'Last 90 days':
            newEndDate = today;
            newStartDate = today.subtract(89, 'day');
            break;
          case 'This Month':
            newStartDate = today.startOf('month');
            newEndDate = today;
            break;
          case 'Last Month':
            newEndDate = today.startOf('month').subtract(1, 'day');
            newStartDate = newEndDate.startOf('month');
            break;
          case 'This Quarter':
            newStartDate = today.startOf('quarter');
            newEndDate = today;
            break;
          case 'Last Quarter':
            newEndDate = today.startOf('quarter').subtract(1, 'day');
            newStartDate = newEndDate.startOf('quarter');
            break;
          case 'This Year':
            newStartDate = today.startOf('year');
            newEndDate = today;
            break;
          case 'Last Year':
            newEndDate = today.startOf('year').subtract(1, 'day');
            newStartDate = newEndDate.startOf('year');
            break;
          default:
            break;
        }
    
        if (newStartDate && newEndDate) {
          setValue([newStartDate, newEndDate]);
        }
      };
    
  return (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
        <FormControl size="small">
          <InputLabel>Preset</InputLabel>
          <Select
            value={selectedPreset}
            label="Preset"
            onChange={(e) => handlePresetSelect(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {presets.map((preset) => (
              <MenuItem key={preset} value={preset}>
                {preset}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="From"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>
    </LocalizationProvider>

  );
};
