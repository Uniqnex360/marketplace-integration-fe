import React, { useState, useEffect,useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import OverviewTab from './OverviewTab/OverviewTab';
import ProfitAndLoss from '../../Dashboard/ProfitAndLoss/ProfitAndLoss';
import InventoryGraph from './OverviewTab/InventoryGraph';
import SalesProfitAndLoss from './OverviewTab/SalesProfitAndLoss';
import DateRangeForSales from './DateRangeForSales';

import { subDays } from 'date-fns';

import { format, parseISO, isSameDay } from 'date-fns';
import { enIN } from 'date-fns/locale';
import dayjs from 'dayjs';
import ProductInfoTab from './ProductInfoTab/ProductInfoTab';
import ProfitabilityView from './Profitability/Profitabilitytab';
import CustomizeTooltip from '../../CustomTooltip/CustomTooltip';
const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#485E75',
  fontFamily:
    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
}));

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

const SalesProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy ASIN');
  const [selectedTab, setSelectedTab] = useState(0); // Default to Overview tab
   let lastParamsRef = useRef(""); // Ref to store last API call parameters to prevent unnecessary fetches
   const [dateRangeText, setDateRangeText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('Last Month'); // Initialize with a default preset
    const [selectedStartDate, setSelectedStartDate] = useState(dayjs().subtract(6, 'day'));
    const [selectedEndDate, setSelectedEndDate] = useState(dayjs());
      const initialDate = () => {
        const today = new Date();
        const last7DaysStart = subDays(today, 6);
        return {
            startDate: last7DaysStart,
            endDate: today,
            text: `${format(last7DaysStart, 'MMM dd, yyyy', { locale: enIN })} - ${format(today, 'MMM dd, yyyy', { locale: enIN })}`,
            preset: 'Last Month'
        };
    };

 const [selectedDateRange, setSelectedDateRange] = useState(initialDate());

    const handleDateRangeChange = (newRange) => {
        console.log('welcome', newRange);

        setSelectedPreset(newRange.preset || null);
        setSelectedStartDate(newRange.startDate ? dayjs(newRange.startDate) : null);
        setSelectedEndDate(newRange.endDate ? dayjs(newRange.endDate) : null);
    };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);

  if (newValue === 1) {
    // Product Information tab
    setSelectedPreset('Last Month');
  } 
    // setSelectedPreset('Last Month')
  };

  const fetchProductData = async () => {
    if (hasFetched) return;
    setLoading(true);
    setError(null);
    setHasFetched(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData?.id || '';
      const response = await axios.get(
        `${process.env.REACT_APP_IP}productsDetailsPageSummary/`,
        {
          params: {
            product_id: id,
            user_id: userId,
          },
        }
      );
      setProductData(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('over',id)
                const currentParams = JSON.stringify({
id       });

        // Only fetch if parameters have actually changed
        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
            fetchProductData();       }
 
  }, [id]);

  const handleBack = () => {
    navigate(`/Home`);
  };

  const handleCopyAsin = async (asin) => {
    if (!asin) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(asin);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = asin;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setTooltipText('ASIN Copied!');
    } catch (err) {
      console.error('Clipboard copy failed', err);
      setTooltipText('Copy Failed');
    }

    setTimeout(() => {
      setTooltipText('Copy ASIN');
    }, 1500);
  };

  return (
    <Box sx={{ flexGrow: 1, marginTop: '5%', marginLeft: '-15px' }}>
      <AppBar position="static" color="none" elevation={0}>
        <Toolbar sx={{ paddingLeft: 1 }}>
          <IconButton edge="start" color="primary" aria-label="back" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, marginLeft: 1, fontSize: '14px', color: '#0A6FE8' }}
          >
            Back to Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
    <Box sx={{ padding: 2 }}>
  <Grid container alignItems="center" justifyContent="space-between">
    {/* Left Side: Image and Title Section */}
    <Grid item>
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid item>
          <img
            src={productData?.image_url}
            alt="Product"
            style={{ width: 60, height: 60 }}
          />
        </Grid>
        <Grid item>
           <CustomizeTooltip title={productData?.product_title}>  <StyledTypography
            fontWeight="bold"
            sx={{
              width: '700px',
              fontSize: '24px',
              color: '#121212',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {productData?.product_title}
          </StyledTypography>
          </CustomizeTooltip>
        </Grid>
      
        <Grid item sx={{marginLeft:'50px'}}><div>
  {selectedTab !== 1 && (

             <DateRangeForSales
        reflectDate={dateRangeText}
        onDateChange={handleDateRangeChange}
        initialDateRange={{
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate,
          text: selectedDateRange.text,
        }}
      />
)
}
</div>
        </Grid>
      </Grid>
    </Grid>

    {/* Right Side: Date Picker */}
    <Grid item>
             <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '20px' }}>
            <img
              src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
              alt="Country Flag"
              width={27}
              height={16}
              style={{ marginRight: 6 }}
            />
            <StyledTypography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
              {productData?.asin}
            </StyledTypography>
            <Tooltip title={tooltipText}>
              <IconButton onClick={() => handleCopyAsin(productData?.asin)} size="small">
                <ContentCopyIcon sx={{ fontSize: 'inherit', color: '#757575' }} />
              </IconButton>
            </Tooltip>
            <StyledTypography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              • {productData?.sku}
            </StyledTypography>
          </Box>
    </Grid>
  </Grid>
</Box>


      <Box >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            marginLeft:'13px',
            '& .MuiTabs-indicator': {
              backgroundColor: '#1A73E8',
            },
          }}
        >
          <Tab label="Overview" sx={commonTextStyle} />
          <Tab label="Product Information" sx={commonTextStyle} />
          <Tab label="Profitability" sx={commonTextStyle} />
        </Tabs>

{selectedTab === 0 && (
 <>
  <Box >
  <OverviewTab productId={id} widgetData={selectedPreset} startDate={selectedStartDate} endDate={selectedEndDate} />
</Box>
  {productData && (
    <Box sx={{width:'97%',marginLeft:'16px'}}>
      <SalesProfitAndLoss productId={id} widgetData={selectedPreset} startDate={selectedStartDate} endDate={selectedEndDate} />
    </Box>
  )}

  <Box sx={{width:'97%',marginLeft:'16px'}}>
    <InventoryGraph productId={id} widgetData={selectedPreset} startDate={selectedStartDate} endDate={selectedEndDate}/>
  </Box>
</>

)}


        {selectedTab === 1 && (
        <ProductInfoTab/>
        )}

        {selectedTab === 2 && (
       <ProfitabilityView productId={id} widgetData={selectedPreset} startDate={selectedStartDate} endDate={selectedEndDate}/>
        )}
      </Box>
    </Box>
  );
};

export default SalesProductDetailPage;