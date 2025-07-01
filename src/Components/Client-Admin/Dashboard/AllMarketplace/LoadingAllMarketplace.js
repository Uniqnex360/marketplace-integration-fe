import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Skeleton,
  Grid,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: '#e0e0e0', // Adjust color as needed
}));

const MarketplacesSkeleton = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <Paper sx={{ p: 2, boxShadow: 'none' }}>
      <Box sx={{ mb: 2 }}>
        {loading ? (
          <CustomSkeleton variant="text" width={180} height={24} />
        ) : (
          'All Marketplaces' // Replace with actual title
        )}
      </Box>
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <CustomSkeleton variant="text" width={120} height={18} />
        ) : (
          'May 29, 2025' // Replace with actual date
        )}
      </Box>

      {Array.from({ length: 6 }).map((_, index) => (
        <Fade in={loading} key={index} timeout={{ enter: 300 + index * 100, exit: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <CustomSkeleton variant="rectangular" height={40} />
              </Grid>
              <Grid item xs={3}>
                <CustomSkeleton variant="rectangular" height={40} />
              </Grid>
              <Grid item xs={3}>
                <CustomSkeleton variant="rectangular" height={40} />
              </Grid>
              <Grid item xs={3}>
                <CustomSkeleton variant="rectangular" height={40} />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      ))}

      <Fade in={loading} timeout={{ enter: 300 + 6 * 100, exit: 0 }}>
        <Box sx={{ mb: 3 }}>
          <CustomSkeleton variant="rectangular" height={30} width={100} />
        </Box>
      </Fade>

      {Array.from({ length: 8 }).map((_, index) => (
        <Fade in={loading} key={`row-${index}`} timeout={{ enter: 300 + (index + 7) * 100, exit: 0 }}>
          <Box sx={{ mb: 1 }}>
            <CustomSkeleton variant="rectangular" height={20} />
          </Box>
        </Fade>
      ))}
    </Paper>
  );
};

export default MarketplacesSkeleton;