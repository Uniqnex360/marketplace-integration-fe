import React, { useState, useEffect,useRef, useCallback    } from "react";
import { Box, Grid, Typography, Button, Paper,  Tabs,Tab, Tooltip,Select, TextField, MenuItem, FormControl, InputLabel, CircularProgress, ListItemIcon,ListItemText,Menu,Collapse, Autocomplete,  ListSubheader,  Checkbox, Chip
} from "@mui/material";
import axios from "axios";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AppsIcon from "@mui/icons-material/Apps";
import ImageIcon from '@mui/icons-material/Image';
import DottedCircleLoading from '../../Loading/DotLoading';
import CardCount from './CardCount';
import CardComponent from '../Dashboard/CardComponet';
import ProductTableDashboard from './ProductTableDashboard';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import debounce from 'lodash/debounce';

// Correct import
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import IconButton from '@mui/material/IconButton';

import { DatePicker,LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { Refresh } from "@mui/icons-material";
import RevenueGraph from "./RevenueGraph";
import TotalOrdersGraph from "./TotalSalesGraph";
import LastOrders from "./LastOrder/LastOrders";
import TopProducts from "../Dashboard/TopProducts/TopProducts";
import HeliumCard from "./Helium10/HeliumCard";
import InsightCategory from "./Helium10/InsightCategory";
import PeriodComparission from "./PeriodCompare/PeriodComparission";
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';

import { BarChart, EmojiEvents, RocketLaunch, ShoppingCart } from '@mui/icons-material';
import TestCard from "./Helium10/TestCard";
import MetricCard from "./CardComparission/MetricCard";
import SalesIncreasing from "../Sales/SalesIncreasing";
import SalesDecreasing from "../Sales/SalesDecreasing";
import AllMarketplace from "./AllMarketplace/AllMarketplace";
import ProfitAndLoss from "./ProfitAndLoss/ProfitAndLoss";
import MyProductList from "./MyProducts/ProductsLoading/MyProductList";
import TestRevenue from "./Revenue/TestRevenue";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { set } from "date-fns";
import CompareChart from "./Revenue/DataChangeRevenue";

function ClientDashboardpage() {
  const [selectedCategory, setSelectedCategory] = useState({ id: "all", name: "All Channels" });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);
  const [filter, setFilter] = useState("all"); // Default filter state
  const [filterFinal, setFilterFinal] = useState({ id: "all", name: "All Channels" });
  const [isFiltering, setIsFiltering] = useState(false); // State to check if filter is applied
  const userData = localStorage.getItem("user");
  const [tab, setTab] = React.useState(0);
  const [compare, setCompare] = React.useState('Compare to past');
  const [events, setEvents] = React.useState(true);
  const [startDateHelium, setStartDateHelium] = useState(dayjs().subtract(7, 'day'));
  const [endDateHelium, setEndDateHelium] = useState(dayjs());
  localStorage.removeItem('selectedCategory');
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [manufacturerList, setManufacturerList] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState([]);
    const [selectedManufacturerFilter, setSelectedManufacturerFilter] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [selectedSku, setSelectedSku] = useState([]);
  const [asinList, setAsinList] = useState([]);
  const [selectedAsin, setSelectedAsin] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
    const [selectedBrandFilter, setSelectedBrandFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [brandLimit, setBrandLimit] = useState(1); // start with 11
  const [skuLimit, setSkuLimit] = useState(1); // start with 11
 const [befePreset, setBefePreset] = useState('Today');
  const [inputValueManufactuer, setInputValueManufactuer] = useState("");
  const [inputValueSku, setInputValueSku] = useState("");
  const [inputValueBrand, setInputValueBrand] = useState("");
  const [inputValueAsin, setInputValueAsin] = useState("");
  const [selectedFulfillment, setselectFulfillment] = useState("");
  const brand_id = selectedBrand.map(item => item.id);
  const [mergedProducts, setMergedProducts] = useState([]);
    const [mergedProductsFilter, setMergedProductsFilter] = useState([]);

  let productuniqueById = [];
  const [isTyping, setIsTyping] = useState(false);
   const lastFilterParamsRef = useRef("");
    const lastInputRef = useRef("");
    const lastCategoryIdRef = useRef(null);
    const lastParamsRef = useRef("");

  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

    const presets = [
    'Today', 'Yesterday', 'This Week', 'Last Week',
    'Last 7 days', 'Last 14 days', 'Last 30 days',
    'Last 60 days', 'Last 90 days', 'This Month',
    'Last Month', 'This Quarter', 'Last Quarter',
    'This Year', 'Last Year'
  ];

  // const [value, setValue] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  // const handleChange = (newValue) => {
  //   setValue(newValue);
  //   if (onChange) {
  //     onChange(newValue);
  //   }
  // };

  const handleStartDateChangeHelium = (newDate) => {
    setStartDateHelium(newDate);
  };

  const handleEndDateChangeHelium = (newDate) => {
    setEndDateHelium(newDate);
  };

  const [value, setValue] = useState([dayjs().subtract(6, 'day'), dayjs()]);
  const [selectedPreset, setSelectedPreset] = useState('Today');

  const [brandListPage, setBrandListPage] = React.useState(1); // Initialize page to 1
    const [hasMore, setHasMore] = React.useState(true); // Track if there are more items to load

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const handlePresetSelectHelium = (preset) => {
    setSelectedPreset(preset)
    localStorage.removeItem("selectedStartDate");
localStorage.removeItem("selectedEndDate");

    const today = dayjs();
    let start, end;
  console.log('oppo',selectedPreset)
  // setPresetValue(preset)
    switch (preset) {
      case 'Today':
        start = today;
        end = today;
        break;
      case 'Yesterday':
        start = today.subtract(1, 'day');
        end = today.subtract(1, 'day');
        break;
      case 'This Week':
        start = today.startOf('week');
        end = today.endOf('week');
        break;
      case 'Last Week':
        start = today.subtract(1, 'week').startOf('week');
        end = today.subtract(1, 'week').endOf('week');
        break;
      case 'Last 7 days':
        start = today.subtract(6, 'day');
        end = today;
        break;
      case 'Last 14 days':
        start = today.subtract(13, 'day');
        end = today;
        break;
      case 'Last 30 days':
        start = today.subtract(29, 'day');
        end = today;
        break;
      case 'Last 60 days':
        start = today.subtract(59, 'day');
        end = today;
        break;
      case 'Last 90 days':
        start = today.subtract(89, 'day');
        end = today;
        break;
      case 'This Month':
        start = today.startOf('month');
        end = today.endOf('month');
        break;
      case 'Last Month':
        start = today.subtract(1, 'month').startOf('month');
        end = today.subtract(1, 'month').endOf('month');
        break;
      case 'This Quarter':
        start = today.startOf('quarter');
        end = today.endOf('quarter');
        break;
      case 'Last Quarter':
        start = today.subtract(1, 'quarter').startOf('quarter');
        end = today.subtract(1, 'quarter').endOf('quarter');
        break;
      case 'This Year':
        start = today.startOf('year');
        end = today.endOf('year');
        break;
      case 'Last Year':
        start = today.subtract(1, 'year').startOf('year');
        end = today.subtract(1, 'year').endOf('year');
        break;
      case '':
        return;
      default:
        return;
    }
  
    setStartDateHelium(start);
    setEndDateHelium(end);
  };
  useEffect(() => {
   
  if (startDate || endDate) {
    setBefePreset('');
    setSelectedPreset('');
  }
}, [startDate, endDate]);

// If befePreset is set, clear startDate and endDate
useEffect(() => {
  if (befePreset || selectedPreset) {
    setStartDate(null);
    setEndDate(null);
  }
}, [befePreset, selectedPreset]);

  // Fetch marketplace list (Categories)
  useEffect(() => {
    fetchMarketplaceList();
  }, []);
  
       const fetchMarketplaceList = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}getMarketplaceList/?user_id=${userIds}`
        );

        const categoryData = response.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.image_url,
          fulfillment_channel: item.fulfillment_channel,
        }));

        setCategories([
          { id: "all", name: "All Channels", icon: <AppsIcon fontSize="small" sx={{ height: '13px', textTransform:'capitalize' }} /> },
          { id: "custom", name: "Custom", icon: <ShoppingCartIcon fontSize="small" sx={{ height: '13px' }} /> },
          ...categoryData,
        ]);
        setSelectedCategory({ id: "all", name: "All Channels" });
        console.log('verA', selectedCategory);
 
      } catch (error) {
        console.error("Error fetching marketplace list:", error);
      } finally {
        setIsLoading(false);
      }
    };

  const fetchAsinList = async (search = "") => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getproductIdlist/`, // <-- replace with your real endpoint
        {
            marketplace_id: selectedCategory?.id,
            search_query: search,
            user_id: userIds,
            brand_id,
            manufacturer_name:selectedManufacturer,
          },
      );
      const items = response.data.data || [];
      setAsinList(items);
    } catch (error) {
      console.error("Error fetching ASIN list:", error);
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
        const trimmedInput = inputValueAsin.trim();
        const currentFilterParams = JSON.stringify({
            category_id: selectedCategory?.id,
            brand: selectedBrand,
            manufacturer: selectedManufacturer,
        });

        let debounceTimer;

        // Handle debounced input value
        if (trimmedInput !== lastInputRef.current) {
            debounceTimer = setTimeout(() => {
                lastInputRef.current = trimmedInput;
                fetchAsinList(trimmedInput);
            }, 300);
        }

        // Handle filter param changes
        if (
            (selectedCategory?.id || selectedBrand || selectedManufacturer) &&
            currentFilterParams !== lastFilterParamsRef.current
        ) {
            lastFilterParamsRef.current = currentFilterParams;
            fetchAsinList(""); // Send blank input to indicate filter-based fetch
        }

        return () => clearTimeout(debounceTimer);

    }, [selectedCategory, selectedBrand, selectedManufacturer, inputValueAsin]);

