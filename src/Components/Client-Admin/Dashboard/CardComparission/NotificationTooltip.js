import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Collapse,
} from '@mui/material';

const NotificationTooltip = ({ content }) => {
  useEffect(() => {
    console.log('Tooltip data:', content);
  }, [content]);

  const {
    gross = 0,
    totalCosts = 0,
    productRefunds = 0,
    totalTax = 0,
    cogs = 0,
    ppcProductCost = 0,
    ppcBrandsCost = 0,
    ppcDisplayCost = 0,
    ppcStCost = 0,
    product_cost = 0,
    shipping_cost = 0,
  } = content || {};

  const netProfit = gross - totalCosts;
  const margin = gross ? ((netProfit / gross) * 100).toFixed(0) : 0;
  const totalPpc = ppcProductCost + ppcBrandsCost + ppcDisplayCost + ppcStCost;

  return (
    <Card sx={{ width: 360, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={6}><Typography>Total Tax</Typography></Grid>
          <Grid item xs={6}><Typography align="right">${totalTax.toFixed(2)}</Typography></Grid>

          <Grid item xs={6}><Typography>Shipping</Typography></Grid>
          <Grid item xs={6}><Typography align="right">${shipping_cost.toFixed(2)}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={6}>
            <Typography 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              Gross Revenue
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              align="right" 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              ${gross.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={6}><Typography>Refunds</Typography></Grid>
          <Grid item xs={6}><Typography align="right">${productRefunds.toFixed(2)}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={6}>
            <Typography 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              Estimated Payout
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              align="right" 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              ${(gross - cogs).toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={6}><Typography>COGS</Typography></Grid>
          <Grid item xs={6}><Typography align="right" color="error">-${cogs.toFixed(2)}</Typography></Grid>

          <Grid item xs={6}><Typography>PPC Cost</Typography></Grid>
          <Grid item xs={6}><Typography align="right">${totalPpc.toFixed(2)}</Typography></Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={6}>
            <Typography 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              Net Profit
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              align="right" 
              fontWeight="bold" 
              sx={{ fontSize: '16px', color: '#485E75' }}>
              ${netProfit.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={6}   sx={{ fontSize: '16px', color: '#485E75' }}><Typography>Margin</Typography></Grid>
          <Grid item xs={6}><Typography align="right">{margin}%</Typography></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NotificationTooltip;
