import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Tooltip,IconButton, Snackbar,Tooltip as MuiTooltip,Avatar,Popover
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/system';
import axios from 'axios'; // Import axios
import { useParams } from "react-router-dom";

import LinearProgress from '@mui/material/LinearProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ProductHoverCard from '../HoverCard';
import HoverCard from '../HoverCard';
import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
    fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    fontSize: '18px',
    fontWeight: 600,
    color: '#1E293B',
    marginBottom: theme.spacing(2),
}));

const StyledListItem = styled(Box)(({ theme }) => ({
    fontSize: '16px',
    color: '#485E75',
    fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const StyledText = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    color: '#485E75',
    fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledCheckIcon = styled(CheckIcon)(({ theme }) => ({
    color: 'rgb(41, 166, 124)', // Dark green color for the tick
    backgroundColor: 'rgb(214, 245, 235)', // Light green background
    borderRadius: '50%',
    padding: '2px',
    fontSize: '16px',
}));

const StyledCloseIcon = styled(CloseIcon)(({ theme }) => ({
    color: '#485E75', // Dark red color for the close icon
    backgroundColor: 'rgb(242, 245, 247)', // Light red background
    borderRadius: '50%',
    padding: '2px',
    fontSize: '16px',
}));


const ProductInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const ProductImage = styled('img')({
  maxWidth: '40px',
  maxHeight: '40px',
  objectFit: 'contain',
  borderRadius: '4px',
});



const LQAnalysis = () => {
    const { id } = useParams();
    const [lqData, setLqData] = useState(null);
      const [copied, setCopied] = useState(false);
const [isHovered, setIsHovered] = useState(false);



    const [valueAsin, setAsinImage] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState('B01LXYDELP'); // Default product ID
    const productIds = ['B01LXYDELP', 'B07W4R999F', 'B082W9D88W']; // Example product IDs
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsHovered(true);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setIsHovered(false);
  };

 
  const open = Boolean(anchorEl);
      const handleCopy = () => {
    navigator.clipboard.writeText(lqData?.asin || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
  };

    const fetchListingQuality = async (productId) => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = userData?.id || '';
            const response = await axios.get(
                `${process.env.REACT_APP_IP}productsListingQualityScore/`, // Use environment variable
                {
                    params: {
                        product_id: id,
                        user_id: userId,
                    }
                }
            );
            if (response.data && response.data.data) {
                setLqData(response.data.data);
                setAsinImage(response.data.data)    
                    } else {
                setError("No data found for the selected product.");
                setLqData(null);
            }

        } catch (err) {
            setError(err.message || 'Failed to fetch data');
            setLqData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListingQuality(selectedProductId);
    }, [selectedProductId]); // Fetch data when selectedProductId changes

    const handleProductChange = (productId) => {
        setSelectedProductId(productId);
    };

    function ListingQualityCard() {
  const lqData = {
    totalScore: lqData.totalScore,
    imageUrl: lqData.imageUrl, // Replace with the actual image URL
    title: lqData.title,
    asin: lqData.asin,
    productUrl: lqData.productUrl, // Replace with the actual product URL
  };
}

    return (
        <Box   border="1px solid #E5E7EB" marginLeft={-3} 
      borderRadius={2}>
        <StyledCard>
            <CardContent>
       <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} >
  <Typography
    variant="h6"
    fontWeight={600}
    display="flex"
    alignItems="center"
    gap={1}
    sx={{
      fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    }}
  >
    Listing Quality Score (LQS) Analysis


     <MuiTooltip
    title={
      <>
   Listing Quality Score (LQS) is an analysis of this product's copy, media and reviews
      </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon fontSize="small"
      sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height:'16px' , width:'16px' ,color: '#485E75' }}
    />
  </MuiTooltip>

  </Typography>

  {/* ASIN + Image Box */}
  <Box
    display="flex"
    alignItems="center"
    gap={1}
    px={1.5}
    py={0.8}
    sx={{
      backgroundColor: '#E2E8F0',
      borderRadius: '8px',
    }}
  >
    <Box
      component="img"
      src={valueAsin.imageUrl}
      alt="Product"
      sx={{ width: 26, height: 26, borderRadius: '4px' }}
    />
    <Typography fontWeight={600} fontSize="16px" sx={{fontWeight:400,  color:'#485E75', fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
}}>
      {valueAsin.asin}
    </Typography>
    <ArrowDropDownIcon sx={{ color: '#4A5568' }} />
  </Box>
</Box>

                {loading && <Typography>Loading...</Typography>}
                {error && <Typography color="error">{error}</Typography>}
<Grid container>
<Grid item xs={12} sm={6} md={3} lg={2.5} sx={{ maxWidth: '240px', }}>
  <StyledCard elevation={3} sx={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', height: '250px' }}>
    <CardContent sx={{ padding: (theme) => theme.spacing(2) }}>
      <Typography variant="h6" fontWeight="bold" sx={{ fontSize:'14px',   fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
 mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 ,color: '#485E75'}}>
          Listing Quality Score
           <MuiTooltip
    title={
      <>
     Score is calculated based on the number of
criteria passed
      </>
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#485E75',
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon
    
      sx={{ ml: 1, mt: 0.5, cursor: 'pointer', height:'14px',width:'14px', color: '#485E75' }}
    />
  </MuiTooltip>
        </Typography>
     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
  <Typography
    variant="h4"
    sx={{
      fontSize: '24px',
      color: '#485E75',
      fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
      fontWeight: 'bold',
    }}
  >
    {lqData?.totalScore}
  </Typography>
  <Typography
    variant="subtitle1"
    sx={{
      color: '#485E75',
      fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    }}
  >
    /10
  </Typography>
</Box>

        <LinearProgress
          variant="determinate"
          value={(lqData?.totalScore / 10) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        <Typography variant="body2" color="textSecondary" sx={{ color:'#485E75', fontFamily:
        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", mb: 1, 
 }}>
          {lqData?.totalScore >= 7
            ? 'Product follows most Amazon best practices'
            : 'Product does not follow Amazon best practices'}
        </Typography>
        <Box sx={{borderTop:'solid 1px #ddd'}}>
        <ProductInfo>
   <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
       <Box
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
      sx={{ position: 'relative', display: 'inline-block', marginRight: 2 }} // Added marginRight for spacing
    >
      {lqData?.imageUrl && (
        <img
          src={lqData.imageUrl}
          alt={lqData.title}
          style={{
            width: 40,
            height: 40,
            marginTop: '10px',
            cursor: 'pointer',
            borderRadius: 1,
          }}
        />
      )}
      {/* <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom', // Display below the image
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            maxWidth: 480, // Adjusted maxWidth to match ListingDetailCard width
          },
        }}
      >
        {lqData && <HoverCard lqData={lqData} />}
      </Popover> */}
    </Box>
      <Box display="flex" flexDirection="column" sx={{ marginTop: '8px', flexGrow: 1 }}>
        <CustomizeTooltip title={lqData?.title}>
      <Typography
      
  variant="subtitle2"
  fontWeight="bold"
  noWrap
  sx={{
    fontFamily:
      "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
  }}
>
  {lqData?.title?.length > 20
    ? `${lqData.title.substring(0, 20)}...`
    : lqData?.title}
{/* 
  <MuiTooltip
    title={
      lqData?.title?.length > 20
        ? lqData.title
        : ''
    }
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          color: '#fff',
          backgroundColor: '#1A2E42',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon
      fontSize="small"
      sx={{
        ml: 1,
        mt: 0.5,
        cursor: 'pointer',
        height: '14px',
        width: '14px',
        color: '#485E75',
      }}
    />
  </MuiTooltip> */}
</Typography>
</CustomizeTooltip>
        <Box display="flex" alignItems="center">
          <Typography variant="caption" color="textSecondary" sx={{
            color: '#485E75',
            fontFamily:
              "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
          }}>
            {lqData?.asin}
          </Typography>

          <Tooltip title={copied ? "ASIN copied" : "Copy ASIN"}>
            <IconButton
              size="small"
              onClick={handleCopy}
              sx={{ ml: 1, padding: '2px' }}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
        </ProductInfo>
        </Box>
      </CardContent>
    </StyledCard>
 
            </Grid>
  <Grid item xs={12} md={9} sx={{paddingLeft:'20px'}}>

                {lqData && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <StyledCardTitle>Copy Breakdown <span style={{ color: '#485E75', fontWeight: 400 }}>({valueAsin.asin})</span></StyledCardTitle>
                            {Object.values(lqData.metricData).slice(0, 7).map((item, index) => ( // First 7 are copy
                                <StyledListItem key={index}>
                                    <StyledText>{item.metricTitle}
                                        {/* <Tooltip title={item.metricTooltip} sx={{color:'#ffff', fontSize:'14px'}} placement="bottom-start">
                                            <InfoOutlinedIcon sx={{ fontSize: 'small', height:'25px', weight:'25px', color: '#121212' }} />
                                        </Tooltip> */}


         <MuiTooltip
title={item.metricTooltip}
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon sx={{ height:'14px', weight:'16px', color: '#485E75' }} />
                      
  </MuiTooltip>


                                    </StyledText>
                                    {item.passed ? <StyledCheckIcon /> : <StyledCloseIcon />}
                                </StyledListItem>
                            ))}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <StyledCardTitle>Media Breakdown  <span style={{ color: '#485E75', fontWeight: 400 }}>({valueAsin.asin})</span>
)</StyledCardTitle>
                            {Object.values(lqData.metricData).slice(7, 11).map((item, index) => ( // Next 4 are media
                                <StyledListItem key={index}>
                                    <StyledText>{item.metricTitle}
                                       

                                         <MuiTooltip
title={item.metricTooltip}
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon sx={{  height:'14px', weight:'14px', color: '#485E75' }} />
                      
  </MuiTooltip>
                                    </StyledText>
                                    {item.passed ? <StyledCheckIcon /> : <StyledCloseIcon />}
                                </StyledListItem>
                            ))}
                    <StyledCardTitle sx={{ mt: 3 }}>
  Review Breakdown <span style={{ color: '#485E75', fontWeight: 400 }}>({valueAsin.asin})</span>
</StyledCardTitle>
                            {Object.values(lqData.metricData).slice(11).map((item, index) => ( // Last 2 are review
                                <StyledListItem key={index}>
                                    <StyledText>{item.metricTitle}
                                                                         <MuiTooltip
title={item.metricTooltip}
    placement="top"
    arrow
    slotProps={{
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    }}
    componentsProps={{
      tooltip: {
        sx: {
          backgroundColor: '#1A2E42',
          color: '#fff',
          fontSize: '13px',
          borderRadius: '6px',
          fontFamily: "'Nunito Sans', sans-serif",
          maxWidth: 280,
          whiteSpace: 'normal',
          lineHeight: 1.5,
        },
      },
    }}
  >
    <InfoOutlinedIcon sx={{  height:'14px', weight:'14px', color: '#485E75' }} />
                      
  </MuiTooltip>
                                    </StyledText>
                                    {item.passed ? <StyledCheckIcon /> : <StyledCloseIcon />}
                                </StyledListItem>
                            ))}
                        </Grid>
                    </Grid>
                )}
                      </Grid>
                      </Grid>
            </CardContent>
        </StyledCard>
  
        </Box>
    );
};

export default LQAnalysis;