const fetchManufacturerList = async (searchText) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainManufactureNames/`,
        {
          params: {
            marketplace_id: selectedCategory?.id,
            user_id: userIds,
            search_query: searchText, // pass this if your API supports search
          },
        }
      );
      const names = response.data.manufacturer_name_list || [];
      setManufacturerList(names);
    } catch (error) {
      console.error("Error fetching manufacturer list:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValueManufactuer.trim() === "") {
        fetchManufacturerList(""); // show all if empty
      } else {
        fetchManufacturerList(inputValueManufactuer);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValueManufactuer]);


   useEffect(() => {
    fetchBrandList();
  }, [brandLimit, selectedCategory?.id, userIds]);
  
  const debouncedFetchBrandList = useCallback(
    debounce((search) => {
      setBrandLimit(11); // Reset limit on new search
      fetchBrandList(search);
    }, 300),
    []
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValueBrand.trim() === "") {
        fetchBrandList("");
      } else {
        debouncedFetchBrandList(inputValueBrand);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValueBrand, debouncedFetchBrandList]);


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValueBrand.trim() === "") {
        fetchBrandList("");
      } else {
        debouncedFetchBrandList(inputValueBrand);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValueBrand, debouncedFetchBrandList]);


  const fetchBrandList = async (search = "") => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getBrandListforfilter/`,
        {
          params: {
            marketplace_id: selectedCategory?.id,
            search_query: search,
            user_id: userIds,
            limit: brandLimit,
          },
        }
      );
      const names = response.data.data.brand_list || [];
      setBrandList(names);
      setHasMore(names.length >= brandLimit);
    } catch (error) {
      console.error("Error fetching brand list:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };



  // Fetch all on category change or initial load
     useEffect(() => {
        const currentCategoryId = selectedCategory?.id;

        // Only call if category ID exists and has changed
        if (currentCategoryId && currentCategoryId !== lastCategoryIdRef.current) {
            lastCategoryIdRef.current = currentCategoryId;
            fetchBrandList("");
            fetchManufacturerList("");
        }
    }, [selectedCategory]);

  // Debounced API call on search input
   useEffect(() => {
    if (inputValueBrand.trim()) {
      setIsTyping(true);
      const delay = setTimeout(() => {
        fetchBrandList(inputValueBrand.trim());
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setIsTyping(false);
    }
  }, [inputValueBrand]);

    const fetchSkuList = async (searchText = "") => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getSKUlist/`, // Update with your actual endpoint
        {
            marketplace_id: selectedCategory?.id,
            search_query: searchText,
            user_id: userIds,
            brand_id,
            manufacturer_name:selectedManufacturer,
        }
      );
        const names = response.data.data || [];        
      setSkuList(names);
    } catch (error) {
      console.error("Error fetching SKU list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
        const currentParams = JSON.stringify({
            category_id: selectedCategory?.id,
            brand: selectedBrand,
            manufacturer: selectedManufacturer,
            sku: selectedSku,
        });

        if (
            (selectedCategory?.id || selectedBrand || selectedManufacturer) &&
            currentParams !== lastParamsRef.current
        ) {
            lastParamsRef.current = currentParams;
            fetchSkuList("");
        }
    }, [selectedCategory, selectedBrand, selectedManufacturer, selectedSku]);

  // Fetch SKUs based on input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (inputValueSku.trim() === "") {
        fetchSkuList("");
      } else {
        fetchSkuList(inputValueSku);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [inputValueSku]);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setExpandedCategories({});
  };

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategorySelect = (category) => {
  if (category.id === 'all' || category.id === 'custom') {
    setSelectedCategory(category);
    handleMenuClose();
  } else if (!category.fulfillment_channel) {
    setSelectedCategory(category);
    handleMenuClose();
  } else {
    setSelectedCategory(category); // Set category but don't open subitems
        handleMenuClose();
  }
};

const handleFulfillmentSelect = (category, fulfillment) => {
  const { label, value } = fulfillment;
  setselectFulfillment(value);
  setSelectedCategory({ ...category, fulfillment: label });
  handleMenuClose();
};

    const toggleSelection = (option) => {
    if (selectedBrand.some((b) => b.id === option.id)) {
      setSelectedBrand(selectedBrand.filter((b) => b.id !== option.id));
    } else {
      setSelectedBrand([...selectedBrand, option]);
    }
  };

  //  const toggleSelection = (brand) => {
  //   const alreadySelected = selectedBrand.find((b) => b.id === brand.id);
  //   if (alreadySelected) {
  //     handleRemove(brand.id);
  //   } else {
  //     setSelectedBrand([...selectedBrand, brand]);
  //   }
  // };
  const handleRemoveSKU = (id) => {
  setSelectedSku((prev) => {
    const updated = prev.filter((sku) => sku.id !== id);
    updateMergedProducts(selectedAsin, updated);
    return updated;
  });
};

  const toggleSelectionSKU = (sku) => {
    const alreadySelected = selectedSku.find((s) => s.id === sku.id);
    if (alreadySelected) {
      handleRemoveSKU(sku.id);
    } else {
setSelectedSku((prev) => {
    const alreadySelected = prev.find((s) => s.id === sku.id);
    const updated = alreadySelected
      ? prev.filter((s) => s.id !== sku.id)
      : [...prev, sku];

    updateMergedProducts(selectedAsin, updated); // pass updated sku list
    return updated;
  });    }
  };
  const handleRemoveAsin = (id) => {
  setSelectedAsin((prev) => {
    const updated = prev.filter((asin) => asin.id !== id);
    updateMergedProducts(updated, selectedSku);
    return updated;
  });
};

  const toggleSelectionAsin = (asin) => {
    const alreadySelected = selectedAsin.find((a) => a.id === asin.id);
    if (alreadySelected) {
      handleRemoveAsin(asin.id);
    } else {
     setSelectedAsin((prev) => {
    const alreadySelected = prev.find((a) => a.id === asin.id);
    const updated = alreadySelected
      ? prev.filter((a) => a.id !== asin.id)
      : [...prev, asin];

    updateMergedProducts(updated, selectedSku); // pass updated asin list
    return updated;
  });
    }
  };

   const handleToggleManufacturer = (manufacturer) => {
    const isSelected = selectedManufacturer.includes(manufacturer);
    if (isSelected) {
      setSelectedManufacturer((prev) =>
        prev.filter((item) => item !== manufacturer)
      );
    } else {
      setSelectedManufacturer((prev) => [...prev, manufacturer]);
    }
  };

const updateMergedProducts = (asinList, skuList) => {
  const merged = [...skuList, ...asinList];
  const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
  productuniqueById = uniqueById.map(item => item.id);
    setMergedProducts(productuniqueById);

};
 useEffect(() => {    
   console.log(mergedProducts, 'mergedProducts');
   console.log(selectedFulfillment, 'selectedFulfillment');
   
  }, [mergedProducts, selectedFulfillment]);
  const handleCategoryChange = (event) => {
    const selectedName = event.target.value;
    const selectedCategoryObject = categories.find(
      (category) => category.name === selectedName
    );

    if (selectedCategoryObject) {
      setSelectedCategory(selectedCategoryObject);
      // console.log('selectedCategory', selectedCategory.id);
    }
  };

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    if (endDate && newValue > endDate) {
      setEndDate(null); // If start date is greater than end date, reset end date
    }
  };

  // Handle End Date change
  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
  };


  // const handleStartDateChange = (newValue) => {
  //   setStartDate(newValue);
  //   if (endDate && newValue > endDate) {
  //     setEndDate(null); // If start date is greater than end date, reset end date
  //   }
  // };

  // const handleEndDateChange = (newValue) => {
  //   setEndDate(newValue);
  // };

  const handleApplyFilter = () => {
    setBefePreset(selectedPreset)
    console.log('index',befePreset)
    // Check if selectedCategory exists (to apply filter without date)
    if (selectedCategory) {
      // Apply filter using only selectedCategory if both dates are missing or valid
      setSelectedManufacturerFilter(selectedManufacturer);
      setMergedProductsFilter(mergedProducts);
      setSelectedBrandFilter(brand_id);
      if (!startDate || !endDate) {
        setFilter(selectedCategory); // Apply filter using selectedCategory
        setFilterFinal(selectedCategory); // Set selectedCategory in filterFinal
        setIsFiltering(true); // Mark filter as applied
  
        toast.success("Filter applied successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        return;
      }
    }
  
    // If both dates are selected
if (startDate && endDate) {
  console.log('Raw:', startDate, endDate);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formattedStartDate = start.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
  const formattedEndDate = end.toLocaleDateString('en-CA');

  console.log('Formatted:', formattedStartDate, formattedEndDate);

  setAppliedStartDate(formattedStartDate);
  setAppliedEndDate(formattedEndDate);
  console.log('Applied end date:', formattedEndDate);

  setFilter(selectedCategory);
  setFilterFinal(selectedCategory);
  setIsFiltering(true);
      // Toaster success message
      toast.success("Filter applied successfully with selected category and dates!", {
        position: "top-right",
        autoClose: 3000, // 3 seconds close
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
  
    } else if (startDate && !endDate) {
      // If only startDate is provided and endDate is missing, show error
      toast.error("Please select both start and end dates.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  const handleClearFilter = () => {
    // Previous state values
    const prevFilterFinal = filterFinal;
    const prevSelectedCategory = selectedCategory;
    const prevFilter = filter;
    const prevStartDate = startDate;
    const prevEndDate = endDate;
    const prevAppliedStartDate = appliedStartDate;
    const prevAppliedEndDate = appliedEndDate;
    const prevIsFiltering = isFiltering;
  
    // Reset values
    setFilterFinal({ id: "all", name: "All Channels" });
    setSelectedCategory({ id: "all", name: "All Channels" });
    setFilter("all"); 
    setSelectedBrand([]);
    setSelectedManufacturer([]);
    setSelectedSku([]);
    setSelectedAsin([]);
    setselectFulfillment("");
    setInputValueBrand("");
    setInputValueManufactuer("");
    setInputValueSku("");
    setInputValueAsin("");
    setSearchQuery("");
    setMergedProducts([]);
    setAsinList([]);
    setSkuList([]);
    setBrandList([]);
    setManufacturerList([]);
    setSelectedPreset('Today');
    setBefePreset('Today');
    setStartDate(null);
    setEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setIsFiltering(false);
  
    // Check if any value was changed
    const isChanged =
      prevFilterFinal.id !== "all" ||
      prevSelectedCategory.id !== "all" ||
      prevFilter !== "all" ||
      prevStartDate !== null ||
      prevEndDate !== null ||
      prevAppliedStartDate !== null ||
      prevAppliedEndDate !== null ||
      prevIsFiltering !== false;
  
    // Show toast only if something was changed
    if (isChanged) {
      setTimeout(() => {
        toast.success("Reset Successfully", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 0);
    }
  };
  
  return (
    <Box sx={{ marginTop: '5%'}}>
<Grid container spacing={2} className="stickyGrid" sx={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'white' }}>

      <Grid item xs={12} >
  <Box  
  sx={{
    width: '100%',
  
    // borderBottom:'solid 1px #ddd',
    backgroundColor:'#ffff',
    height: '9%',
    marginLeft: '-8px',
    marginTop: '5%',
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column', // To stack items vertically
    top: 0,
    zIndex: 1100,
    backgroundColor: '#fff',
    paddingY: 1,
  }}
>
  <Grid container spacing={2} className="dashboard-filter">
  <Grid 
    item 
    xs={12} // Full width on all devices
    className="category-select-container"
    sx={{ 
      paddingBottom:'10px',
      backgroundColor:'#ffff',
      display: "flex", 
      justifyContent: "flex-start", 
      alignItems: "center", 
      px: 2, // Optional padding for spacing
    }}
  >

    
    <Box sx={{ fontSize: "32px",   fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",fontWeight: 500,padding:'0px 20.5% 0px 11px' }}>
      Welcome
    </Box>

 
 <Box sx={{ position: "relative", paddingRight: '7.25%', width: "110px" }}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={[...selectedBrand, ...brandList.filter(b => !selectedBrand.some(sb => sb.id === b.id))]}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        inputValue={inputValueBrand}
        onInputChange={(event, newInputValue) => {
          setInputValueBrand(newInputValue);
          setBrandLimit(11);
        }}
        value={selectedBrand}
        onChange={(event, newValue) => {
          setSelectedBrand(newValue);
        }}
        renderTags={() => null}
        noOptionsText={inputValueBrand ? "No options" : ""}
        renderOption={(props, option) => {
          const isSelected = selectedBrand.some((b) => b.id === option.id);
          return (
            <Box
              component="li"
              {...props}
              onClick={() => toggleSelection(option)}
                sx={{
        backgroundColor: isSelected ? "#b6d5f3 !important" : "transparent", // Slightly darker blue
        fontSize: 13,
        cursor: "pointer",
      }}
              key={option.id}
            >
              {option.name}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Brands"
            size="small"
            placeholder="Search brands..."
            InputProps={{
              ...params.InputProps,
              endAdornment: <>{params.InputProps.endAdornment}</>,
            }}
          />
        )}
        PopperComponent={(props) => (
          <Box
            {...props}
            sx={{
              zIndex: 1300,
              width: 220,
              bgcolor: 'white',
              boxShadow: 3,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 300,
              position: 'absolute',
            }}
            onScroll={(event) => {
              const { scrollTop, scrollHeight, clientHeight } = event.target;
              if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && hasMore) {
                setBrandLimit((prev) => prev + 10);
              }
            }}
          >
            {/* {selectedBrand.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  gap: 1,
                  px: 1,
                  pt: 1,
                }}
              >
                {selectedBrand.map((brand) => (
                  <Chip
                    key={brand.id}
                    label={brand.name}
                    size="small"
                    onDelete={() => handleRemove(brand.id)}
                    sx={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      '.MuiChip-deleteIcon': {
                        color: '#fff',
                      },
                    }}
                  />
                ))}
              </Box>
            )} */}
            {props.children}
            {/* {isLoading && <div style={{ padding: 8 }}>Loading more brands...</div>} */}
          </Box>
        )}
        sx={{
          '& .MuiInputBase-root': {
            height: 40,
            fontSize: 14,
            width: 190,
          },
          '& input': {
            fontSize: 13,
          },
        }}
      />
    </Box>
<Box sx={{ position: "relative", paddingRight: '4%', width: '150px' }}>
  <Autocomplete
    multiple
    disableCloseOnSelect
    options={[...selectedSku, ...skuList.filter(s => !selectedSku.some(ss => ss.id === s.id))]}
    getOptionLabel={(option) =>
      typeof option === "string" ? option : option.sku
    }
    isOptionEqualToValue={(option, value) => option.id === value.id}
    inputValue={inputValueSku}
    onInputChange={(e, newInputValue) => {
      setInputValueSku(newInputValue);
      setSkuLimit(11); // optional if using lazy load
    }}
    value={selectedSku}
    onChange={(event, newValue) => {
      setSelectedSku(newValue);
    }}
    renderTags={() => null}
    noOptionsText={inputValueSku ? "No options" : ""}
    renderOption={(props, option) => {
      const isSelected = selectedSku.some((s) => s.id === option.id);
      return (
        <Box
          component="li"
          {...props}
          onClick={() => toggleSelectionSKU(option)}
          sx={{
            backgroundColor: isSelected ? "#b6d5f3 !important" : "transparent",
            fontSize: 13,
            cursor: "pointer",
          }}
          key={option.id}
        >
          {option.sku}
        </Box>
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="SKU"
        size="small"
        placeholder="Search SKU..."
        InputProps={{
          ...params.InputProps,
          endAdornment: <>{params.InputProps.endAdornment}</>,
        }}
      />
    )}
    PopperComponent={(props) => (
      <Box
        {...props}
        sx={{
          zIndex: 1300,
          width: 220,
          bgcolor: 'white',
          boxShadow: 3,
          borderRadius: 1,
          overflow: 'auto',
          maxHeight: 300,
          position: 'absolute',
        }}
        onScroll={(event) => {
          const { scrollTop, scrollHeight, clientHeight } = event.target;
          if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && hasMore) {
            setSkuLimit((prev) => prev + 10); // for lazy load
          }
        }}
      >
        {props.children}
      </Box>
    )}
    sx={{
      '& .MuiInputBase-root': {
        height: 40,
        fontSize: 14,
        width: 190,
      },
      '& input': {
        fontSize: 13,
      },
    }}
  />
</Box>


 <Box sx={{ width: 160, position: "relative",  }}>
  <Autocomplete
    multiple
    freeSolo
    disableClearable
options={[
      ...selectedManufacturer,
      ...manufacturerList.filter((m) => !selectedManufacturer.includes(m)),
    ]}
        filterSelectedOptions={false}
    inputValue={inputValueManufactuer}
    value={selectedManufacturer}
    onInputChange={(e, newInputValue) => {
      setInputValueManufactuer(newInputValue);
    }}
    onChange={() => {}} // prevent default chip rendering
    renderTags={() => null} // prevent default tag display
    renderOption={(props, option) => {
      const isSelected = selectedManufacturer.includes(option);
      return (
        <Box
          component="li"
          {...props}
          onClick={() => handleToggleManufacturer(option)}
          sx={{
            backgroundColor: isSelected ? "#b6d5f3 !important" : "transparent",
            fontSize: 13,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          {option}
        </Box>
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="MFG"
        placeholder="Search..."
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {params.InputProps.endAdornment}
            </>
          ),
        }}
        size="small"
      />
    )}
    PopperComponent={(props) => (
      <Box
        {...props}
        sx={{
          zIndex: 1300,
          width: 220,
          bgcolor: 'white',
          boxShadow: 3,
          borderRadius: 1,
          overflow: 'auto',
          maxHeight: 300,
          position: 'absolute',
        }}
      >
        {/* Custom chip display inside dropdown */}
        {/* {selectedManufacturer.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: 1,
              px: 1,
              pt: 1,
            }}
          >
            {selectedManufacturer.map((manufacturer) => (
              <Chip
                key={manufacturer}
                label={manufacturer}
                size="small"
                onDelete={() => handleRemoveManufacturer(manufacturer)}
                sx={{
                  backgroundColor: '#007bff',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  '.MuiChip-deleteIcon': {
                    color: '#fff',
                  },
                }}
              />
            ))}
          </Box>
        )} */}
        {props.children}
      </Box>
    )}
    sx={{
      "& .MuiInputBase-root": {
        height: 40,
        fontSize: 14,
        width: 170,
      },
      "& input": {
        fontSize: 13,
      },
    }}
  />
</Box>
 <Box
  sx={{
   marginLeft:'19px',
    position: "relative",
    paddingRight: "10px",
    // width: "300px",
  }}
>

  <>
    <Button
      variant="outlined"
      onClick={handleMenuOpen}
      sx={{
        width: 140,
        height: 40,
        justifyContent: "space-between",
        padding: "9px 8px 6px 8px",
        color: "rgba(0, 0, 0, 0.6)",
        fontSize: "16px",
        borderColor: "#cacaca",
        textTransform: "none",
      }}
    >
      {selectedCategory
        ? selectedCategory.fulfillment
          ? `${selectedCategory.name} - ${selectedCategory.fulfillment}`
          : selectedCategory.name
        : "Select Category"}
      <ArrowDropDownIcon />
    </Button>

    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{ sx: { maxHeight: 400, width: 143, fontSize: "15px" } }}
    >
      {isLoading ? (
        <MenuItem disabled>
          <CircularProgress size={24} sx={{ margin: "0 auto" }} />
        </MenuItem>
      ) : (
        categories.map((category) => (
          <div key={category.id}>
            <MenuItem
              onClick={() => handleCategorySelect(category)}
              sx={{
                pl: 2,
                color: "black",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <ListItemIcon>
                  {category.icon ||
                    (category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        style={{ width: 17, height: 14, marginRight: 5 }}
                      />
                    ) : (
                      <ImageIcon sx={{ width: 17, height: 14, mr: 0.5 }} />
                    ))}
                </ListItemIcon>
                <ListItemText
                  // sx={{ textTransform: "capitalize" }}
                  primary={category.name}
                />
              </div>

              {category.fulfillment_channel && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // prevent parent click
                    toggleExpandCategory(category.id);
                  }}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  {expandedCategories[category.id] ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </MenuItem>

            {category.fulfillment_channel && (
              <Collapse
                in={expandedCategories[category.id]}
                timeout="auto"
                unmountOnExit
              >
                {category.fulfillment_channel.map((channelObj) => {
                  const [label, value] = Object.entries(channelObj)[0];
                  return (
                    <MenuItem
                      key={label}
                      onClick={() =>
                        handleFulfillmentSelect(category, { label, value })
                      }
                      sx={{ pl: 6 }}
                    >
                      {label}
                    </MenuItem>
                  );
                })}
              </Collapse>
            )}
          </div>
        ))
      )}
    </Menu>
  </>
</Box>


    </Grid>


  </Grid>

<Box sx={{ width: '86%', height: '60px',marginTop:'0px', backgroundColor:'#ffff',display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 2, paddingLeft:'33px' }}>
  <Box sx={{ marginTop:'6px', padding:'0px 16px 0px 0px' }}>
  {/* Apply Button */}
  <Tooltip title="Apply Filter" arrow>
    <Button
      onClick={handleApplyFilter}
      variant="contained"
      sx={{
        backgroundColor: "#000080",
        color: "white",
        minWidth: "auto",
        padding: "6px",
        boxShadow: 'none',
        mr: 1,
        "&:hover": {
          backgroundColor: "darkblue",
        },
      }}
    >
      <FilterAltIcon sx={{ color: "white", fontSize: "20px" }} />
    </Button>
  </Tooltip>

  {/* Reset Button */}
  <Tooltip title="Reset" arrow>
    <Button
      onClick={handleClearFilter}
      variant="outlined"
      sx={{
        backgroundColor: "#000080",
        minWidth: "auto",
        padding: "6px",
        "&:hover": {
          backgroundColor: "darkblue",
        },
      }}
    >
      <Refresh sx={{ color: "white", fontSize: "19px" }} />
    </Button>
  </Tooltip>
</Box>
<Box sx={{ position: "relative",  paddingRight: '70px', width: '150px' }}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        freeSolo
    options={[...selectedAsin, ...asinList.filter(a => !selectedAsin.some(sa => sa.id === a.id))]}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.Asin
        }
        isOptionEqualToValue={(option, value) => option.id === value.id}
        inputValue={inputValueAsin}
        onInputChange={(e, newInputValue) => setInputValueAsin(newInputValue)}
        value={selectedAsin}
        onChange={() => {}} // prevent default tag update
        renderTags={() => null}
        renderOption={(props, option) => {
          const isSelected = selectedAsin.some((s) => s.id === option.id);
          return (
            <Box
              component="li"
              {...props}
              onClick={() => toggleSelectionAsin(option)}
              sx={{
                backgroundColor: isSelected ? "#b6d5f3 !important" : "transparent",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {option.Asin}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="ASIN / WPID"
            size="small"
            placeholder="Search ASIN / WPID..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        PopperComponent={(props) => (
          <Box
            {...props}
            sx={{
              zIndex: 1300,
              width: 220,
              bgcolor: 'white',
              boxShadow: 3,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 300,
              position: 'absolute',
            }}
          >
            {/* {selectedAsin.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  gap: 1,
                  px: 1,
                  pt: 1,
                }}
              >
                {selectedAsin.map((asin) => (
                  <Chip
                    key={asin.id}
                    label={asin.Asin}
                    size="small"
                    onDelete={() => handleRemoveAsin(asin.id)}
                    sx={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      '.MuiChip-deleteIcon': {
                        color: '#fff',
                      },
                    }}
                  />
                ))}
              </Box>
            )} */}
            {props.children}
          </Box>
        )}
        sx={{
          '& .MuiInputBase-root': {
            height: 40,
            fontSize: 14,
            width: 210,
          },
          '& input': {
            fontSize: 13,
          },
        }}
      />
    </Box>
     
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    {/* Preset Dropdown */}
     <Box sx={{paddingTop:'5px',}}>
    <FormControl size="small" sx={{ minWidth: 130, pr: '9px' }}>
      <InputLabel>Preset</InputLabel>
      <Select
        value={selectedPreset}
        label="Preset"
        onChange={(e) => {
          // setSelectedPreset(e.target.value);
          setSelectedPreset(e.target.value);
          // setBefePreset(e.target.value)
          handlePresetSelectHelium(e.target.value);
        }}
      >
        {presets.map((preset) => (
          <MenuItem key={preset} value={preset}>
            {preset}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
</Box>
    {/* Start Date Picker */}
  {/* Start Date Picker */}
  
<Box sx={{paddingRight:'8px',width: '130px'}}>
<DatePicker
  label="Start Date"
  value={startDate}
  onChange={handleStartDateChange}
  views={["year", "month", "day"]}
  disableFuture
  maxDate={endDate}
  renderInput={(params) => (
    <TextField
      {...params}
      size="small"
      sx={{
        minWidth: 90,
        pr: '5px', // Padding right applied here
        '& .MuiInputBase-root': { height: 30, fontSize: '12px' },
        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
      }}
    />
  )}
/>
</Box>
{/* End Date Picker */}
<Box sx={{paddingRight:'8px' ,width: '130px'}}>
<DatePicker
  label="End Date"
  value={endDate}
  onChange={handleEndDateChange}
  views={["year", "month", "day"]}
  minDate={startDate}
  shouldDisableDate={(date) => date.isBefore(startDate, 'day')}
  renderInput={(params) => (
    <TextField
      {...params}
      size="small"
      sx={{
        minWidth: 90,
        pr: '5px', // Padding right applied here
        '& .MuiInputBase-root': { height: 30, fontSize: '12px' },
        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
      }}
    />
  )}
/>
</Box>
  </LocalizationProvider>

</Box>

  </Box>
</Grid>



        {/* Display Cards and Components */}
        <Grid item xs={12} sm={12} sx={{marginTop:'9%'}}>
          {/* <HeliumCard/> */}
          <TestCard  marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment} />
          {/* <CardCount marketPlaceId={ selectedCategory == 'all' ? selectedCategory : filterFinal} DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} /> */}
        </Grid>

      {/* <Grid item xs={12} sm={12} sx={{paddingLeft: '40px'}}
      >
          <CardComponent   widgetData={befePreset} marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} brand_id={selectedBrandFilter} product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}/>
        </Grid> */}
        <Grid container spacing={2}>
  {/* Left side - Insight */}
  {/* <Grid item xs={12} md={3}>
  <Box
    sx={{
      borderRight: '1px solid lightgray', // Light grey vertical line
      height: '90%', // Full height to cover the section
      padding: '16px', // Padding for better spacing inside
    }}
  >
    <InsightCategory />
  </Box>
</Grid> */}


<Grid item xs={12} sm={12} sx={{width:'100%',  borderRadius: '2px',}}>
  <Box
    sx={{
          // height: '100%', // Full height to cover the section
      padding: '16px', // Padding for better spacing inside
    }}
  >
    <InsightCategory />
  </Box>
</Grid>


  {/* Right side - Tabs + Content */}
  {/* <Grid item xs={12} md={9}> */}
  <Grid item xs={12} sm={12} sx={{  padding:'13px',marginLeft:'15px'}}>
  <Box
    sx={{
     
 border: '1px solid #ddd',
 boxShadow:'none',
      borderRadius: '12px',
      p: 1.2, // 🔽 Reduced padding
      // backgroundColor: '#f4f7fc',
    
    }}
  >
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#dce3ec',
        borderRadius: '30px',
        p: '2px', // 🔽 Reduced inner padding
        mb: 1.5, // 🔽 Slightly tighter margin
      }}
    >
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="fullWidth"
        sx={{
          minHeight: 0,
          width: '100%',
          '& .MuiTabs-indicator': { display: 'none' },
        }}
      >
        {[
  { label: 'Revenue', icon: <BarChartOutlined fontSize="small" /> },
  { label: 'Top Products', icon: <EmojiEventsOutlined fontSize="small" /> },
  { label: 'Total Sales', icon: <AttachMoneyOutlined fontSize="small" /> },
  { label: 'Latest Orders', icon: <ShoppingCartOutlined fontSize="small" /> },
]
.map((item, index) => (
<Tab
  key={item.label}
  icon={item.icon}
  iconPosition="start"
  label={
    <Typography fontSize="14px" sx={{   fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    }} fontWeight={tab === index ? 600 : 'normal'}>
      {item.label}
    </Typography>
  }
  sx={{
    textTransform: 'none',
    minHeight: 26,
    px: 1.2,
    mx: 0.4,
 
    fontSize:'14px',
    borderRadius: '16px',
    color: '#2b2f3c',
    backgroundColor: tab === index ? '#fff' : 'transparent',
    '&.Mui-selected': {
      color: '#000',
    },
    '&:hover': {
      backgroundColor: tab === index ? '#fff' : 'rgb(166, 183, 201)',
    },
    '&:active': {
      backgroundColor: 'rgb(103, 132, 162)',
    },
  }}
/>


        
        ))}
      </Tabs>
    </Box>

    <Box>

      {tab === 0 && (
 <CompareChart   startDate={startDateHelium}
        endDate={endDateHelium}
        widgetData={befePreset}  marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}
    DateStartDate={appliedStartDate} DateEndDate={appliedEndDate}/>
)}

      {/* {tab === 0 && (
  (befePreset === 'Today' || befePreset === 'Yesterday') ? (
         <RevenueTimeGraph
        startDate={startDateHelium}
        endDate={endDateHelium}
        widgetData={befePreset}  marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}
    DateStartDate={appliedStartDate} DateEndDate={appliedEndDate}  />
     ) : (
        <RevenueWidget
        startDate={startDateHelium}
        endDate={endDateHelium}
        widgetData={befePreset}  marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}
    DateStartDate={appliedStartDate} DateEndDate={appliedEndDate}  />
    
      )
)} */}
      {tab === 1 && (
        <TopProducts
          startDate={startDateHelium}
          endDate={endDateHelium}
          widgetData={befePreset}
          marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal}
          brand_id={selectedBrandFilter}
          product_id={mergedProductsFilter}
          manufacturer_name={selectedManufacturerFilter}
          fulfillment_channel={selectedFulfillment}
             DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} 
        />
      )}
      {tab === 2 && (
        <TotalOrdersGraph
          widgetData={befePreset}
          marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal}
          DateStartDate={appliedStartDate}
          DateEndDate={appliedEndDate}
          brand_id={selectedBrandFilter}
          product_id={mergedProductsFilter}
          manufacturer_name={selectedManufacturerFilter}
          fulfillment_channel={selectedFulfillment}
        />
      )}
      {tab === 3 && <LastOrders   marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment} />}
    </Box>
  </Box>
</Grid>


</Grid>
   <Grid item xs={12} sm={12} >
          <PeriodComparission   marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}/>
        </Grid> 
        <Grid item xs={12} sm={12} >
          <MetricCard   startDate={startDateHelium}
          endDate={endDateHelium}
          widgetData={befePreset} 
          marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal}
          brand_id={selectedBrandFilter} product_id={mergedProductsFilter?.id} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment} 
             DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
        </Grid>

        <Grid item xs={12} sm={12}>
          <Box sx={{paddingBottom:'10px', width:'99%'}}>
          <SalesIncreasing  marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}  DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
          </Box>
          <Box sx={{paddingBottom:'10px', width:'99%'}}>
          <SalesDecreasing  marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}  DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
          </Box>

          <Grid item xs={12} sm={12} sx={{width:'99%'}}>
          <AllMarketplace  widgetData={befePreset} marketPlaceId={selectedCategory === 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter} product_id={mergedProductsFilter?.id} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}  DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
        </Grid>
        <Grid item xs={12} sm={12} sx={{width:'99%'}}>
          <ProfitAndLoss  widgetData={befePreset} marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter} fulfillment_channel={selectedFulfillment} manufacturer_name={selectedManufacturerFilter} product_id={mergedProductsFilter?.id}  DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
        </Grid>
{/* <Grid item xs={12} sm={12} sx={{width:'99%'}}>
          <TestProfitLoss  widgetData={befePreset} marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal}/>
        </Grid> */}

        <Grid item xs={12} sm={12}>
          <MyProductList  widgetData={befePreset} marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} brand_id={selectedBrandFilter}   product_id={mergedProductsFilter?.id} manufacturer_name={selectedManufacturerFilter} fulfillment_channel={selectedFulfillment}  DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
             </Grid>
        </Grid> 
        {/* <Grid item xs={12} sm={12}>
          <ProductTableDashboard marketPlaceId={selectedCategory == 'all' ? selectedCategory : filterFinal} DateStartDate={appliedStartDate} DateEndDate={appliedEndDate} />
        </Grid>  */}
      </Grid>
    </Box>
  );
}

export default ClientDashboardpage;