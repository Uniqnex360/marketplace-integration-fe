import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Grid,
  Switch,
  Button,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

// Sample product data (replace with your actual data)
const products = [
  {
    id: 1,
    name: 'Neuriva Neuriva Original Brain Performance (90 Count), Brain...',
    asin: 'B07Q2W5HCY',
    imageUrl: 'https://via.placeholder.com/40', // Replace with actual image URL
    countryCode: 'US', // Example country code
  },
  {
    id: 2,
    name: 'NEURIVA Ultra Brain Supplement for Mental...',
    asin: 'B08ZGFP5VY',
    imageUrl: 'https://via.placeholder.com/40', // Replace with actual image URL
    countryCode: 'US',
  },
  {
    id: 3,
    name: 'D-Con No View, No Touch Covered Mouse Trap, 6 Pack (2...',
    asin: 'B07Q86VPBY',
    imageUrl: 'https://via.placeholder.com/40', // Replace with actual image URL
    countryCode: 'US',
  },
  {
    id: 4,
    name: 'NEURIVA Memory 3D Brain Supplement - Nootropic...',
    asin: 'B0F3BLZC5X',
    imageUrl: 'https://via.placeholder.com/40', // Replace with actual image URL
    countryCode: 'US',
  },
  {
    id: 5,
    name: 'NEURIVA Plus Brain Supplement for Memory, Focus &...',
    asin: 'B07QVB8W12',
    imageUrl: 'https://via.placeholder.com/40', // Replace with actual image URL
    countryCode: 'US',
  },
];

// Sample chart data (replace with your actual time-series data)
const chartData = [
  { time: '01:30', 'B07Q2W5HCY': 10, 'B08ZGFP5VY': 25, 'B07Q86VPBY': 5, 'B0F3BLZC5X': 15, 'B07QVB8W12': 30 },
  { time: '02:30', 'B07Q2W5HCY': 15, 'B08ZGFP5VY': 10, 'B07Q86VPBY': 12, 'B0F3BLZC5X': 20, 'B07QVB8W12': 18 },
  { time: '03:30', 'B07Q2W5HCY': 8, 'B08ZGFP5VY': 30, 'B07Q86VPBY': 7, 'B0F3BLZC5X': 10, 'B07QVB8W12': 25 },
  { time: '04:30', 'B07Q2W5HCY': 22, 'B08ZGFP5VY': 15, 'B07Q86VPBY': 18, 'B0F3BLZC5X': 25, 'B07QVB8W12': 12 },
  { time: '05:30', 'B07Q2W5HCY': 120, 'B08ZGFP5VY': 80, 'B07Q86VPBY': 40, 'B0F3BLZC5X': 60, 'B07QVB8W12': 90 },
  { time: '06:30', 'B07Q2W5HCY': 35, 'B08ZGFP5VY': 20, 'B07Q86VPBY': 10, 'B0F3BLZC5X': 30, 'B07QVB8W12': 45 },
  { time: '07:30', 'B07Q2W5HCY': 50, 'B08ZGFP5VY': 40, 'B07Q86VPBY': 25, 'B0F3BLZC5X': 35, 'B07QVB8W12': 55 },
  { time: '08:30', 'B07Q2W5HCY': 65, 'B08ZGFP5VY': 55, 'B07Q86VPBY': 30, 'B0F3BLZC5X': 45, 'B07QVB8W12': 70 },
  { time: '09:30', 'B07Q2W5HCY': 80, 'B08ZGFP5VY': 1050, 'B07Q86VPBY': 35, 'B0F3BLZC5X': 55, 'B07QVB8W12': 85 },
  { time: '10:30', 'B07Q2W5HCY': 70, 'B08ZGFP5VY': 90, 'B07Q86VPBY': 40, 'B0F3BLZC5X': 65, 'B07QVB8W12': 75 },
  { time: '11:30', 'B07Q2W5HCY': 95, 'B08ZGFP5VY': 75, 'B07Q86VPBY': 45, 'B0F3BLZC5X': 80, 'B07QVB8W12': 95 },
  { time: '12:30', 'B07Q2W5HCY': 110, 'B08ZGFP5VY': 60, 'B07Q86VPBY': 50, 'B0F3BLZC5X': 90, 'B07QVB8W12': 105 },
  { time: '13:30', 'B07Q2W5HCY': 1350, 'B08ZGFP5VY': 85, 'B07Q86VPBY': 55, 'B0F3BLZC5X': 100, 'B07QVB8W12': 120 },
  { time: '14:30', 'B07Q2W5HCY': 120, 'B08ZGFP5VY': 70, 'B07Q86VPBY': 60, 'B0F3BLZC5X': 110, 'B07QVB8W12': 100 },
  { time: '15:30', 'B07Q2W5HCY': 100, 'B08ZGFP5VY': 95, 'B07Q86VPBY': 65, 'B0F3BLZC5X': 120, 'B07QVB8W12': 130 },
  { time: '16:30', 'B07Q2W5HCY': 85, 'B08ZGFP5VY': 110, 'B07Q86VPBY': 70, 'B0F3BLZC5X': 130, 'B07QVB8W12': 115 },
  { time: '17:30', 'B07Q2W5HCY': 90, 'B08ZGFP5VY': 125, 'B07Q86VPBY': 75, 'B0F3BLZC5X': 140, 'B07QVB8W12': 145 },
  { time: '18:30', 'B07Q2W5HCY': 75, 'B08ZGFP5VY': 100, 'B07Q86VPBY': 80, 'B0F3BLZC5X': 150, 'B07QVB8W12': 135 },
  { time: '19:30', 'B07Q2W5HCY': 60, 'B08ZGFP5VY': 85, 'B07Q86VPBY': 85, 'B0F3BLZC5X': 160, 'B07QVB8W12': 155 },
  { time: '20:30', 'B07Q2W5HCY': 50, 'B08ZGFP5VY': 70, 'B07Q86VPBY': 90, 'B0F3BLZC5X': 170, 'B07QVB8W12': 165 },
];

