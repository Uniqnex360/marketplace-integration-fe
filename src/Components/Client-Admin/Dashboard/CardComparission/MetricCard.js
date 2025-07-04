import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Popover,
  Grid,
  Button,
  Container,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import NotificationTooltip from './NotificationTooltip';

import {  Delete} from '@mui/icons-material';
import DottedCircleLoading from '../../../Loading/DotLoading';
const CustomPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    backgroundColor: 'white',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    padding: theme.spacing(1),
    fontFamily: "'Nunito Sans', sans-serif",
    color: '#485E75',
    fontSize: '14px',
  },
}));

    const formatterLong = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const formatterShort = new Intl.DateTimeFormat('en-US', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

function OrderInfoPopover({ open, anchorEl, handleClose, organic, sponsored, total }) {
  return (
    <Box
    sx={{
      borderRadius: '6px',
      boxShadow: 'none',
      border: '1px solid rgb(161, 173, 184)',
    }}
  >
    <CustomPopover
      id="order-info-popover"
      sx={{
        pointerEvents: 'none',
        boxShadow: 3,
      }}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      onClose={handleClose}
      disableRestoreFocus
    >
      <Box
        sx={{
          p: 1,
          width: '200px',
          borderRadius: '8px',
          backgroundColor: '#fff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
          <Typography sx={{ fontSize: '12px' }}>Organic</Typography>
          <Typography sx={{ fontSize: '12px' }}>{organic}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
          <Typography sx={{ fontSize: '12px' }}>Sponsored</Typography>
          <Typography sx={{ fontSize: '12px' }}>0</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold', mb: 0.5 }}>Total Orders</Typography>
          <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{organic}</Typography>
        </Box>
      </Box>
    </CustomPopover>
  </Box>
  
  );
}

const PerformanceCard = ({
  title,
  date,
  previous,
  netPrevious,
  dateRange,
  dateRangePrev,
  dateRangeFormat,
  dateRangePrevFormat,
  grossRevenue,
  grossRevenueChange,
  expenses,
  netProfit,
  netProfitChange,
  margin,
  orders,
  unitsSold,
  refunds,
  netProfitCalculation,
  organicOrders,
  sponsoredOrders,
  totalOrders,
}) => {
  const [anchorElOptions, setAnchorElOptions] = useState(null);
  const [openOptionsPopover, setOpenOptionsPopover] = useState(false);
  const [anchorElOrders, setAnchorElOrders] = useState(null);
  const [openOrdersPopover, setOpenOrdersPopover] = useState(false);
  const [anchorElUnitsSold, setAnchorElUnitsSold] = useState(null);
  const [openUnitsSoldPopover, setOpenUnitsSoldPopover] = useState(false);
  const [anchorElRefunds, setAnchorElRefunds] = useState(null);
  const [openRefundsPopover, setOpenRefundsPopover] = useState(false);
  const [marginPopoverAnchorEl, setMarginPopoverAnchorEl] = useState(null);
  const [openMarginPopover, setOpenMarginPopover] = useState(false);
  const [anchorElGrossRevenue, setAnchorElGrossRevenue] = useState(null);
  const [openGrossRevenuePopover, setOpenGrossRevenuePopover] = useState(false);
  const [anchorElNetProfit, setAnchorElNetProfit] = useState(null);
  const [openNetProfitPopover, setOpenNetProfitPopover] = useState(false);

  const [loading, setLoading] = useState(false);

  
  const openOrder = Boolean(anchorElOrders);
  const previousGrossRevenue = parseFloat(previous);
  const currentGrossRevenue = parseFloat(grossRevenue?.replace('$', '').replace(',', ''));
  const grossRevenueDiff = currentGrossRevenue - previousGrossRevenue;
  const grossRevenuePercentageChange = !isNaN(previousGrossRevenue) && previousGrossRevenue !== 0
    ? (grossRevenueDiff / previousGrossRevenue) * 100
    : 0;

  const netPreviousValue = parseFloat(netPrevious?.replace('$', '').replace(',', ''));
  const currentNetProfitValue = parseFloat(netProfit?.replace('$', '').replace(',', ''));
  const netProfitDiff = currentNetProfitValue - netPreviousValue;
  const netProfitPercentageChange = !isNaN(netPreviousValue) && netPreviousValue !== 0
    ? (netProfitDiff / netPreviousValue) * 100
    : 0;

  const handleOpenOptionsPopover = (event) => {
    setAnchorElOptions(event.currentTarget);
    setOpenOptionsPopover(true);
  };

  const handleCloseOptionsPopover = () => {
    setOpenOptionsPopover(false);
    setAnchorElOptions(null);
  };

  const handleOpenOrdersPopover = (event) => {
    setAnchorElOrders(event.currentTarget);
    setOpenOrdersPopover(true);
  };

  const handleCloseOrdersPopover = () => {
    setOpenOrdersPopover(false);
    setAnchorElOrders(null);
  };

  const handleOpenUnitsSoldPopover = (event) => {
    setAnchorElUnitsSold(event.currentTarget);
    setOpenUnitsSoldPopover(true);
  };

  const handleCloseUnitsSoldPopover = () => {
    setOpenUnitsSoldPopover(false);
    setAnchorElUnitsSold(null);
  };

  const handleOpenRefundsPopover = (event) => {
    setAnchorElRefunds(event.currentTarget);
    setOpenRefundsPopover(true);
  };

  const handleCloseRefundsPopover = () => {
    setOpenRefundsPopover(false);
    setAnchorElRefunds(null);
  };

  const handleOpenMarginPopover = (event) => {
    setMarginPopoverAnchorEl(event.currentTarget);
    setOpenMarginPopover(true);
  };

  const handleCloseMarginPopover = () => {
    setOpenMarginPopover(false);
    setMarginPopoverAnchorEl(null);
  };

  const handleOpenGrossRevenuePopover = (event) => {
    console.log('llllll',dateRange)
    setAnchorElGrossRevenue(event.currentTarget);
    setOpenGrossRevenuePopover(true);
  };

  const handleCloseGrossRevenuePopover = () => {
    setOpenGrossRevenuePopover(false);
    setAnchorElGrossRevenue(null);
  };

  const handleOpenNetProfitPopover = (event) => {
    setAnchorElNetProfit(event.currentTarget);
    setOpenNetProfitPopover(true);
  };

  const handleCloseNetProfitPopover = () => {
    setOpenNetProfitPopover(false);
    setAnchorElNetProfit(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };


  
  const renderChange = (value) => {
    if (!value) return null;
    const isNegative = value.startsWith('-');
    return (
      <Typography
        variant="caption"
        sx={{
          fontSize: '14px',
          color: isNegative ? 'error.main' : 'success.main',
          display: 'flex',
          alignItems: 'center',
        }}
      >



        {isNegative ? <ArrowUpwardIcon  sx={{ fontSize: '14px', color: 'rgb(51, 204, 153)' }}/> : <ArrowDownwardIcon sx={{ fontSize: '14px', color: 'red' }}/>}
        {value}
      </Typography>
    );
  };

  return (

    <Box sx={{  width:'100%', marginTop:'10px'}}>
           
    <Card sx={{ border: '1px solid #e0e0e0', fontSize: '14px', width: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '20px', color: '#13191F', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton aria-label="options" size="small" onClick={handleOpenOptionsPopover}>
          <MoreVertIcon />
        </IconButton>
        <Popover
  open={openOptionsPopover}
  anchorEl={anchorElOptions}
  onClose={handleCloseOptionsPopover}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Box sx={{ border: '1px solid #ddd', p: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '14px',
    color: '#485E75',
    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
 }}>
      <Delete sx={{color:'rgb(72, 94, 117)'}} fontSize="small" />
      <Typography>Remove</Typography>
    </Box>
  </Box>
</Popover>

      </Box>

      <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', mb: 1 }}>
        {date ? formatDate(date) : dateRange}
      </Typography>

      {/* Gross Revenue and Expenses */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '14px', fontFamily: "'Nunito Sans', sans-serif", color: '#485E75' }}>Gross Revenue</Typography>
          <Box
            aria-owns={openGrossRevenuePopover ? 'gross-revenue-popover' : undefined}
            aria-haspopup="true"
            onMouseEnter={handleOpenGrossRevenuePopover}
            onMouseLeave={handleCloseGrossRevenuePopover}
          >
            <Typography
              sx={{
                fontSize: '24px',
                fontFamily: "'Nunito Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {grossRevenue}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isNaN(grossRevenuePercentageChange) && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '12px',    fontFamily: "'Nunito Sans', sans-serif", color: grossRevenuePercentageChange > 0 ? '#121212' : grossRevenuePercentageChange < 0 ? '#121212' : 'inherit' }}>
                    {grossRevenuePercentageChange !== 0 && `${Math.abs(grossRevenuePercentageChange).toFixed(2)}%`}
                  </Typography>
                  {!isNaN(grossRevenuePercentageChange) && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {grossRevenuePercentageChange > 0 ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: 'rgb(51, 204, 153)', mr: 0.5 }} />
                      ) : grossRevenuePercentageChange < 0 ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14, color: 'red', mr: 0.5 }} />
                      ) : 'N/A'}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
          <Popover
            id="gross-revenue-popover"
            sx={{ pointerEvents: 'none',boxShadow:'none' }}
            open={openGrossRevenuePopover}
            anchorEl={anchorElGrossRevenue}
            onClose={handleCloseGrossRevenuePopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            disableRestoreFocus
          >
<Typography sx={{
  p: 2,
  fontSize: '14px',
  borderRadius: '6px',
  boxShadow: 'none',
  border: '1px solid rgb(161, 173, 184)',
  width: '300px',
  color: '#485E75',
}}>
 <Box sx={{ color: '#121212', fontWeight:'bold',fontSize:'16px' }}>Current vs Previous Period</Box>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ minWidth: '130px', textAlign: 'left' }}>{dateRangeFormat}</div>
    <div style={{ textAlign: 'right' }}>{grossRevenue}</div>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ minWidth: '130px', textAlign: 'left' }}>{dateRangePrevFormat}</div>
    <div style={{ textAlign: 'right' }}>${previous}</div>
  </div>
  <br />
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#121212', textAlign: 'left' }}>
    Change:
  </span>
  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#121212', textAlign: 'right' }}>
  {(() => {
    const value =
      parseFloat(grossRevenue?.replace('$', '').replace(',', '') || '0') -
      parseFloat(previous || '0');
    const formatted = Math.abs(value).toFixed(2);
    return `${value < 0 ? '-' : ''}$${formatted}`;
  })()}
</span>

</div>
</Typography>

            {/* <Typography sx={{ p: 1 }}>
              Current vs Previous Period
              <br />
              {date ? formatDate(date) : dateRange} : {grossRevenue}
              <br />
              {date ? formatDate(new Date(new Date(date).setDate(new Date(date).getDate() - 1))) : 'Previous Period'} : ${previous}
              <br />
              Change: ${parseFloat(grossRevenue?.replace('$', '').replace(',', '')) - parseFloat(previous || '0')}
            </Typography> */}
          </Popover>
          <Typography sx={{ fontSize: '12px', color: grossRevenueChange?.includes('-') ? 'error.main' : 'success.main' }}>
            {renderChange(grossRevenueChange)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '14px', color: '#485E75',   fontFamily: "'Nunito Sans', sans-serif", }}>Expenses</Typography>
          <Typography sx={{ fontSize: '18px',   fontFamily: "'Nunito Sans', sans-serif", }}>{expenses}</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Net Profit + Margin */}
      <Box sx={{ backgroundColor: 'rgb(242, 245, 247)' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            px: 1,
            py: 2,
            backgroundColor: 'rgb(242, 245, 247)',
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: '14px', color: '#485E75' }}>
              Net Profit
            </Typography>
            <Box
              aria-owns={openNetProfitPopover ? 'net-profit-popover' : undefined}
              aria-haspopup="true"
              onMouseEnter={handleOpenNetProfitPopover}
              onMouseLeave={handleCloseNetProfitPopover}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: '24px',
                  fontFamily: "'Nunito Sans', sans-serif",
                  cursor: 'pointer',
                }}
              >
                {netProfit}
              </Typography>
              {netPrevious && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '12px',   fontFamily: "'Nunito Sans', sans-serif",
                      color: netProfitPercentageChange > 0 ? '#121212' : netProfitPercentageChange < 0 ? '#121212' : 'inherit',
                    }}
                  >
                    {netProfitPercentageChange !== 0 && `${Math.abs(netProfitPercentageChange).toFixed(2)}%`}
                  </Typography>
                  {!isNaN(netProfitPercentageChange) && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {netProfitPercentageChange > 0 ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14, color: 'rgb(51, 204, 153)', mr: 0.5 }} />
                      ) : netProfitPercentageChange < 0 ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14, color: 'red', mr: 0.5 }} />
                      ) : 'N/A'}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            <Popover
  id="net-profit-popover"
  sx={{ pointerEvents: 'none' }}
  open={openNetProfitPopover}
  anchorEl={anchorElNetProfit}
  onClose={handleCloseNetProfitPopover}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
  disableRestoreFocus
