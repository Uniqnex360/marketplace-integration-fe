import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  Paper,
  Fade,
  styled,
} from '@mui/material';

// Styled Skeleton component to override the default background color
const CustomSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: '#dce3ec',
}));

const SkeletonTableMyProducts = () => {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0); // For tab selection
  const rows = 8; // Number of skeleton rows
  const cols = 7; // Number of skeleton columns

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ boxShadow: 'none', width: '100%', overflow: 'hidden' }}>

      <Box sx={{ p: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {loading && Array.from({ length: cols }).map((_, idx) => (
                <TableCell key={idx} sx={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                  <CustomSkeleton variant="text" width={80} />
                </TableCell>
              ))}
          
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <TableCell key={colIdx} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                      {colIdx === 0 ? (
                        <CustomSkeleton variant="rectangular" width={120} height={20} animation="wave" />
                      ) : (
                        <CustomSkeleton variant="rectangular" width={80} height={20} animation="wave" />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Render actual data rows with a fade-in transition when not loading */}
           
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default SkeletonTableMyProducts;