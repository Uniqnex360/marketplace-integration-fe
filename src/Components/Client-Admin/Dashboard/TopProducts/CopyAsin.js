import React from 'react';
import { Tooltip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function CopyAsin({ open, onClose, children }) {
    return (
        <Tooltip
            open={open}
            onClose={onClose}
            title={
                <Box
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <CheckCircleIcon sx={{ color: '#4CAF50', mr: 0.5, fontSize: 16 }} />
                    <span>ASIN Copied</span>
                </Box>
            }
            placement="top"
        >
            {children}
        </Tooltip>
    );
}

export default CopyAsin;