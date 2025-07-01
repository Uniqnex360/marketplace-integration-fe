import React from 'react';
import { Box, Skeleton, Grid, Paper, Typography } from '@mui/material';

function LatestOrdersSkeleton() {
  return (
    <Grid container spacing={3}>
      {/* Left Side - Bar Chart Skeleton */}
      <Grid item xs={12} md={8}>
        <Paper elevation={2} sx={{ borderRadius: 2, boxShadow: "none", height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
             <Typography variant="h6" sx={{ fontSize: "20px" }} mb={2}>
                                       Latest Orders
                                  </Typography>
          
                                  <Typography variant="h6" sx={{ fontSize: "14px" }} mb={2}>
                                      Showing all orders from the last 24 hours
                                  </Typography>
<Box
  sx={{
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    mt: 2,
    overflowX: 'auto',
    width: '100%',
    height: '200px', // ✅ Set max container height if needed
  }}
>
  {Array.from({ length: 15 }).map((_, index) => (
    <Skeleton
      key={index}
      variant="rectangular"
      width="20px"
      height={Math.floor(Math.random() * 150) + 50} // ✅ Increased range: height 50 to 200
    />
  ))}
</Box>

          </Box>
        </Paper>
      </Grid>

      {/* Right Side - List Items Skeleton */}
      <Grid item xs={12} md={4}>
        <Typography sx={{ mb: 1, fontSize: '16px', color: 'grey', fontWeight: 600 }}>
          <Skeleton width="150px" height="16px" /> {/* Date Placeholder */}
        </Typography>
        <Paper
          elevation={2}
          sx={{
            boxShadow: "none",
            maxHeight: "400px",
            overflowY: "auto",
            borderRadius: 2,
            padding: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton width="80%" height="16px" />
                  <Skeleton width="60%" height="12px" />
                </Box>
                <Skeleton width="60px" height="24px" />
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LatestOrdersSkeleton;