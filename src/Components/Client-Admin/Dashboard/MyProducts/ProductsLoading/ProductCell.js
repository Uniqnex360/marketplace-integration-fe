import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Tooltip,
    IconButton,
    Avatar,
    Chip,
    Tooltip as MuiTooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ParentModel from './ParentModel';

import soon from "../../../../assets/soon.png"; // Fallback image

const ProductCell = ({ image, title, id, asin,sku,skuCount, skuInfo, relatedAsins, onExpand, isExpanded, parentTab, imageSize,page,rowsPerPage }) => {
    const [isHovered, setIsHovered] = useState(false);
  const [tooltipText, setTooltipText] = useState('Copy SKU');
  const [isParentModelOpen, setIsParentModelOpen] = useState(false);

   useEffect(() => {
       console.log('jkk',parentTab)
    }, [parentTab]);



  const handleTitleClick = () => {
    
        console.log('parentTab', parentTab)
    if (parentTab === 'true') {
      setIsParentModelOpen(true);
    }
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
        setTooltipText('SKU Copied!');
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = asin;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setTooltipText('SKU Copied!');
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      setTooltipText('Failed to copy');
    }

    setTimeout(() => {
      setTooltipText('Copy SKU');
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

                <Avatar variant="square" src={image || soon} sx={{ width: 40, height:50, mr: 1 }} />

                <Box flexGrow={1}> {/* Make the text and chips take up available space */}

        <a
          href={`/Home/product-detail/${id}?page=${page}&&rowsPerPage=${rowsPerPage}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", width: '40px', height: '40px' }}
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
        </a>
   
                    {/* </Link>
                        */}
                    <Box display="flex" alignItems="center" flexWrap="wrap">
                        <img
                            src="https://re-cdn.helium10.com/container/static/Flag-united-states-ksqXwksC.svg"
                            alt="Country Flag"
                            width={27}
                            height={16}
                            style={{ marginRight: 6 }}
                        />

                        <Typography sx={{ fontSize: '14px', color: '#66788A', mr: 1 ,   fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
           }}>{sku}</Typography>

     <Tooltip title={tooltipText}>
                          <IconButton onClick={() => handleCopyAsin(sku)} size="small" >
                            <ContentCopyIcon sx={{ fontSize: '14px', color: '#757575' }} />
                          </IconButton>
                        </Tooltip>
                                     <IconButton
                                        size="small"
                                        sx={{ p: 0.5, }}
                                    >
                                     <MuiTooltip title={`Asin: ${asin}`} placement="top" arrow>
                           <InfoOutlinedIcon fontSize="inherit" sx={{ paddingLeft:'3px', height:'16px', width:'16px', marginTop:'5px'}} />  </MuiTooltip>
                                       </IconButton>
                              


 
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

                                <MuiTooltip title={`SKU: ${skuInfo.map(s => s.label).join(', ')}`} placement="top" arrow>
                                    <IconButton size="small" sx={{ p: 0.5 }}>
                                        • <InfoOutlinedIcon fontSize="inherit" sx={{ paddingLeft: '3px', height: '16px', width: '16px' }} />
                                    </IconButton>
                                </MuiTooltip>
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
                                 <a
                        href={`/Home/product-detail/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                    >
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
                                >
                                    Open
                                </Button>
                                </a>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ProductCell