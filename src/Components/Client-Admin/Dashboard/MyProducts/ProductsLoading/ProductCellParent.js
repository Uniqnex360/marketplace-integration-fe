import React, { useState } from 'react';
 import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,Chip, Button,Tooltip as MuiTooltip
 } from '@mui/material';
 import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
 import ContentCopyIcon from '@mui/icons-material/ContentCopy';
 import ParentModel from './ParentModel';
 import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import soon from "../../../../assets/soon.png"; // Fallback image

 const ProcutCellParent = ({ image, title, id, asin, sku, skuCount, skuInfo, relatedAsins, onExpand, isExpanded, imageSize,page ,rowsPerPage}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy Sku');
  const [isParentModelOpen, setIsParentModelOpen] = useState(false);

  const handleTitleClick = () => {
    setIsParentModelOpen(true);
  };

  const handleCloseParentModel = () => {
    setIsParentModelOpen(false);
  };
    const getImageDimensions = (size) => {
  switch (size) {
    case 'Small':
      return { width: 30, height: 40 };
    case 'Medium':
      return { width: 35, height: 55 };
    case 'Large':
      return { width: 55, height: 75 };
    case 'Extra Large':
      return { width: 70, height: 95 };
    default:
      return { width: 35, height: 55 };
  }
};
    const { width, height } = getImageDimensions(imageSize);

  const handleCopyAsin = async (asin) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(asin);
        setTooltipText('Sku Copied!');
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = asin;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setTooltipText('Sku Copied!');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      setTooltipText('Failed to copy');
    }

    setTimeout(() => {
      setTooltipText('Copy Sku');
    }, 1500);
  };
  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box display="flex" alignItems="center">
        <IconButton
          size="small"
          onClick={onExpand}
          sx={{ mr: 1, padding: '4px' }}
          aria-label="Expand/Collapse"
        >
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>

        <Avatar variant="square" src={image || soon}  sx={{ width: 40, height:50, mr: 1 }}/>

        <Box flexGrow={1}>
          <>
            <div
              onClick={handleTitleClick}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <CustomizeTooltip title={title}>
                <Typography
                  sx={{
                    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#0A6FE8',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </Typography>
              </CustomizeTooltip>
            </div>
            {isParentModelOpen && <ParentModel productId={id} onClose={handleCloseParentModel} page={page} rowsPerPage={rowsPerPage} />}
          </>

          <Box display="flex" alignItems="center" flexWrap="wrap">
            <img
              src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
              alt="Country Flag"
              width={27}
              height={16}
              style={{ marginRight: 6 }}
            />

            <Typography sx={{ fontSize: '14px', color: '#66788A', mr: 1, fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            }}>{sku}</Typography>

            <Tooltip title={tooltipText}>
              <IconButton onClick={() => handleCopyAsin(sku)} size="small" >
                <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
              </IconButton>
            </Tooltip>

              <MuiTooltip title={`Asin: ${asin}`} placement="top" arrow>
                                    <IconButton
                                        size="small"
                                        sx={{ p: 0.5 }}
                                    >
                                  
                                        <InfoOutlinedIcon fontSize="inherit" sx={{ paddingLeft:'3px', height:'16px', width:'16px', marginTop:'5px'}} />
                                       </IconButton>
                                </MuiTooltip>
<Chip
  label={skuCount}
  sx={{
    fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    fontSize: '12px',
    height: '20px',
    borderRadius: '12px',
    px: 1,
    mr: 0.5,
    color: '#485E75', // text color black
    backgroundColor: '#ffffff', // background white
    border: '1px solid #D1D9E6', // grey border
  }}
  variant="outlined"
/>
 
            {/* {skuInfo?.map((sku, index) => (
              <Chip
                key={index}
                label={sku.label}
                variant="outlined"
                size="small"
                sx={{
                  fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                  fontSize: '12px',
                  height: '20px',
                  borderRadius: '12px',
                  px: 1,
                  mr: 0.5,
                  color: '#485E75',
                  borderColor: '#D1D9E6',
                }}
                icon={
                  sku.warning ? (
                    <InfoOutlinedIcon color="warning" sx={{ fontSize: 14 }} />
                  ) : null
                }
              />
            ))}

            {relatedAsins && relatedAsins.length > 0 && (
              <>
                <Typography sx={{ fontSize: '12px', color: '#66788A', ml: 1 }}>
                  Related ASINs:
                </Typography>
                {relatedAsins.map((relatedAsin, index) => (
                  <Chip
                    key={index}
                    label={relatedAsin}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      console.log(`Clicked related ASIN: ${relatedAsin}`);
                    }}
                    sx={{
                      fontSize: '12px',
                      height: '20px',
                      borderRadius: '12px',
                      px: 1,
                      ml: 0.5,
                      color: '#0073bb',
                      borderColor: '#0073bb',
                      cursor: 'pointer',
                    }}
                  />

                  
                ))}
        
              </>
            )} */}

                        <Box
              sx={{
                ml: 1,
                visibility: isHovered ? 'visible' : 'hidden',
                transition: 'visibility 0.2s ease-in-out', // Optional smooth transition
              }}
            >
              <Tooltip title="Analyze Listing" arrow placement="top">
                
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontSize: '11px',
                      minHeight: '24px',
                      minWidth: '50px',
                      padding: '2px 8px',
                      lineHeight: 1,
                    }}
                    onClick={handleTitleClick}
                  >
                    Open
                  </Button>
                
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
 };

 export default ProcutCellParent;