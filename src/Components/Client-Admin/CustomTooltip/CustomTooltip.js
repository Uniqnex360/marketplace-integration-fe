import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,

    Tooltip,
} from '@mui/material';
const CustomizeTooltip = ({ title, children }) => (
  <Tooltip
    title={
      <>
        {title}
      </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
      arrow: {
        sx: {
          color: '#1A2E42', // Set arrow color to the background color
        },
      },
    }}
  >
    {children}
  </Tooltip>
);

  

export default CustomizeTooltip