>



<Typography sx={{
  p: 2,
  fontSize: '14px',
  borderRadius: '6px',
  boxShadow: 'none',
  border: '1px solid rgb(161, 173, 184)',
  width: '300px',
  color: '#485E75',
}}>
<Box sx={{ color: '#121212',fontWeight:'bold',fontSize:'16px' }}>Current vs Previous Period</Box>
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ minWidth: '130px', textAlign: 'left' }}>{dateRangeFormat}</div>
    <div style={{ textAlign: 'right' }}>{netProfit}</div>
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ minWidth: '130px', textAlign: 'left' }}>{dateRangePrevFormat}</div>
    <div style={{ textAlign: 'right' }}>${previous}</div>
  </div>
  <br />
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#121212', textAlign: 'left' }}>
    Change:
  </span>
  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#121212', textAlign: 'right' }}>
  {(() => {
    const profit = parseFloat(netProfit?.replace('$', '').replace(',', '') || '0');
    const previous = parseFloat(netPrevious?.replace('$', '').replace(',', '') || '0');
    const difference = profit - previous;
    const formatted = Math.abs(difference).toFixed(2);
    return `${difference < 0 ? '-' : ''}$${formatted}`;
  })()}
</span>

</div>
</Typography>


</Popover>


          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '14px', fontFamily: "'Nunito Sans', sans-serif", color: '#485E75' }}>Margin</Typography>
            <Typography sx={{ fontSize: '18px', fontFamily: "'Nunito Sans', sans-serif" }}>{margin}</Typography>
            <Tooltip
  title={<NotificationTooltip content={netProfitCalculation?.current} />}
  placement="left"
  PopperProps={{
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
    sx: {
      [`& .MuiTooltip-tooltip`]: {
        backgroundColor: 'transparent',
        boxShadow: '3',
        // border: '1px solid #121212',
        color: '#000', // or your preferred text color
        padding: 0,
      },
    },
  }}
