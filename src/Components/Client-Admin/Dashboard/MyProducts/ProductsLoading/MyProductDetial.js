import React, { useState, useEffect } from 'react';
import { useParams, useNavigate ,useLocation} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Rating,
  Tooltip, // Import Tooltip
  Snackbar, // Import Snackbar for copy confirmation
  Modal
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Import Copy Icon
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import SalesOverview from '../SalesOverview/SalesOverview'; // Assuming this component exists
import TrafficCard from '../SalesOverview/TrafficConversion';
import LQAnalysis from '../SalesOverview/ListingQuality';
import GrpahForOverview from '../SalesOverview/GraphForOverview';
import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#485E75',
  fontFamily:
    "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
}));

const StaticLineGraph = () => (
  <svg width="60" height="30" viewBox="0 0 60 30">
    <path
      d="M0 20 L5 15 L10 25 L15 20 L20 22 L25 18 L30 25 L35 20 L40 22 L45 18 L50 25 L55 20 L60 20"
      stroke="#1E88E5"
      strokeWidth="2"
      fill="none"
    />
  </svg>


);

const MyProductDetial = () => {
  
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceTrendData, setPriceTrendData] = useState([]);
  const [reviewTrendData, setReviewTrendData] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy ASIN');
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get('page') || 0;
  const rowsPerPageURL = queryParams.get('rowsPerPage');
  console.log("rowsPerPageURL:", rowsPerPageURL);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
      setPriceTrendData(response.data.data.price_history || []);
      setReviewTrendData(response.data.data.review_history || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleBack = () => {
    // navigate(`/Home`);
      navigate(`/Home?page=${currentPage}&&rowsPerPage=${rowsPerPageURL}`);
  };

  const handleCopyAsin = async (asin) => {
    if (!asin) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(asin);
      } else {
        // Fallback for HTTP or older browsers
        const textarea = document.createElement("textarea");
        textarea.value = asin;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
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


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const listingScore = productData?.listing_quality_score;
  const percentage = listingScore !== undefined ? (listingScore / 10) * 100 : 0;

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

          {/* <Button
                        variant="outlined"
                        startIcon={<FileDownloadOutlinedIcon />}
                        sx={{ marginRight: 1, fontSize: '14px', textTransform: 'capitalize' }}
                    >
                        Export Data
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryOutlinedIcon />}
                        sx={{ marginRight: 1, fontSize: '14px', textTransform: 'capitalize' }}
                    >
                        History
                    </Button> */}

        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid container direction="row" alignItems="center" spacing={2} sx={{ marginLeft: '3px' }}>
            <Grid item>
              <img
                src={productData?.image_url}
                alt="Product"
                style={{ width: 60, height: 60 }}
              />
            </Grid>
         <Grid item>
          <CustomizeTooltip title={productData?.product_title}>
  <StyledTypography
    fontWeight="bold"
    sx={{
      width: '950px',
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

          </Grid>

          <Grid item>

            <Box sx={{ display: 'flex', paddingLeft: '3px', alignItems: 'center' }}>
              <Box
                sx={{
                  backgroundColor: '#DFF5E1',
                  color: '#2E7D32',
                  borderRadius: '16px',
                  padding: '2px 10px',
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 500,
                  mr: 1,
                }}
              >
                My Product
              </Box>
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
    <IconButton onClick={() => handleCopyAsin(productData?.asin)} size="small" >
        <ContentCopyIcon sx={{ fontSize: 'inherit', color: '#757575' }} />
      </IconButton>
    </Tooltip>
              <StyledTypography variant="caption" color="textSecondary" sx={{ mr: 1 }}>

                • {productData?.sku}
              </StyledTypography>
              <Rating
                name="read-only"
                value={3.6}
                precision={0.1}
                readOnly
              />
              <StyledTypography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                {3.6}
              </StyledTypography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StyledTypography
                  variant="subtitle2"
                  sx={{ fontSize: '16px' }}
                  color="textSecondary"
                >
                  Listing Quality Score
                </StyledTypography>
                <Box sx={{ width: 56, height: 36, mx: 'auto' }}>
                  <CircularProgressbarWithChildren
                    value={percentage}
                    circleRatio={0.5}
                    styles={buildStyles({
                      rotation: 0.75,
                      strokeLinecap: 'round',
                      trailColor: '#f1f1f1',
                      pathColor:
                        percentage < 50
                          ? '#D32F2F' // red
                          : percentage < 80
                            ? '#FBC02D' // yellow
                            : '#388E3C', // green
                    })}
                  >
                    <div style={{ marginTop: -8 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color:
                            percentage < 50
                              ? '#D32F2F'
                              : percentage < 80
                                ? '#FBC02D'
                                : '#388E3C',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}
                      >
                        {listingScore}
                      </Typography>
                    </div>
                  </CircularProgressbarWithChildren>
                </Box>
              </CardContent>
            </Card>

          </Grid>
          <Grid item xs={2.4}>
            <Card >
              <CardContent sx={{ textAlign: 'center' }}>
                <StyledTypography variant="subtitle2" sx={{ fontSize: '16px' }} color="textSecondary">
                  Price
                </StyledTypography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                  <Box sx={{ width: 60, height: 40, cursor: 'pointer' }}
                    onClick={handleOpen}
                  >
                    <StaticLineGraph />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1, fontSize: '28px' }}>
                    ${productData?.price}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StyledTypography variant="subtitle2" sx={{ fontSize: '16px' }} color="textSecondary">
                  Stock
                </StyledTypography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                  {productData?.stock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontSize: '16px' }} color="textSecondary">
                  Review Count
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>

                  <Box sx={{ width: 60, height: 40, cursor: 'pointer' }}
                    onClick={handleOpen}
                  >
                    <StaticLineGraph />
                  </Box>

                  {/* Value on the right */}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1, fontSize: '28px' }}>
                    {productData?.review_count}
                  </Typography>
                </Box>
              </CardContent>

            </Card>
          </Grid>
          <Grid item xs={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <StyledTypography variant="subtitle2" sx={{ fontSize: '16px' }} color="textSecondary">
                  Age (months)
                </StyledTypography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '28px' }}>
                  {productData?.age}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, p: 3, boxShadow: 'none', width: '99%' }}>
          <SalesOverview />
        </Box>
        <Box sx={{ mt: 2, p: 3, boxShadow: 'none', width: '99%', }}>
          <TrafficCard newAsin={productData} />
        </Box>
        <Box sx={{ mt: 2, p: 3, boxShadow: 'none', width: '99%' }}>
          <LQAnalysis productId={id} />
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message="ASIN copied to clipboard!"
      />


      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="graph-popup-title"
        aria-describedby="graph-popup-description"
      >
        {/* <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          // border: '1px solid #000',
          boxShadow: 24,
          p: 4,
        }}> */}
        <GrpahForOverview onClose={handleClose} />
        {/* </Box> */}
      </Modal>


    </Box>


  );
};

export default MyProductDetial;