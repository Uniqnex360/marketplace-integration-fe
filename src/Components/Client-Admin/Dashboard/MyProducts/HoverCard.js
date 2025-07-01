import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  Link,
  Rating,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlagIcon from "@mui/icons-material/Flag";

const HoverCard = ({ lqData }) => {
  const {
    asin,
    imageUrl,
    title,
    productUrl,
    totalScore,
    metricData = {}
  } = lqData || {};

  const handleCopyASIN = () => {
    navigator.clipboard.writeText(asin);
  };

  return (
    <Card elevation={3} sx={{ maxWidth: 1000, borderRadius: 2, padding: 1.5 }}>
      <CardContent>
        {/* Product Title */}
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>

        <Grid container spacing={2} mt={1}>
          {/* Column 1 - Image & ASIN */}
          <Grid item xs={12} md={4}>
            <img
              src={imageUrl}
              alt={title}
              style={{ width: "100%", maxWidth: 150, objectFit: "contain" }}
            />
            <Box display="flex" alignItems="center" mt={1}>
              <Typography variant="body2" color="text.secondary">
                {asin}
              </Typography>
              <Tooltip title="Copy ASIN">
                <IconButton size="small" sx={{ ml: 1 }} onClick={handleCopyASIN}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box mt={1}>
              <Link href="#" underline="hover" color="primary" mr={1}>
                Category 1
              </Link>
              <Link href="#" underline="hover" color="primary">
                Category 2
              </Link>
            </Box>
          </Grid>

          {/* Column 2 - Static Info */}
          <Grid item xs={12} md={4}>
            {[
              ["Fulfillment", "FBA"],
              ["Seller Count", "1"],
              ["Variations", "0"],
              ["Listing Age", "11 years 7 months"],
              ["Listing Images", metricData?.imagesQty?.passed ? "7+" : "Less than 7"],
            ].map(([label, value], idx) => (
              <Box key={idx} display="flex" justifyContent="space-between" mt={idx !== 0 ? 1 : 0}>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography>{value}</Typography>
              </Box>
            ))}
          </Grid>

          {/* Column 3 - More Info + Rating */}
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Brand</Typography>
              <Typography>Breathe Right</Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2" color="text.secondary">Seller</Typography>
              <Box display="flex" alignItems="center">
                <Link href="#" target="_blank" color="primary" underline="hover">
                  Walmart
                </Link>
                <FlagIcon sx={{ fontSize: 18, ml: 0.5 }} />
                <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Box>
            </Box>

            {[
              ["Monthly Unit Sales", "N/A"],
              ["Price", "$9.99"],
              ["FBA Fee", "$1.50"],
              ["Review Count", metricData?.reviewQty?.passed ? "20+" : "< 20"],
            ].map(([label, value], idx) => (
              <Box key={idx} display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography>{value}</Typography>
              </Box>
            ))}

            {/* Rating */}
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2" color="text.secondary">Rating</Typography>
              <Box display="flex" alignItems="center">
                <Rating
                  value={metricData?.reviewRating?.passed ? 4.0 : 3.5}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography ml={0.5} variant="body2">
                  ({metricData?.reviewRating?.passed ? "4.0+" : "< 4.0"})
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Row */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Switch checked />
            <Typography>Show Listing Detail</Typography>
          </Box>

          {productUrl ? (
            <Link href={productUrl} target="_blank" color="primary" underline="hover">
              Open on Amazon <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
            </Link>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Product URL not available
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoverCard;