>
  <Button
    size="small"
    sx={{
      mt: 0.5,
      fontSize: '14px',
      textTransform: 'capitalize',
      fontFamily: "'Nunito Sans', sans-serif",
      padding: 0,
      
    
    }}
  >
    Explain
  </Button>
</Tooltip>

          </Box>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontFamily: "'Nunito Sans', sans-serif",
    px: 2,
    width: '100%',
  }}
>
  {[
    ['Orders', orders, handleOpenOrdersPopover, handleCloseOrdersPopover, openOrdersPopover, anchorElOrders, (
      <OrderInfoPopover
        open={openOrdersPopover}
        anchorEl={anchorElOrders}
        handleClose={handleCloseOrdersPopover}
        organic={orders}
        sponsored={sponsoredOrders}
        total={totalOrders}
      />
    )],
    ['Units Sold', unitsSold],
    ['Refunds', refunds],
  ].map(([label, value, handleOpen, handleClose, openPopover, anchorEl, popoverContent]) => (
    <Box
      key={label}
      sx={{
        paddingRight:'20px',
        flex: 1,
        textAlign:
          label === 'Orders' ? 'left' : label === 'Units Sold' ? 'center' : 'right',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: '#485E75',
          fontSize: '14px',
          fontFamily: "'Nunito Sans', sans-serif",
          display: 'flex',
          justifyContent:
            label === 'Orders' ? 'flex-start' : label === 'Units Sold' ? 'center' : 'end',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {label}
        {label === 'Orders' && (
          <Box
            aria-owns={openPopover ? `mouse-over-popover-${label}` : undefined}
            aria-haspopup="true"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
          >
            <InfoOutlinedIcon sx={{ fontSize: '16px', cursor: 'pointer' }} />
          </Box>
        )}
      </Typography>

      <Typography
        sx={{
          fontSize: '18px',
          fontFamily: "'Nunito Sans', sans-serif",
        }}
      >
        {value}
      </Typography>

      {label === 'Orders' && popoverContent && (
        <Popover
          id={`mouse-over-popover-${label}`}
          sx={{ pointerEvents: 'none' }}
          open={openPopover}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleClose}
          disableRestoreFocus
        >
          {popoverContent}
        </Popover>
      )}
    </Box>
  ))}
</Box>

      </CardContent>
    </Card>
         
    </Box>
  );
};

