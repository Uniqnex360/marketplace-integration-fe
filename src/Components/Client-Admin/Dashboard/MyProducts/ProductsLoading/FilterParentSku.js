import React, { useState, useEffect } from 'react';
import { Popover, Box, TextField, Button } from '@mui/material';

function FilterParentSku({ open, anchorEl, onClose, onApply, isParentType }) {
  const [parentAsin, setParentAsin] = useState('');
  const [asin, setAsin] = useState('');
  const [hasChanges, setHasChanges] = useState(false);


 

  useEffect(() => {
    console.log('clear error',)
   
     if (isParentType === 'sku') {
      setHasChanges(parentAsin.trim() !== '' || asin.trim() !== '');
    } else {
      setHasChanges(parentAsin.trim() !== '');
    }
  }, [parentAsin, asin, isParentType]);

  const handleClear = () => {
    setParentAsin('');
    setAsin('');
    setHasChanges(false);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box p={2} display="flex" flexDirection="column" gap={1}>
        <TextField
          label="Parent SKU"
          size="small"
          fullWidth
          value={parentAsin}
          onChange={(e) => setParentAsin(e.target.value)}
        />

        {isParentType === 'sku' && (
          <TextField
            label="SKU"
            size="small"
            fullWidth
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
          />
        )}

        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            sx={{
              fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => onApply({ parentAsin, asin })}
            disabled={!hasChanges}
            sx={{
              fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
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
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

export default FilterParentSku;
