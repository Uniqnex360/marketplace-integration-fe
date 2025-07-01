import React, { useState, useEffect } from 'react';
import {
    Button,
    Popover,
    Box,
    Typography,
    Paper,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enIN } from 'date-fns/locale';
import {
    format,
    subDays,
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { toast } from 'react-toastify';
const DateRangeSelector = ({ onDateChange }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [tempStartDate, setTempStartDate] = useState(() => {
        const yesterday = subDays(new Date(), 1);
        return subDays(yesterday, 29); // Initial start date for Last 30 days
    });
    const [tempEndDate, setTempEndDate] = useState(subDays(new Date(), 1)); // Initial end date for Last 30 days
    const [open, setOpen] = useState(false);
    const [selectedRangeText, setSelectedRangeText] = useState(() => {
        const yesterday = subDays(new Date(), 1);
        const start = subDays(yesterday, 29);
        return `${format(start, 'dd/MM/yyyy')} - ${format(yesterday, 'dd/MM/yyyy')}`;
    });
    const [currentPreset, setCurrentPreset] = useState('Last 30 days');

    const id = open ? 'date-range-popover' : undefined;

    useEffect(() => {
        // Initial call with the default "Last 30 days"
        const yesterday = subDays(new Date(), 1);
        const start = subDays(yesterday, 29);
        handleApplyPreset('Last 30 days', start, yesterday);
    }, []);

    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setOpen(false);
        // Reset temp values on close if not applied
        if (!onDateChange.startDate || currentPreset === 'Last 30 days') {
            const yesterday = subDays(new Date(), 1);
            setTempStartDate(subDays(yesterday, 29));
            setTempEndDate(yesterday);
        } else {
            setTempStartDate(new Date(onDateChange.startDate));
            setTempEndDate(new Date(onDateChange.endDate));
        }
    };

    const handleStartDateChange = (newDate) => {
        setTempStartDate(newDate);
        setCurrentPreset(null); // Clear preset on manual date change
    };

    const handleEndDateChange = (newDate) => {
        setTempEndDate(newDate);
        setCurrentPreset(null); // Clear preset on manual date change
    };

    const handleApply = () => {
        const formattedStartDate = format(tempStartDate, 'yyyy-MM-dd');
        const formattedEndDate = format(tempEndDate, 'yyyy-MM-dd');
        const rangeText = `${format(tempStartDate, 'dd/MM/yyyy')} - ${format(tempEndDate, 'dd/MM/yyyy')}`;

        const payload = {};
        if (currentPreset) {
            payload.preset = currentPreset;
        } else {
            payload.startDate = formattedStartDate;
            payload.endDate = formattedEndDate;
        }
        payload.text = rangeText;

        onDateChange(payload);
        setSelectedRangeText(rangeText);
        handleClosePopover();
          toast.success("Filter applied successfully!", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                
    };

    const handleApplyPreset = (preset, start, end) => {
        setTempStartDate(start);
        setTempEndDate(end);
        setSelectedRangeText(`${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`);
        setCurrentPreset(preset);

        const formattedStartDate = format(start, 'yyyy-MM-dd');
        const formattedEndDate = format(end, 'yyyy-MM-dd');

        onDateChange({
            preset: preset,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            text: `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`
        });
    };

    const handleLast7Days = () => {
        const yesterday = subDays(new Date(), 1);
        const start = subDays(yesterday, 6);
        handleApplyPreset('Last 7 days', start, yesterday);
    };

    const handleLast30Days = () => {
        const yesterday = subDays(new Date(), 1);
        const start = subDays(yesterday, 29);
        handleApplyPreset('Last 30 days', start, yesterday);
    };

    const handleLast60Days = () => {
        const yesterday = subDays(new Date(), 1);
        const start = subDays(yesterday, 59);
        handleApplyPreset('Last 60 days', start, yesterday);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={enIN}>
            <div>
                <Button
                    aria-describedby={id}
                    variant="outlined"
                    onClick={handleOpenPopover}
                    sx={{
                        color: 'black',
                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        fontSize: '14px',
                        textTransform: 'none',
                    }}
                >
                    <CalendarTodayIcon sx={{ mr: 1, height: 20, width: 20 }} />
                    {selectedRangeText || 'Select Date Range'}
                </Button>

                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClosePopover}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Box sx={{ display: 'flex' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', p: 2 }}>
                            <DatePicker
                                label="Start Date"
                                value={tempStartDate}
                                views={["year", "month", "day"]}
                                onChange={handleStartDateChange}
                                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                                openTo="day"
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <Box sx={{ width: 16 }} />
                            <DatePicker
                                label="End Date"
                                value={tempEndDate}
                                views={["year", "month", "day"]}
                                onChange={handleEndDateChange}
                                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                                openTo="day"
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>

                        <Paper elevation={0} sx={{ p: 2, borderLeft: 'solid 1px #ddd', width: '200px' }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize', mb: 1, textAlign: 'center', color: '#121212' }}>
                                Preset
                            </Typography>
                            <Button
                                onClick={handleLast7Days}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last 7 days' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last 7 days' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last 7 days' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last 7 days
                            </Button>
                            <Button
                                onClick={handleLast30Days}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last 30 days' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last 30 days' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last 30 days' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last 30 days
                            </Button>
                            <Button
                                onClick={handleLast60Days}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last 60 days' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last 60 days' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last 60 days' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last 60 days
                            </Button>
                        </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
                        <Button onClick={handleClosePopover} sx={{ mr: 1, textTransform: 'capitalize' }}>Cancel</Button>
                        <Button variant="contained" onClick={handleApply} sx={{ textTransform: 'capitalize' }}>Apply</Button>
                    </Box>
                </Popover>
            </div>
        </LocalizationProvider>
    );
};

export default DateRangeSelector;