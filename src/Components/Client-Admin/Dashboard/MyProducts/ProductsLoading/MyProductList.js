import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Pagination,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  Tooltip as MuiTooltip,
  Tab,
  Tabs,
  Chip,
  Badge,
  Popover,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import MyProductTable from "./MyProductTable"; // Assuming MyProductTable is in the same directory or correctly imported
import SettingsIcon from "@mui/icons-material/Settings"; // or SettingsOutlined
import ProductExport from "./ProductExport"; // Assuming ProductExport is in the same directory or correctly imported
import FilterParentSku from "./FilterParentSku";
import DottedCircleLoading from "../../../../Loading/DotLoading";
import SkeletonTableMyProduct from "./MyProductLoading";
import Modal from "@mui/material/Modal"; // Correct Modal import

import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
// Define column sets for different views
const allColumns = [
  "Products",
  "Category & Subcategory BSR",
  "Stock",
  "Price",
  "Sales Today",
  "Refunds (Units)",
  "Refunds($)",
  "Gross Revenue",
  "Net Profit",
  "Refund Rate",
  "Units Sold",
  "Profit Margin",
  "Amazon Fees",
  // 'ROI', // Commented out as per original code
  "COGS",
  "Listings",
  "Fulfilment status",
];

const productPerformanceColumns = [
  "Products",
  "Gross Revenue",
  "Refund Rate",
  "Stock",
  "Sales Today",
  "Units Sold",
  "Refunds (Units)",
  "Refunds($)",
  "Net Profit",
  "Profit Margin",
  "Amazon Fees",
  // 'ROI', // Commented out as per original code
  "COGS",
  "Unit Session %",
];

const Keywords = ["Products", "Category & Subcategory BSR"];

const Listing = [
  "Products",
  "Category & Subcategory BSR",
  "Stock",
  // 'Price', // Price is handled dynamically based on Parent/SKU tab
  // 'Unit Sessions', // Commented out as per original code
];

const Advertising = [
  "Products",
  // Example advertising-related columns, adjust as per your actual data
  // 'Ad Spend',
  // 'Ad Impressions',
  // 'Ad Click',
  // 'Ad Rate',
  // 'ACoS',
  // 'RoAS',
  // 'Ads Total Sales',
  // 'TACoS'
];

const Refund = [
  "Products",
  "Profit Margin",
  "Units Sold",
  "Refunds(Units)",
  "Refunds($)",
  "Refund Rate",
];
const imageSizes = ["Small", "Medium", "Large", "Extra Large"];

const additionalInfo = ["ASIN Details"];

// Component for displaying a number with an optional change indicator
const NumberIndicator = ({ value, change }) => (
  <Box>
    <Typography
      sx={{
        fontSize: "14px",
        color: "#1A2027",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
    {change !== undefined && (
      <Box
        display="flex"
        alignItems="center"
        sx={{ color: change >= 0 ? "#1A9E77" : "#E34750", fontSize: "12px" }}
      >
        {change >= 0 ? <ArrowDropUp /> : <ArrowDropDown />}
        {Math.abs(change)}
      </Box>
    )}
  </Box>
);

const MyProductList = ({
  widgetData,
  marketPlaceId,
  brand_id,
  product_id,
  manufacturer_name,
  fulfillment_channel,
  DateStartDate,
  DateEndDate,
}) => {
  const navigate = useNavigate();

  const location = useLocation();
  const [selectedImageSize, setSelectedImageSize] = useState("Medium");
  const [selectedColumns, setSelectedColumns] = useState([
    ...allColumns,
    ...additionalInfo,
  ]);
  const [selectAll, setSelectAll] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || "";
  const [visibleColumns, setVisibleColumns] = useState(allColumns); // Initialize with all columns
  const [activeColumnCategoryTab, setActiveColumnCategoryTab] = useState(0); // For "All Columns", "Product Performance" etc.
  const [tab, setTab] = React.useState(0); // 0 for Parent, 1 for SKU
  const [expandedRows, setExpandedRows] = useState({}); // State for expanded rows in the table (if applicable)
  const queryParams = new URLSearchParams(window.location.search);
  localStorage.removeItem("selectedCategory"); // Clear a specific localStorage item

  const [searchQuery, setSearchQuery] = useState("");
  const initialPage = parseInt(queryParams.get("page"), 10) || 1;
  const [loadingTime, setLoadingTime] = useState(0);
  const loadingIntervalRef = useRef(null);
  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, []);
  const startLoadingTimer = () => {
    setLoadingTime(0);
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }
    loadingIntervalRef.current = setInterval(() => {
      setLoadingTime((prev) => prev + 1);
    }, 1000);
  };
  const stopLoadingTimer = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };
  const [page, setPage] = useState(initialPage); // Current page for pagination
  const [showSearch, setShowSearch] = useState(false); // State to toggle search input visibility
  let lastParamsRef = useRef(""); // Ref to store last API call parameters to prevent unnecessary fetches
  const controllerRef = useRef(null);

  const [rowsPerPage, setRowsPerPage] = useState(10); // Number of rows to display per page
  const [sortValues, setSortValues] = useState({
    sortBy: null,
    sortByValue: null,
  }); // State for sorting

  const [TabType, setTabType] = useState(); // To store the tab type received from backend

  const [filterParent, setFilterParent] = useState(); // To store the tab type received from backend

  const [filterSku, setFilterSku] = useState(); // To store the tab type received from backend

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterParentFilter, setfilterParentFilter] = useState("");
  const [asinFilter, setAsinFilter] = useState("");

  // These states hold the *input values* in the popover's text fields
  const [parentAsin, setParentAsin] = useState("");
  const [skuAsin, setSkuAsin] = useState("");
  const [isCustomizedPage, setIsCustomizedPage] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const initialRowsPerPage = parseInt(queryParams.get("rowsPerPage"), 10) || 50; // Default to 50 if no rowsPerPage param exists

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setIsFilterOpen(false); // Ensure isFilterOpen is false when popover closes
  };

  useEffect(() => {
    // Handle undefined/null values safely using optional chaining or fallback to ''
    const currentParentTrimmed = (parentAsin || "").trim();
    const currentSkuTrimmed = (skuAsin || "").trim();
    const appliedParentTrimmed = (filterParent || "").trim();
    const appliedSkuTrimmed = (filterSku || "").trim();

    if (TabType === "sku") {
      setHasChanges(
        currentParentTrimmed !== appliedParentTrimmed ||
          currentSkuTrimmed !== appliedSkuTrimmed
      );
    } else {
      setHasChanges(currentParentTrimmed !== appliedParentTrimmed);
    }
  }, [parentAsin, skuAsin, TabType, filterParent, filterSku]);

  const handleClear = () => {
    setParentAsin(""); // Clear input field for parent SKU
    setSkuAsin(""); // Clear input field for SKU
    // Note: This 'Clear' button inside the popover only clears the input fields,
    // not the actively applied filters. The user must click "Apply Filters"
    // after clearing inputs for the change to take effect on the data.
  };

  const closeCustomModal = () => {
    setIsCustomizedPage(false);
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns([
        ...getColumnSet(activeColumnCategoryTab, tab === 0),
        ...additionalInfo,
      ]);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (column) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const handleFilterClick = (event) => {
    // When opening the filter popover, pre-fill text fields with current applied filters
    setParentAsin(filterParent);
    setSkuAsin(filterSku);
    setAnchorEl(event.currentTarget);
    setIsFilterOpen(true);
    setPage(1);
    setRowsPerPage(10);
  };

  const handleCustomizedPage = (event, value) => {
    setIsCustomizedPage(true);
  };

  /**
   * Handles applying filters, either from the popover or from clearing chips.
   * @param {object} [newFilterValues] - Optional. An object containing {parentAsin, skuAsin} if called from a chip.
   * If not provided, it uses the current state of parentAsin and skuAsin.
   * @param {boolean} [closePopover=true] - Optional. Whether to close the popover after applying filters.
   * Defaults to true, set to false for chip deletions.
   */
  const handleApplyFilter = (newFilterValues = {}, closePopover = true) => {
    // Determine the parent and SKU values to apply
    const finalParentAsin =
      newFilterValues.parentAsin !== undefined
        ? newFilterValues.parentAsin
        : parentAsin;

    const finalSkuAsin =
      newFilterValues.skuAsin !== undefined ? newFilterValues.skuAsin : skuAsin;

    // Apply trimming
    setFilterParent(finalParentAsin.trim());
    setFilterSku(finalSkuAsin.trim());

    // Update localStorage
    localStorage.setItem("filterParent", finalParentAsin.trim());
    localStorage.setItem("filterSku", finalSkuAsin.trim());

    // Close popover if specified
    if (closePopover) {
      handlePopoverClose();
    }

    console.log("Applied Filters:", {
      parentAsin: finalParentAsin.trim(),
      skuAsin: finalSkuAsin.trim(),
    });
    // You would typically trigger your data fetching here based on the new filters
    // For example: fetchData(finalParentAsin.trim(), finalSkuAsin.trim());
  };

  const getFilterCount = () => {
    let count = 0;
    if (filterParent?.trim()) count++;
    if (filterSku?.trim()) count++;
    return count;
  };

  const handleClearFilter = () => {
    // This function clears ALL applied filters and resets input fields.
    setFilterParent("");
    setFilterSku("");
    setParentAsin("");
    setSkuAsin("");
    localStorage.removeItem("filterParent");
    localStorage.removeItem("filterSku");
  };

  // Handler for search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      // Only reset page to 1 if there's a search query
      setPage(1);
      setRowsPerPage(10);
    }
  };

  // Handler for column category tabs (All Columns, Product Performance, etc.)
  const handleColumnCategoryClick = (index) => {
    setActiveColumnCategoryTab(index);
    console.log("Column category changed to:", index);
    // This will trigger the useEffect below to update visibleColumns
  };

  // Handler for changing rows per page
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    navigate(`/Home?page=${page}&&rowsPerPage=${e.target.value}`);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  // Function to determine the set of columns based on category and Parent/SKU tab
  const getColumnSet = (columnCategoryIndex, isParentTab) => {
    let columns;
    switch (columnCategoryIndex) {
      case 0: // All Columns
        columns = [...allColumns];
        break;
      case 1: // Product Performance
        columns = [...productPerformanceColumns];
        break;
      case 2: // Keywords
        columns = [...Keywords];
        break;
      case 3: // Listing
        columns = [...Listing];
        break;
      case 4: // Advertising
        columns = [...Advertising];
        break;
      case 5: // Refunds
        columns = [...Refund];
        break;
      default:
        columns = [...allColumns];
    }

    let finalColumns = [...columns];

    // Handle 'Price' column title and visibility based on Parent/SKU tab
    if (isParentTab) {
      // If it's the Parent tab
      // Remove 'Price' if it exists and add 'Price' back if it's in allColumns
      // The original logic here was a bit convoluted. Simplifying:
      // If it's Parent tab, 'Price' should be present if it's part of the base column set.
      // If it's SKU tab, 'Price' should always be present.
      // The original logic had 'Price' removed and then re-added based on 'allColumns'
      // and 'stockIndex'. Let's ensure 'Price' is handled correctly.
      if (finalColumns.includes("Price")) {
        finalColumns = finalColumns.filter((col) => col !== "Price");
      }
      // Add 'Price' if it's relevant for parent (e.g., if it was in allColumns)
      // For parent, it's usually a price range.
      if (allColumns.includes("Price") && !finalColumns.includes("Price")) {
        const stockIndex = finalColumns.indexOf("Stock");
        if (stockIndex !== -1) {
          finalColumns.splice(stockIndex + 1, 0, "Price");
        } else {
          finalColumns.push("Price");
        }
      }
    } else {
      // If it's the SKU tab
      // For SKU, 'Price' should always be present if not already.
      if (!finalColumns.includes("Price")) {
        const stockIndex = finalColumns.indexOf("Stock");
        if (stockIndex !== -1) {
          finalColumns.splice(stockIndex + 1, 0, "Price");
        } else {
          finalColumns.push("Price");
        }
      }
    }

    //   let finalColumns = [...columns];

    // Remove 'Price' if it's parent tab
    if (isParentTab) {
      finalColumns = finalColumns.filter((col) => col !== "Price");
    }

    // Handle Listings, Fulfilment status, current price Range
    if (columnCategoryIndex === 0 || columnCategoryIndex === 3) {
      if (isParentTab) {
        // Parent tab: show only 'current price Range', remove others
        if (!finalColumns.includes("current price Range")) {
          finalColumns.push("current price Range");
        }
        finalColumns = finalColumns.filter(
          (col) => !["ListingScore", "Fulfilment status"].includes(col)
        );
      } else {
        // SKU tab: show Listings and Fulfilment, remove current price Range
        if (!finalColumns.includes("Listings")) {
          finalColumns.push("Listings");
        }
        if (!finalColumns.includes("Fulfilment status")) {
          finalColumns.push("Fulfilment status");
        }
        finalColumns = finalColumns.filter(
          (col) => col !== "current price Range"
        );
      }
    } else {
      // Other tabs: remove all 3
      finalColumns = finalColumns.filter(
        (col) =>
          ![
            "ListingScore",
            "Fulfilment status",
            "current price Range",
          ].includes(col)
      );
    }

    return finalColumns;
  };

  // Handler for sort changes from the MyProductTable component
  const handleSortChange = (sortInfo) => {
    console.log("Sort info received in parent:", sortInfo);
    setSortValues(sortInfo);
  };

  // This handles the Parent/SKU tab change
  const handleChangeParentSkuTab = (event, newValue) => {
    setTab(newValue);
    setPage(1); // Reset page on tab change
    setRowsPerPage(10);
    if (newValue === 0) {
      console.log("anywhere ", newValue);
      setFilterSku("");
    }
    // Set the active column category to "All Columns" (index 0) when switching Parent/SKU tabs
    setActiveColumnCategoryTab(0);
  };

  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  // This useEffect handles column visibility based on the activeColumnCategoryTab and the main tab (parent/SKU)
  useEffect(() => {
    const columns = getColumnSet(activeColumnCategoryTab, tab === 0);
    setVisibleColumns(columns);
    setSelectedColumns(columns);
  }, [activeColumnCategoryTab, tab, filterParent, filterSku]);

  useEffect(() => {
    setVisibleColumns(selectedColumns);
  }, [selectedColumns]);
  // This useEffect triggers data fetching when relevant parameters change
  useEffect(() => {
    const currentParams = JSON.stringify({
      marketPlaceId,
      widgetData,
      rowsPerPage,
      searchQuery,
      brand_id,
      product_id,
      manufacturer_name,
      fulfillment_channel,
      DateStartDate,
      DateEndDate,
      tab,
      activeColumnCategoryTab,
      sortValues,
      filterParent,
      filterSku,
    });

    // Only fetch if parameters have actually changed
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchMyProducts(1); // Always start from page 1 when filters/sort/tabs change
    }
  }, [
    marketPlaceId,
    widgetData,
    rowsPerPage,
    searchQuery,
    brand_id,
    JSON.stringify(product_id),
    manufacturer_name,
    fulfillment_channel,
    DateStartDate,
    DateEndDate,
    tab,
    activeColumnCategoryTab,
    sortValues,
    filterParent,
    filterSku,
  ]);

  const fetchMyProducts = async (currentPage) => {
    setLoading(true);
    startLoadingTimer();
    try {
      const calculatedPageForBackend = (currentPage - 1) * rowsPerPage + 1;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      // Create new controller
      controllerRef.current = new AbortController();
      const response = await axios.post(
        `${process.env.REACT_APP_IP}get_products_with_pagination/`,
        {
          parent: tab === 0, // This determines if it's Parent or SKU
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          user_id: userId,
          search_query: searchQuery,
          page: calculatedPageForBackend, // Use the calculated page value here
          page_size: rowsPerPage,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
          start_date: DateStartDate,
          end_date: DateEndDate,
          sort_by: sortValues.sortBy,
          sort_by_value: sortValues.sortByValue,
          parent_search: filterParent ? filterParent : "",
          sku_search: filterSku ? filterSku : "",
          signal: controllerRef.current.signal,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );

      const responseData = response.data;
      if (responseData && responseData.products) {
        const normalizedProducts = responseData.products.map((product) => {
          setTabType(response.data.tab_type); // Set tab type from response
          return {
            ...product,
            // Normalize various product data fields, providing 'N/A' if undefined
            grossRevenue:
              product.grossRevenue !== undefined ? product.grossRevenue : "N/A",
            grossRevenueforPeriod:
              product.grossRevenueforPeriod !== undefined
                ? product.grossRevenueforPeriod
                : "N/A",
            netProfit:
              product.netProfit !== undefined ? product.netProfit : "N/A",
            netProfitforPeriod:
              product.netProfitforPeriod !== undefined
                ? product.netProfitforPeriod
                : "N/A",
            subcategoriesBsr:
              product.category !== undefined ? product.category : "N/A",
            reviewRating:
              product.reviewRating !== undefined ? product.reviewRating : "N/A",
            priceDraft: product.price !== undefined ? product.price : "N/A",
            refunds: product.refunds !== undefined ? product.refunds : "N/A",
            refundsforPeriod:
              product.refundsforPeriod !== undefined
                ? product.refundsforPeriod
                : "N/A",
            refundsAmount:
              product.refundsAmount !== undefined
                ? product.refundsAmount
                : "N/A",
            refundsAmountforPeriod:
              product.refundsAmountforPeriod !== undefined
                ? product.refundsAmountforPeriod
                : "N/A",
            pageViews:
              product.pageViews !== undefined ? product.pageViews : "N/A",
            pageViewsPercentage:
              product.pageViewsPercentage !== undefined
                ? product.pageViewsPercentage
                : "N/A",
            trafficSessions:
              product.trafficSessions !== undefined
                ? product.trafficSessions
                : "N/A",
            conversionRate:
              product.conversionRate !== undefined
                ? product.conversionRate
                : "N/A",
            margin: product.margin !== undefined ? product.margin : "N/A",
            marginforPeriod:
              product.marginforPeriod !== undefined
                ? product.marginforPeriod
                : "N/A",
            totalAmazonFees:
              product.totalchannelFees !== undefined
                ? product.totalchannelFees
                : "N/A",
            roi: product.roi !== undefined ? product.roi : "N/A",
            cogs: product.cogs !== undefined ? product.cogs : "N/A",
            buyBoxWinnerId:
              product.buyBoxWinnerId !== undefined
                ? product.buyBoxWinnerId
                : "N/A",
            salesForToday:
              product.salesForToday !== undefined
                ? product.salesForToday
                : "N/A",
            salesForTodayPeriod:
              product.salesForTodayPeriod !== undefined
                ? product.salesForTodayPeriod
                : "N/A",
            unitsSoldForPeriod:
              product.unitsSoldForPeriod !== undefined
                ? product.unitsSoldForPeriod
                : "N/A",
            unitsSoldForToday:
              product.unitsSoldForToday !== undefined
                ? product.unitsSoldForToday
                : "N/A",
            inventoryStatus:
              product.inventoryStatus !== undefined
                ? product.inventoryStatus
                : "N/A",
            tags: product.tags !== undefined ? product.tags : [],
            refundRate:
              product.refundRate !== undefined ? product.refundRate : "0",
            imageUrl: product.imageUrl,
            title: product.title,
            asin: product?.product_id,
            sku: product?.parent_sku,
            stock: product.stock,
            price: product.price,
            price_start: product.price_start,
            price_end: product.price_end,
            totalStock: product.totalStock,
            skuInfo: product.skus
              ? product.skus.map((sku) => ({
                  label: sku.sku,
                  warning: sku.isLowStock,
                }))
              : [],
            listings: product.listings,
            listingScore: product.listingScore,
            fulfillmentChannel: product.fulfillmentChannel,
            fulfillmentStatus: product.fulfillmentStatus,
            currentPriceRange: product.currentPriceRange,
          };
        });
        setProducts(normalizedProducts);
        setTotalProducts(responseData.total_products);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
      stopLoadingTimer();
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: "1px solid #ccc",
        width: "98%",
        padding: "4px",
      }}
    >
      {/* My Products Title and Tabs */}

      <Box
        display="flex"
        sx={{ borderBottom: "1px solid #ddd", padding: "4px" }}
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontFamily:
              "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
            fontWeight: 600,
            fontSize: "20px",
            color: "#1A2027",
          }}
        >
          My Products
        </Typography>
        <Box
          sx={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#dce3ec",
            borderRadius: "20px",
            px: "4px",
            py: "2px",
            marginLeft: "10px",
            width: "fit-content",
            mb: 1.5,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChangeParentSkuTab} // Use the new handler here
            variant="standard"
            sx={{
              height: "28px",
              minHeight: "26px",
              "& .MuiTabs-flexContainer": {
                minHeight: "26px",
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            {["Parent", "SKU"].map((label, index) => (
              <Tab
                key={label}
                label={
                  <Typography
                    fontSize="14px"
                    sx={{
                      height: "20px",
                      fontFamily:
                        "'Nunito Sans', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                    }}
                    fontWeight={tab === index ? 600 : 400}
                  >
                    {label}
                  </Typography>
                }
                sx={{
                  marginTop: "2px",
                  minHeight: "22px",
                  height: "22px",
                  minWidth: "50px",
                  px: 1,
                  mx: 0.3,
                  textTransform: "none",
                  borderRadius: "14px",
                  fontSize: "12px",
                  color: "#2b2f3c",
                  backgroundColor: tab === index ? "#ffffff" : "transparent",
                  "&.Mui-selected": {
                    color: "#000",
                  },
                  "&:hover": {
                    backgroundColor: tab === index ? "#ffffff" : "#cbd8e6",
                  },
                  "&:active": {
                    backgroundColor: "#b4c9df",
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{
              fontSize: "16px",
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              color: "#485E75",
            }}
          >
            {totalProducts} {TabType === "sku" ? "SKUs" : "Parent ASINs"}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {/* Filter Button */}

            <Badge
              badgeContent={getFilterCount()}
              color="primary"
              invisible={getFilterCount() === 0}
            >
              <Button
                variant="outlined"
                startIcon={<FilterAltIcon />}
                onClick={handleFilterClick} // open filter popover
                sx={{
                  backgroundColor: "rgba(10,111,232,0.1)",
                  color: "rgb(10, 111, 232)",
                  fontWeight: 700,
                  borderRadius: "12px",
                  padding: "4px 12px",
                  textTransform: "capitalize",
                  fontSize: "14px",
                }}
              >
                Filter
              </Button>
            </Badge>

            {/* Filter Popover */}

            {/* Filter Popover */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              <Box p={2} display="flex" flexDirection="column" gap={1}>
                <TextField
                  label="Parent SKU"
                  size="small"
                  fullWidth
                  value={parentAsin}
                  onChange={(e) => setParentAsin(e.target.value)}
                />

                {TabType === "sku" && (
                  <TextField
                    label="Child SKU"
                    size="small"
                    fullWidth
                    value={skuAsin}
                    onChange={(e) => setSkuAsin(e.target.value)}
                  />
                )}

                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClear}
                    sx={{
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      textTransform: "capitalize",
                      color: hasChanges
                        ? "rgb(10, 111, 232)"
                        : "rgba(0, 0, 0, 0.26)",
                      borderColor: hasChanges
                        ? "rgb(10, 111, 232)"
                        : "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        borderColor: hasChanges
                          ? "rgb(2, 83, 182)"
                          : "rgba(0, 0, 0, 0.12)",
                        color: hasChanges
                          ? "rgb(2, 83, 182)"
                          : "rgba(0, 0, 0, 0.26)",
                      },
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      handleApplyFilter({ parentAsin, skuAsin }, true)
                    } // Pass true to close popover
                    disabled={!hasChanges}
                    sx={{
                      fontFamily:
                        "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                      fontSize: "14px",
                      textTransform: "capitalize",
                      color: "white",
                      backgroundColor: hasChanges
                        ? "rgb(10, 111, 232)"
                        : "rgba(0, 0, 0, 0.12)",
                      "&:hover": {
                        backgroundColor: hasChanges
                          ? "rgb(2, 83, 182)"
                          : "rgba(0, 0, 0, 0.12)",
                        color: "white",
                      },
                    }}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Box>
            </Popover>
            {/* <FilterParentSku
          open={isFilterOpen}
          anchorEl={anchorEl}
          onClose={handleFilterClose}
          onApply={handleApplyFilter}
          isParentType={TabType}
        /> */}
          </Box>
          <Box sx={{ marginLeft: "5px" }}>
            {!showSearch ? (
              <IconButton onClick={() => setShowSearch(true)} sx={{ p: 0.5 }}>
                <SearchIcon sx={{ color: "#485E75" }} />
              </IconButton>
            ) : (
              <TextField
                value={searchQuery}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                placeholder="Search..."
                autoFocus
                sx={{
                  width: 190,
                  "& .MuiInputBase-root": {
                    height: 32, // ✅ sets the input box height
                    fontSize: "13px",
                  },
                  "& input": {
                    padding: "6px 8px", // ✅ optional fine-tuning
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        onClick={() => setShowSearch(false)}
                        size="small"
                        sx={{ p: 0.5 }}
                      >
                        <SearchIcon
                          sx={{ color: "#485E75", fontSize: "18px" }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Box>
        </Box>

        {/* Column Tabs */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <Button
            variant={activeColumnCategoryTab === 0 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 0 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 0 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 0 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(0)}
          >
            All Columns
          </Button>
          <Button
            variant={activeColumnCategoryTab === 1 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 1 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 1 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 1 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(1)}
          >
            Product Performance
          </Button>
          <Button
            variant={activeColumnCategoryTab === 2 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 2 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 2 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 2 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(2)}
          >
            Keywords
          </Button>
          <Button
            variant={activeColumnCategoryTab === 3 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 3 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 3 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 3 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(3)}
          >
            Listing
          </Button>
          <Button
            variant={activeColumnCategoryTab === 4 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 4 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 4 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 4 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(4)}
          >
            Advertising
          </Button>
          <Button
            variant={activeColumnCategoryTab === 5 ? "contained" : "outlined"}
            size="small"
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              mr: 0.5,
              color: activeColumnCategoryTab === 5 ? "#fff" : "#485E75",
              backgroundColor:
                activeColumnCategoryTab === 5 ? "#19232E" : "transparent",
              border:
                activeColumnCategoryTab === 5 ? "none" : `1px solid #D3D3D3`,
              borderRadius: "8px",
            }}
            onClick={() => handleColumnCategoryClick(5)}
          >
            Refunds
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            sx={{
              fontFamily:
                "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",

              textTransform: "none",
              fontSize: "12px",
              color: "#485E75",
              borderRadius: "8px",
            }}
            onClick={() => {
              handleCustomizedPage();
            }}
          >
            Customize
          </Button>
          {/* {isCustomizedPage && (
                          <CustomizedProd
                              open={isCustomizedPage}
                              onClose={() => setIsCustomizedPage(false)}
                          />
                      )} */}
          {!showSearch && (
            <Box>
              <ProductExport products={products} />
            </Box>
          )}
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        sx={{ paddingBottom: "5px", gap: 1 }}
      >
        {/* Left - Filter Chips */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ marginTop: "7px" }}>
          {filterParent && (
            <Chip
              label={`Parent SKU: ${filterParent}`}
              onDelete={() =>
                handleApplyFilter({ parentAsin: "", skuAsin: filterSku }, false)
              } // Pass false to prevent closing popover
              deleteIcon={<CloseIcon sx={{ color: "#fff" }} />}
              size="small"
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "12px",
                backgroundColor: "#000",
                color: "#fff",
                ".MuiChip-deleteIcon": { color: "#fff" },
              }}
            />
          )}

          {filterSku && (
            <Chip
              label={`Child SKU: ${filterSku}`}
              onDelete={() =>
                handleApplyFilter(
                  { parentAsin: filterParent, skuAsin: "" },
                  false
                )
              } // Pass false to prevent closing popover
              deleteIcon={<CloseIcon sx={{ color: "#fff" }} />}
              size="small"
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                fontSize: "12px",
                backgroundColor: "#000",
                color: "#fff",
                ".MuiChip-deleteIcon": { color: "#fff" },
              }}
            />
          )}

          {(filterParent || filterSku) && (
            <Button
              size="small"
              onClick={handleClearFilter}
              sx={{
                fontFamily:
                  "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                textTransform: "none",
                fontSize: "14px",
                color: "rgb(10, 111, 232)",
                borderRadius: "8px",
                fontWeight: 700,
                "&:hover": {
                  color: "rgb(15, 93, 188)",
                },
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        {/* Right - Export Button */}
        {showSearch && <ProductExport products={products} />}
      </Box>

      <Box sx={{ minHeight: 200 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              width: "100%",
              gap: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "4px",
              p: 3,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Loading spinner */}
            <Box sx={{ mb: 2 }}>
              <DottedCircleLoading size={40} />
            </Box>

            {/* Main loading message */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: "#1A2027",
                mb: 1,
              }}
            >
              Fetching Data, Please wait a moment...
            </Typography>

          </Box>
        ) : (
          <MyProductTable
            products={products}
            visibleColumns={visibleColumns}
            onSort={handleSortChange}
            isParentType={TabType}
            imageSize={selectedImageSize}
          />
        )}
      </Box>

      {/* Pagination */}
      <Box
        display="flex"
        alignItems="center"
        mt={2}
        sx={{ borderTop: "1px solid #eee", pt: 1 }}
      >
        {/* Centered Pagination */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={Math.ceil(totalProducts / rowsPerPage)}
            page={page}
            onChange={(event, newPage) => {
              setPage(newPage);
              navigate(`/Home?page=${newPage}&&rowsPerPage=${rowsPerPage}`);
              fetchMyProducts(newPage); // Pass the MUI pagination's newPage value
            }}
            size="small"
            color="primary"
          />
        </Box>

        {/* Right-aligned Rows Per Page Select */}
        <Select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          size="small"
          sx={{ minWidth: 100, ml: "auto" }}
        >
          <MenuItem value={10}>10 / page</MenuItem>
          <MenuItem value={25}>25 / page</MenuItem>
          <MenuItem value={50}>50 / page</MenuItem>
        </Select>
      </Box>
    </Box>
  );
};

export default MyProductList;