const MetricCard = ({ startDate, endDate, widgetData , marketPlaceId,brand_id,product_id,manufacturer_name, fulfillment_channel, DateStartDate, DateEndDate}) => {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  let lastParamsRef = useRef("");

useEffect(() => {
        const currentParams = JSON.stringify({
            preset: widgetData,
            marketplace_id: marketPlaceId?.id,
            brand_id,
            product_id,
            manufacturer_name,
            fulfillment_channel,
             DateStartDate,
              DateEndDate
                   
        });

        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
            fetchMetricsComparission(widgetData);
        }

    }, [widgetData, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel,DateStartDate, DateEndDate]);

              const fetchMetricsComparission = async () => {
                setLoading(true)
                try {
                  const response = await axios.post(
                    `${process.env.REACT_APP_IP}getPeriodWiseDataCustom/`,
                    {
                        preset: widgetData,
                        marketplace_id: marketPlaceId.id,
                        brand_id: brand_id,
                        product_id: product_id,
                        manufacturer_name: manufacturer_name,
                        fulfillment_channel: fulfillment_channel,
                       start_date:DateStartDate,
                        end_date :DateEndDate,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }
                  );

                  const data = response.data;

        console.log("Fetched Data:", response.data);   // log the data
        setMetricsData(response.data);                 // update state with data
      } catch (error) {
        console.error("Error fetching metrics:", error); // handle error
      }
      finally{
        setLoading(false)
      }
    };
    
  const transformData = (data) => {
    if (!data) return [];
    return [
      {
        title: 'Today',
        date: new Date(data.today.dateRanges.current.from).toLocaleDateString(),
        dateRangePrev: `${new Date(data.today.dateRanges.previous.from).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} - ${new Date(data.today.dateRanges.previous.to).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, 

        dateRange: `${new Date(data.today.dateRanges.current.from).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} - ${new Date(data.today.dateRanges.current.to).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, 



        // Format change like 21/4/2025


        dateRangePrevFormat: `${new Date(data.today.dateRanges.previous.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.today.dateRanges.previous.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        
        dateRangeFormat: `${new Date(data.today.dateRanges.current.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.today.dateRanges.current.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        

        
        grossRevenue: `$${data.today.summary.grossRevenue.current.toFixed(2)}`,
        expenses: `-$${data.today.summary.expenses.current.toFixed(2)}`,
        netProfit: `$${data.today.summary.netProfit.current.toFixed(2)}`,
        netPrevious:`$${data.today.summary.netProfit.previous.toFixed(2)}`,
       
        margin: `${data.today.summary.margin.current.toFixed(2)}%`,
        orders: data.today.summary.orders.current, // Order data not directly in this summary
        // Order data not directly in this summary
        unitsSold: data.today.summary.unitsSold.current,
        refunds: data.today.summary.refunds.current,
        
        previous: data.today.summary.grossRevenue.previous,
        // previous: data.today.summary.expenses.previous,
        revenueChange: `${data.today.summary.grossRevenue.delta >= 0 ? '+' : ''}$${data.today.summary.grossRevenue.delta.toFixed(2)}`,
        netProfitCalculation: data.today.netProfitCalculation,
      },
      {
        title: 'Yesterday',
        date: new Date(data.yesterday.dateRanges.current.from).toLocaleDateString(),
        dateRangePrev: `${new Date(data.yesterday.dateRanges.previous.from).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} - ${new Date(data.yesterday.dateRanges.previous.to).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, 

        dateRange: `${new Date(data.yesterday.dateRanges.current.from).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} - ${new Date(data.yesterday.dateRanges.current.to).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, 



        // Chagne date format

        dateRangePrevFormat: `${new Date(data.yesterday.dateRanges.previous.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.yesterday.dateRanges.previous.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        
        dateRangeFormat: `${new Date(data.yesterday.dateRanges.current.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.yesterday.dateRanges.current.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        
        
        grossRevenue: `$${data.yesterday.summary.grossRevenue.current.toFixed(2)}`,
        expenses: `-$${data.yesterday.summary.expenses.current.toFixed(2)}`,
        netProfit: `$${data.yesterday.summary.netProfit.current.toFixed(2)}`,
        netPrevious:`$${data.yesterday.summary.netProfit.previous.toFixed(2)}`,
      
        margin: `${data.yesterday.summary.margin.current.toFixed(2)}%`,
        orders: data.yesterday.summary.orders.current, // Order data not directly in this summary
        unitsSold: data.yesterday.summary.unitsSold.current,
        refunds: data.yesterday.summary.refunds.current,
      
        previous: data.yesterday.summary.grossRevenue.previous,
        revenueChange: `${data.yesterday.summary.grossRevenue.delta >= 0 ? '+' : ''}$${data.yesterday.summary.grossRevenue.delta.toFixed(2)}`,
        netProfitCalculation: data.yesterday.netProfitCalculation,
      },
    {
        title: 'Last 7 Days',
     
  dateRangePrev: `${formatterLong.format(new Date(data.last7Days.dateRanges.previous.from))} - ${formatterLong.format(new Date(data.last7Days.dateRanges.previous.to))}`,

  dateRange: `${formatterLong.format(new Date(data.last7Days.dateRanges.current.from))} - ${formatterLong.format(new Date(data.last7Days.dateRanges.current.to))}`,

  dateRangePrevFormat: `${formatterShort.format(new Date(data.last7Days.dateRanges.previous.from))} - ${formatterShort.format(new Date(data.last7Days.dateRanges.previous.to))}`,

  dateRangeFormat: `${formatterShort.format(new Date(data.last7Days.dateRanges.current.from))} - ${formatterShort.format(new Date(data.last7Days.dateRanges.current.to))}`,

        


        
        // Chagne date format

        dateRangePrevFormat: `${new Date(data.last7Days.dateRanges.previous.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.last7Days.dateRanges.previous.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        
        dateRangeFormat: `${new Date(data.last7Days.dateRanges.current.from).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })} - ${new Date(data.last7Days.dateRanges.current.to).toLocaleDateString('en-US', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        })}`,
        
        
        grossRevenue: `$${data.last7Days.summary.grossRevenue.current.toFixed(2)}`,
        expenses: `-$${data.last7Days.summary.expenses.current.toFixed(2)}`,
        netProfit: `$${data.last7Days.summary.netProfit.current.toFixed(2)}`,
        netPrevious:`$${data.last7Days.summary.netProfit.previous.toFixed(2)}`,
        
        margin: `${data.last7Days.summary.margin.current.toFixed(2)}%`,
        orders: data.last7Days.summary.orders.current, // Order data not directly in this summary
 // Order data not directly in this summary
        unitsSold: data.last7Days.summary.unitsSold.current,
        refunds: data.last7Days.summary.refunds.current,
     
        previous: data.last7Days.summary.grossRevenue.previous,
        revenueChange: `${data.last7Days.summary.grossRevenue.delta >= 0 ? '+' : ''}$${data.last7Days.summary.grossRevenue.delta.toFixed(2)}`,
        netProfitCalculation: data.last7Days.netProfitCalculation,
      },
    {
    title: 'Custom',

    // ✅ Long format with Today / Yesterday condition
    dateRange:
      widgetData === 'Today' || widgetData === 'Yesterday'
        ? formatterLong.format(new Date(data.custom.dateRanges.current.from))
        : `${formatterLong.format(new Date(data.custom.dateRanges.current.from))} - ${formatterLong.format(new Date(data.custom.dateRanges.current.to))}`,

    dateRangePrev: `${formatterLong.format(new Date(data.custom.dateRanges.previous.from))} - ${formatterLong.format(new Date(data.custom.dateRanges.previous.to))}`,

    // ✅ Short format
    dateRangeFormat: `${formatterShort.format(new Date(data.custom.dateRanges.current.from))} - ${formatterShort.format(new Date(data.custom.dateRanges.current.to))}`,
    dateRangePrevFormat: `${formatterShort.format(new Date(data.custom.dateRanges.previous.from))} - ${formatterShort.format(new Date(data.custom.dateRanges.previous.to))}`,

    // ✅ Metrics
    grossRevenue: `$${data.custom.summary.grossRevenue.current.toFixed(2)}`,
    expenses: `-$${data.custom.summary.expenses.current.toFixed(2)}`,
    netProfit: `$${data.custom.summary.netProfit.current.toFixed(2)}`,
    netPrevious: `$${data.custom.summary.netProfit.previous.toFixed(2)}`,
    margin: `${data.custom.summary.margin.current.toFixed(2)}%`,
    orders: data.custom.summary.orders.current,
    unitsSold: data.custom.summary.unitsSold.current,
    refunds: data.custom.summary.refunds.current,
    previous: data.custom.summary.grossRevenue.previous,
    revenueChange: `${data.custom.summary.grossRevenue.delta >= 0 ? '+' : ''}$${data.custom.summary.grossRevenue.delta.toFixed(2)}`,
    netProfitCalculation: data.custom.netProfitCalculation,
  }
    ];
  };

  const processedData = metricsData ? transformData(metricsData) : [];

  return (
    <Container maxWidth="xl" >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, width: '100%' }}>
              <DottedCircleLoading />
            </Box>
          ) : (
      <Grid container spacing={2}>
        {processedData.map((cardData, idx) => (
          <Grid item xs={12} sm={6} md={6} xl={3} key={idx}>
            <PerformanceCard {...cardData} />
          </Grid>
        ))}
      </Grid>
          )}
    </Container>
  );
};

export default MetricCard;