function NewTopProducts() {
  const [value, setValue] = useState(0);
  const [showEvents, setShowEvents] = useState(false);
  const [activePoint, setActivePoint] = useState(null);
  const theme = useTheme();

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
    // Implement logic to fetch data based on the selected tab (Revenue, Units Sold, Refunds)
  };

  const handleEventsToggle = (event) => {
    setShowEvents(event.target.checked);
    // Implement logic to display/hide events on the graph
  };

  const handleLineMouseOver = (o) => {
    if (o && o.activePayload && o.activePayload.length > 0) {
      setActivePoint(o.activePayload[0].name);
    } else {
      setActivePoint(null);
    }
  };

  const handleLineMouseOut = () => {
    setActivePoint(null);
  };

  return (
    <Card>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between" mb={2}>
          <Grid item>
            <Typography variant="h6">Top 5 Products</Typography>
          </Grid>
          <Grid item>
            <Button startIcon={<AddIcon />} size="small">
              Add Note
            </Button>
            <Switch
              checked={showEvents}
              onChange={handleEventsToggle}
              inputProps={{ 'aria-label': 'toggle events' }}
              size="small"
              sx={{ ml: 2 }}
            />
            <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
              Events
            </Typography>
          </Grid>
        </Grid>

        <Tabs value={value} onChange={handleChangeTab} aria-label="product metrics tabs">
          <Tab label="Revenue" />
          <Tab label="Units Sold" />
          <Tab label="Refunds" />
        </Tabs>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={4}>
            <List>
              {products.map((product, index) => (
                <ListItem key={product.id}>
                  <ListItemAvatar>
                    <Avatar src={product.imageUrl} alt={product.name} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`${product.asin} (${product.countryCode})`}
                  />
                  <IconButton edge="end" aria-label="details">
                    <InfoIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={8}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                onMouseMove={handleLineMouseOver}
                onMouseLeave={handleLineMouseOut}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                {products.map((product) => (
                  <Line
                    key={product.asin}
                    type="monotone"
                    dataKey={product.asin}
                    stroke={theme.palette.primary.main} // You can customize colors
                    strokeWidth={2}
                    dot={(entry) => activePoint === product.asin}
                    activeDot={{ r: 8 }}
                    name={product.name.substring(0, 20) + '...'} // Shorten name for legend
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default NewTopProducts;