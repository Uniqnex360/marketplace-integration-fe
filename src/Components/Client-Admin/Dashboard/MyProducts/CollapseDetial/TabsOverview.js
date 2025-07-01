import React, { useState } from 'react';
import { Box, Tabs, Tab, Chip } from '@mui/material';
import InsightOverview from './InsightOverview';

const TabsOverview = ({ productId }) => {
  const [selectedTab, setSelectedTab] = useState(3); // Default: Insights tab

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const commonTextStyle = {
    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    fontSize: '16px',
    textTransform: 'none',
    fontWeight: 500,
    color: '#485E75',
    '&:hover': {
      color: '#1A73E8', // hover text color
    },
  };

  return (
    <Box sx={{ width: '1000px' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0, // Stick to the top
          zIndex: 1, // Ensure it stays on top of other content
          backgroundColor: 'white', // Add a background color to hide content underneath
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1A73E8', // active tab underline
            },
          }}
        >
          <Tab label="Keywords" sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }} />
          <Tab
            label={
              <Box display="flex" alignItems="center">
                <Chip
                  label="3"
                  size="small"
                  color="primary"
                  sx={{
                    ml: 1,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    bgcolor: '#E3F2FD',
                    color: '#1A73E8',
                    height: 24,
                    borderRadius: '30px',
                    px: 0.5,          // Reduce horizontal padding
                    minWidth: '24px',   // Minimum width to shrink chip
                    textAlign: 'center',
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  }}
                />

                <Box sx={{ ...commonTextStyle, ml: 1.0 }}>Suggested Keywords</Box>
              </Box>
            }
            sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }}
          />
          <Tab label="Competitors" sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }} />
          <Tab label="Insights" sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }} />
          <Tab label="Alerts" sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }} />
          <Tab label="Inventory" sx={{ ...commonTextStyle, '&:hover': { borderBottom: '2px solid #1A73E8' } }} />
        </Tabs>
      </Box>

      {selectedTab === 3 && <InsightOverview Ids={productId} />}
    </Box>
  );
};

export default TabsOverview;