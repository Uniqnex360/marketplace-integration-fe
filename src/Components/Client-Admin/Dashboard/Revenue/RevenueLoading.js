import React from 'react';
import { Box, Skeleton } from '@mui/material';

const LoadingSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      {/* Top Controls (like the dropdown and buttons) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rectangular" width={160} height={40} borderRadius={1} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={100} height={36} borderRadius={1} />
          <Skeleton variant="rectangular" width={80} height={36} borderRadius={1} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <Skeleton variant="text" width={150} height={24} />
        <Skeleton variant="text" width={250} height={20} />
      </Box>

      {/* Optional: Bottom information area */}
      {/* <Box sx={{ mt: 2 }}>
        <Skeleton variant="text" width={100} height={16} />
      </Box> */}
    </Box>
  );
};

export default LoadingSkeleton;