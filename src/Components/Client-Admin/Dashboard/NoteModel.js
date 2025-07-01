import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  InputLabel,Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CloseIcon from '@mui/icons-material/Close';

const NoteModel = ({ open, onClose, onSave }) => {
  const [date, setDate] = useState(null);
  const [type, setType] = useState('');
  const [product, setProduct] = useState([]);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    // Implement your save logic here with the collected data
    onSave({ date, type, product, description });
    onClose();
    
  };

  const handleClose = () => {
    onClose();
  };

  const commonFontStyle = {
    fontFamily: "'Nunito Sans', '-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontSize: '16px', // Based on the screenshot inspection
          fontWeight: 600, // Slightly bolder than 500 in the screenshot
          color: '#485E75', // Font color from the screenshot
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          ...commonFontStyle,
        }}
      >
        Add a Note
        <IconButton onClick={handleClose} size="small" sx={{ color: '#485E75' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: '20px 24px' }}>
        <Typography variant="body2" color="#6B7A99" sx={{ marginBottom: '16px', fontSize: '14px', ...commonFontStyle }}>
          Place a note on the graph to annotate an event, business decision or something else you want to
          remember.
        </Typography>
<Box sx={{marginBottom: '18px'}}>
        <LocalizationProvider dateAdapter={AdapterDateFns} >
          <DatePicker
            label={<Typography sx={{ ...commonFontStyle, fontSize: '14px', paddingBottom:'5px',color: '#6B7A99' }}>Date *</Typography>}
            value={date}
            onChange={(newDate) => setDate(newDate)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': { ...commonFontStyle, fontSize: '14px', color: '#6B7A99' },
                  '& .MuiInputBase-input': { ...commonFontStyle, fontSize: '14px', color: '#1D2939' }, // Darker text
                  marginBottom: '16px',
                }}
              />
            )}
          />
        </LocalizationProvider>
        </Box>
        <FormControl fullWidth size="small" sx={{ marginBottom: '16px' }}>
          <InputLabel id="type-label" sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>
            Type
          </InputLabel>
          <Select
            labelId="type-label"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            label={<Typography sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>Type</Typography>}
            sx={{
              '& .MuiInputBase-input': { ...commonFontStyle, fontSize: '14px', color: '#1D2939' },
            }}
          >
            <MenuItem value="">
              <Typography sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>Choose or Create a Type</Typography>
            </MenuItem>
            {/* Add your type options here */}
            <MenuItem value="event">
              <Typography sx={commonFontStyle}>Event</Typography>
            </MenuItem>
            <MenuItem value="decision">
              <Typography sx={commonFontStyle}>Business Decision</Typography>
            </MenuItem>
            {/* ... more types ... */}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ marginBottom: '16px' }}>
          <InputLabel id="product-label" sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>
            Product
          </InputLabel>
          <Select
            labelId="product-label"
            id="product"
            multiple
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            label={<Typography sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>Product</Typography>}
            renderValue={(selected) => (
              <div>
                {selected.map((value) => (
                  <Typography key={value} sx={{ ...commonFontStyle, fontSize: '14px', color: '#1D2939' }}>
                    {value},
                  </Typography>
                ))}
              </div>
            )}
            sx={{
              '& .MuiInputBase-input': { ...commonFontStyle, fontSize: '14px', color: '#1D2939' },
            }}
          >
            <MenuItem disabled value="">
              <Typography sx={{ ...commonFontStyle, fontSize: '14px', color: '#98A7BC' }}>
                Select one or more Products
              </Typography>
            </MenuItem>
            {/* Add your product options here */}
            <MenuItem value="productA">
              <Typography sx={commonFontStyle}>Product A</Typography>
            </MenuItem>
            <MenuItem value="productB">
              <Typography sx={commonFontStyle}>Product B</Typography>
            </MenuItem>
            {/* ... more products ... */}
          </Select>
        </FormControl>

        <TextField
          label={<Typography sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>Description *</Typography>}
          multiline
          rows={4}
          fullWidth
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          inputProps={{ maxLength: 500, style: { ...commonFontStyle, fontSize: '14px', color: '#1D2939' } }}
          helperText={`${description.length}/500`}
          sx={{
            '& .MuiInputLabel-root': { ...commonFontStyle, fontSize: '14px', color: '#6B7A99' },
            '& .MuiInputBase-input': commonFontStyle,
            '& .MuiFormHelperText-root': { fontSize: '12px', color: '#98A7BC', ...commonFontStyle },
            marginBottom: '16px',
          }}
        />
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={handleClose} sx={{ ...commonFontStyle, fontSize: '14px', color: '#6B7A99' }}>
          Cancel
        </Button>
        <Button
        //   onClick={handleSave}
          variant="contained"
          sx={{ ...commonFontStyle, fontSize: '14px', color: '#fff', backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' } }} // Primary blue
        >
          Save Note
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteModel;