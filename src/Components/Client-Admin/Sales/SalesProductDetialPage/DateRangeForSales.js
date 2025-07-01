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
    startOfWeek,
    endOfWeek,
    subWeeks,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfQuarter,
    endOfQuarter,
    subQuarters,
    startOfYear,
    endOfYear,
    subYears,
} from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { toast } from 'react-toastify';
const DateRangeForSales = ({ reflectDate, onDateChange: onDateChangeProp }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    // Set initial tempStartDate to the start of last month
    const [tempStartDate, setTempStartDate] = useState(() => startOfMonth(subMonths(new Date(), 1)));
    // Set initial tempEndDate to the end of last month
    const [tempEndDate, setTempEndDate] = useState(() => endOfMonth(subMonths(new Date(), 1)));
    const [open, setOpen] = useState(false);
    // Initialize selectedRangeText to 'Last Month' since it's the default preset
    const [selectedRangeText, setSelectedRangeText] = useState('Last Month');
    const [currentPreset, setCurrentPreset] = useState('Last Month');
    // Set initial appliedStartDate to the start of last month
    const [appliedStartDate, setAppliedStartDate] = useState(() => startOfMonth(subMonths(new Date(), 1)));
    // Set initial appliedEndDate to the end of last month
    const [appliedEndDate, setAppliedEndDate] = useState(() => endOfMonth(subMonths(new Date(), 1)));

    const id = open ? 'date-range-popover' : undefined;

    useEffect(() => {
        // Initial call with the default "Last Month"
        const today = new Date();
        const start = startOfMonth(subMonths(today, 1));
        const end = endOfMonth(subMonths(today, 1));
        // This initial call sets the default on component mount
        handleApplyPreset('Last Month', start, end);
        // We also need to set the initial applied dates and text here
        setAppliedStartDate(start);
        setAppliedEndDate(end);
        setSelectedRangeText('Last Month'); // Ensure the button reflects "Last Month"
    }, []);

    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
        // When opening, set the temp dates to the applied dates
        setTempStartDate(appliedStartDate);
        setTempEndDate(appliedEndDate);
        // When opening, ensure currentPreset is correctly set based on applied dates
        // This part needs careful consideration if you want to perfectly reflect the applied state
        // For simplicity, we'll keep the currentPreset as is when opening, assuming apply sets it correctly.
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setOpen(false);
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
    const payload = {};
    let rangeText;

    if (currentPreset) {
        payload.preset = currentPreset;
        rangeText = currentPreset;
    } else {
        payload.startDate = format(tempStartDate, 'yyyy-MM-dd');
        payload.endDate = format(tempEndDate, 'yyyy-MM-dd');
        rangeText = `${format(tempStartDate, 'dd/MM/yyyy')} - ${format(tempEndDate, 'dd/MM/yyyy')}`;
    }

    payload.text = rangeText;

    onDateChangeProp(payload);
    setSelectedRangeText(rangeText);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    handleClosePopover();

    // ✅ Show success toast
    toast.success("Filter applied successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });

    console.log('yyyy', rangeText);
};
    const handleApplyPreset = (preset, start, end) => {
        setTempStartDate(start);
        setTempEndDate(end);
        setCurrentPreset(preset);
        // When a preset is selected, update the displayed text *within the popover*
        // The actual `selectedRangeText` for the button will be set on "Apply"
        // For now, setting selectedRangeText here updates the *button's* text immediately upon selection,
        // which might not be the desired behavior if "Apply" is meant to confirm.
        // Let's refine this: the popover should show the selected date or preset name,
        // but the *button* only updates on `handleApply`.
        // To achieve the desired behavior, we'll only update `selectedRangeText` in `handleApply`.
        // Here, we just set the `currentPreset` and `tempDates`.
    };

    // --- Date Preset Handlers ---
    const handleToday = () => {
        const today = new Date();
        handleApplyPreset('Today', today, today);
    };

    const handleYesterday = () => {
        const yesterday = subDays(new Date(), 1);
        handleApplyPreset('Yesterday', yesterday, yesterday);
    };

    const handleThisWeek = () => {
        const today = new Date();
        const start = startOfWeek(today);
        // End date should be today for "This Week"
        handleApplyPreset('This Week', start, today);
    };

    const handleLastWeek = () => {
        const today = new Date();
        const start = startOfWeek(subWeeks(today, 1));
        const end = endOfWeek(subWeeks(today, 1));
        handleApplyPreset('Last Week', start, end);
    };

    const handleThisMonth = () => {
        const today = new Date();
        const start = startOfMonth(today);
        // End date should be today for "This Month"
        handleApplyPreset('This Month', start, today);
    };

    const handleLastMonth = () => {
        const today = new Date();
        const start = startOfMonth(subMonths(today, 1));
        const end = endOfMonth(subMonths(today, 1));
        handleApplyPreset('Last Month', start, end);
    };

    const handleThisQuarter = () => {
        const today = new Date();
        const start = startOfQuarter(today);
        // End date should be today for "This Quarter"
        handleApplyPreset('This Quarter', start, today);
    };

    const handleLastQuarter = () => {
        const today = new Date();
        const start = startOfQuarter(subQuarters(today, 1));
        const end = endOfQuarter(subQuarters(today, 1));
        handleApplyPreset('Last Quarter', start, end);
    };

    const handleThisYear = () => {
        const today = new Date();
        const start = startOfYear(today);
        // End date should be today for "This Year"
        handleApplyPreset('This Year', start, today);
    };

    const handleLastYear = () => {
        const today = new Date();
        const start = startOfYear(subYears(today, 1));
        const end = endOfYear(subYears(today, 1));
        handleApplyPreset('Last Year', start, end);
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
                    {/* Display selectedRangeText which is set in handleApply */}
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
                            {/* Today */}
                            <Button
                                onClick={handleToday}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Today' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Today' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Today' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Today
                            </Button>
                            {/* Yesterday */}
                            <Button
                                onClick={handleYesterday}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Yesterday' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Yesterday' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Yesterday' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Yesterday
                            </Button>
                            {/* This Week */}
                            <Button
                                onClick={handleThisWeek}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'This Week' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'This Week' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'This Week' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                This Week
                            </Button>
                            {/* Last Week */}
                            <Button
                                onClick={handleLastWeek}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last Week' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last Week' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last Week' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last Week
                            </Button>
                            {/* This Month */}
                            <Button
                                onClick={handleThisMonth}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'This Month' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'This Month' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'This Month' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                This Month
                            </Button>
                            {/* Last Month */}
                            <Button
                                onClick={handleLastMonth}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last Month' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last Month' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last Month' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last Month
                            </Button>
                            {/* This Quarter */}
                            <Button
                                onClick={handleThisQuarter}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'This Quarter' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'This Quarter' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'This Quarter' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                This Quarter
                            </Button>
                            {/* Last Quarter */}
                            <Button
                                onClick={handleLastQuarter}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last Quarter' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last Quarter' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last Quarter' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last Quarter
                            </Button>
                            {/* This Year */}
                            <Button
                                onClick={handleThisYear}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'This Year' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'This Year' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'This Year' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                This Year
                            </Button>
                            {/* Last Year */}
                            <Button
                                onClick={handleLastYear}
                                fullWidth
                                sx={{
                                    textTransform: 'capitalize',
                                    mb: 1,
                                    textAlign: 'start',
                                    backgroundColor: currentPreset === 'Last Year' ? 'primary.main' : '#f1f1f1',
                                    color: currentPreset === 'Last Year' ? '#fff' : '#485E75',
                                    '&:hover': {
                                        backgroundColor: currentPreset === 'Last Year' ? 'primary.dark' : '#f1f1f1',
                                    },
                                }}
                            >
                                Last Year
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

export default DateRangeForSales;