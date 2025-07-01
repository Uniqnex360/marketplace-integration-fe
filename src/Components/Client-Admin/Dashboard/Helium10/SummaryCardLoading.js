import React from 'react';
import { Box, Typography, IconButton, Button, Skeleton } from '@mui/material';
import ArrowLeft from '@mui/icons-material/ArrowLeft';
import ArrowRight from '@mui/icons-material/ArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';

const SkeletonLoadingUI = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* Date and Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
        <IconButton size="small">
          <ArrowLeft />
        </IconButton>
        <Typography variant="subtitle2" sx={{ mx: 1, color: '#757575', width: 80 }}>
          <Skeleton width="100%" height={20} />
        </Typography>
        <IconButton size="small">
          <ArrowRight />
        </IconButton>
      </Box>

      {/* Metric 1: Gross Revenue */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 4 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={100} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={60} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Graph Placeholder */}
      <Box sx={{ flexGrow: 1, height: 60, mr: 4 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>

      {/* Metric 2: Orders */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 4 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={60} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={30} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Metric 3: Units Sold */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 4 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={80} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={30} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Metric 4: Refunds */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 4 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={60} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={30} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Metric 5: COGS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 4 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={40} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={50} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Metric 6: Margin */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 2 }}>
        <Typography variant="overline" color="textSecondary">
          <Skeleton width={50} height={16} />
        </Typography>
        <Typography variant="h6">
          <Skeleton width={40} height={24} />
        </Typography>
        <Typography variant="caption" color="success">
          <Skeleton width={40} height={16} />
        </Typography>
      </Box>

      {/* Choose Metrics Button */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<SettingsIcon />}
        sx={{ ml: 'auto' }}
      >
        <Skeleton width={120} height={40} />
      </Button>
    </Box>
  );
};

export default SkeletonLoadingUI;