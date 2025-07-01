import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  List,
  ListItem,
  Collapse,
  Grid,
  TextField
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// Function to group filters alphabetically
const groupByAlphabet = (items) => {
  return items.reduce((acc, item) => {
    // Check if item.name exists and is a string
    if (item.name && typeof item.name === 'string') {
      const firstLetter = item.name[0].toUpperCase();
      const groupKey = /^[A-Z]$/.test(firstLetter) ? firstLetter : "#";
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(item);
    } else {
      // Handle cases where item.name is undefined or not a string
      acc["#"] = acc["#"] || [];
      acc["#"].push(item);
    }
    return acc;
  }, {});
};

const splitIntoColumns = (alphabetList) => {
  const mid = Math.ceil(alphabetList.length / 3);
  const leftColumn = alphabetList.slice(0, mid);
  const centerColumn = alphabetList.slice(mid, 2 * mid);
  const rightColumn = alphabetList.slice(2 * mid);
  return [leftColumn, centerColumn, rightColumn];
};

const FiltersUi = ({ categories, setCategoryFilterList, onProductTypeChange, brandFilterList , onBrandTypeChange}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [productTypes, setproductTypes] = useState([]);
  const [brandTypes, setbrandTypes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  
  const [SelectedBrandTypes, setSelectedBrandTypes] = useState([]);
  const [openCategoryPopup, setOpenCategoryPopup] = useState(false);
  const [openBrandPopup, setOpenBrandPopup] = useState(false);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState([]);
  const [selectedListingStatus, setSelectedListingStatus] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null); // Track which section is expanded
  const [searchQuery, setSearchQuery] = useState(""); // For search functionality in filter and dialog
  const [dialogSearchQuery, setDialogSearchQuery] = useState(""); // For search inside the dialog
  const [dialogBrandSearchQuery, setDialogBrandSearchQuery] = useState(""); // For search inside the dialog

  const groupedProductTypes = groupByAlphabet(productTypes);
  
  const groupedBrandTypes = groupByAlphabet(brandTypes);
  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [marketplaceData, setMarketplaceData] = useState({ id: "" }); // Define state to store only id
  const [leftColumn, centerColumn, rightColumn] = splitIntoColumns(alphabet);

  useEffect(() => {
    console.log("Updated Category 111111:",  brandFilterList);
    setproductTypes(setCategoryFilterList);
    setbrandTypes(brandFilterList)
  }, [setCategoryFilterList, brandFilterList]); // This will run every time setCategoryFilterList changes




{/* Handlers for Product Type and Brand Type */}
const handleProductTypeChange = (productType) => {
  setSelectedProductTypes((prev) => {
    const isSelected = prev.some((pt) => pt.id === productType.id);
    const updatedList = isSelected
      ? prev.filter((pt) => pt.id !== productType.id)
      : [...prev, productType];

    console.log("Updated Product Types List:", updatedList);
    if (onProductTypeChange) {
      onProductTypeChange({
        updatedList,
      });
    }
    return updatedList;
  });
};

const handleBrandTypeChange = (brand) => {
  setSelectedBrandTypes((prev) => {
    const isSelected = prev.some((pt) => pt.id === brand.id);
    const updatedList = isSelected
      ? prev.filter((pt) => pt.id !== brand.id)
      : [...prev, brand];

    console.log("Updated Brand Types List:", updatedList);
    if (onBrandTypeChange) {
      onBrandTypeChange({
        updatedList,
      });
    }
    return updatedList;
  });
};

  const handleDialogClose = () => {
    setOpenCategoryPopup(false);
  };

  const handleMoreClick = () => {
    setOpenCategoryPopup(true); // Opens the dialog when "+more" is clicked
  };



  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };



  // Filter categories and product types based on search query
  const filteredProductTypes = productTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrandTypes = brandTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupedProductTypes = Object.keys(groupedProductTypes).reduce((acc, key) => {
    const filteredCategories = groupedProductTypes[key].filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredCategories.length > 0) {
      acc[key] = filteredCategories;
    }
    return acc;
  }, {});


  const filteredGroupedBrandTypes = Object.keys(groupedBrandTypes).reduce((acc, key) => {
    const filteredCategories = groupedBrandTypes[key].filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredCategories.length > 0) {
      acc[key] = filteredCategories;
    }
    return acc;
  }, {});


  // Filter categories in dialog based on dialogSearchQuery
  const filteredDialogCategories = Object.keys(groupedProductTypes).reduce((acc, key) => {
    const filteredCategories = groupedProductTypes[key].filter((category) =>
      category.name.toLowerCase().includes(dialogSearchQuery.toLowerCase())
    );
    if (filteredCategories.length > 0) {
      acc[key] = filteredCategories;
    }
    return acc;
  }, {});


  
  // Filter categories in dialog based on dialogSearchQuery
  const filteredDialogBrandList = Object.keys(groupedBrandTypes).reduce((acc, key) => {
    const filteredBrand = groupedBrandTypes[key].filter((category) =>
      category.name.toLowerCase().includes(dialogBrandSearchQuery.toLowerCase())
    );
    if (filteredBrand.length > 0) {
      acc[key] = filteredBrand;
    }
    return acc;
  }, {});

  return (
    <Box
      sx={{
        position: "fixed",
        top: 100,
        marginTop: "60px",
        backgroundColor: "#fff",
        width: "189px",
        padding: 2,
        boxShadow: 3,
        borderRadius: 1,
        zIndex: 9999,
        maxHeight: "calc(92vh - 150px)",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#555",
        },
      }}
    >
      {/* Search Box */}
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

{/* Product Type Section */}
<Typography
  variant="subtitle1"
  fontWeight="bold"
  sx={{
    backgroundColor: "#e1f5fe",
    color: "#000080",
    padding: "8px",
    cursor: "pointer",
    borderBottom: "2px solid #000080",
    marginBottom: "8px",
    fontSize: "16px",
  }}
  onClick={() => toggleSection("productTypes")}
>Category
</Typography>

<Collapse in={expandedSection === "productTypes"}>
  <List sx={{ marginBottom: "16px", fontSize: "12px", padding: 0 }}>
    {/* Loop through filtered product types and create checkboxes */}
    {filteredProductTypes.slice(0, 6).map((type, index) => (
      <ListItem key={index} sx={{ padding: "4px 0", height: "auto" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedProductTypes.some((pt) => pt.id === type.id)}
              onChange={() => handleProductTypeChange(type)}
              sx={{
                fontSize: "12px",
                "&.Mui-checked": {
                  color: "#000080",
                },
              }}
            />
          }
          label={`${type.name} (${type.product_count})`}
          componentsProps={{
            typography: {
              fontSize: "14px",
              fontWeight: 600,
            },
          }}
        />
      </ListItem>
    ))}
    {filteredProductTypes.length > 6 && (
      <Button
        variant="text"
        startIcon={<AddIcon />}
        
        onClick={() => setOpenCategoryPopup(true)}
        sx={{
          color: "red",
          textTransform: "none",
          fontSize: "12px",
        }}
      >
        + {filteredProductTypes.length - 6} more
      </Button>
    )}
  </List>
</Collapse>

{/* Brand List Section */}
<Typography
  variant="subtitle1"
  fontWeight="bold"
  sx={{
    backgroundColor: "#e1f5fe",
    color: "#000080",
    padding: "8px",
    cursor: "pointer",
    borderBottom: "2px solid #000080",
    marginBottom: "8px",
    fontSize: "16px",
  }}
  onClick={() => toggleSection("brandTypes")}
>
  Brand List
</Typography>

<Collapse in={expandedSection === "brandTypes"}>
  <List sx={{ marginBottom: "16px", fontSize: "12px", padding: 0 }}>
    {/* Loop through filtered brand types and create checkboxes */}
    {filteredBrandTypes.slice(0, 6).map((brand, index) => (
      <ListItem key={index} sx={{ padding: "4px 0", height: "auto" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={SelectedBrandTypes.some((brandType) => brandType.id === brand.id)}
              onChange={() => handleBrandTypeChange(brand)}
              sx={{
                fontSize: "12px",
                "&.Mui-checked": {
                  color: "#000080",
                },
              }}
            />
          }
          label={`${brand.name} (${brand.product_count})`}
          componentsProps={{
            typography: {
              fontSize: "14px",
              fontWeight: 600,
            },
          }}
        />
      </ListItem>
    ))}
    {filteredBrandTypes.length > 6 && (
      <Button
        variant="text"
        startIcon={<AddIcon />}
        onClick={() => setOpenBrandPopup(true)}
        sx={{
          color: "red",
          textTransform: "none",
          fontSize: "12px",
        }}
      >
        + {filteredBrandTypes.length - 6} more
      </Button>
    )}
  </List>
</Collapse>



      {/* Category Popup */}
      <Dialog
        open={openCategoryPopup} onClose={() => setOpenCategoryPopup(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "1200px", // Set fixed width
            height: "80vh", // Set fixed height
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>Select Categories</DialogTitle>
        <DialogContent
          sx={{
            height: "calc(80vh - 120px)", // Adjust content height to fit inside fixed height dialog
            overflowX: "auto", // Allow horizontal scrolling
            overflowY: "auto", // Allow vertical scrolling
          }}
        >
          {/* Add Search Field Inside Dialog */}
         {/* Add Search Field Inside Dialog */}
<Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
  <TextField
    label="Search Categories"
    variant="outlined"
    size="small"
    value={dialogSearchQuery}
    onChange={(e) => setDialogSearchQuery(e.target.value)}
    sx={{ marginBottom: 2, width: '30%' }}
  />
</Box>

          <Grid container spacing={2} sx={{ flexWrap: "wrap", overflowX: "auto" }}>
            {/* Left Column */}
            <Grid item xs={4}>
              {leftColumn.map((letter) => {
                const filteredCategories = filteredDialogCategories[letter];
                if (filteredCategories) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredCategories.map((category, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedProductTypes.some((pt) => pt.id === category.id)}
                                  onChange={() => handleProductTypeChange(category)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${category.name} (${category.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>

            {/* Center Column */}
            <Grid item xs={4}>
              {centerColumn.map((letter) => {
                const filteredCategories = filteredDialogCategories[letter];
                if (filteredCategories) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredCategories.map((category, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedProductTypes.some((pt) => pt.id === category.id)}
                                  onChange={() => handleProductTypeChange(category)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${category.name} (${category.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>

            {/* Right Column */}
            <Grid item xs={4}>
              {rightColumn.map((letter) => {
                const filteredCategories = filteredDialogCategories[letter];
                if (filteredCategories) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredCategories.map((category, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedProductTypes.some((pt) => pt.id === category.id)}
                                  onChange={() => handleProductTypeChange(category)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${category.name} (${category.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenCategoryPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>


           {/* Category Popup */}
           <Dialog
       open={openBrandPopup} onClose={() => setOpenBrandPopup(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "1200px", // Set fixed width
            height: "80vh", // Set fixed height
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle>Select Brand</DialogTitle>
        <DialogContent
          sx={{
            height: "calc(80vh - 120px)", // Adjust content height to fit inside fixed height dialog
            overflowX: "auto", // Allow horizontal scrolling
            overflowY: "auto", // Allow vertical scrolling
          }}
        >
   

          {/* Add Search Field Inside Dialog */}
<Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
  <TextField
    label="Search Brand"
    variant="outlined"
    size="small"
    value={dialogBrandSearchQuery}
    onChange={(e) => setDialogBrandSearchQuery(e.target.value)}
    sx={{ marginBottom: 2, width: '30%' }}
  />
</Box>


          <Grid container spacing={2} sx={{ flexWrap: "wrap", overflowX: "auto" }}>
            {/* Left Column */}
            <Grid item xs={4}>
              {leftColumn.map((letter) => {
                const filteredBrand = filteredDialogBrandList[letter];
                if (filteredBrand) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredBrand.map((brand, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={SelectedBrandTypes.some((pt) => pt.id === brand.id)}
                                  onChange={() => handleBrandTypeChange(brand)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${brand.name} (${brand.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>

            {/* Center Column */}
            <Grid item xs={4}>
              {centerColumn.map((letter) => {
                const filteredBrand = filteredDialogBrandList[letter];
                if (filteredBrand) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredBrand.map((brand, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={SelectedBrandTypes.some((pt) => pt.id === brand.id)}
                                  onChange={() => handleBrandTypeChange(brand)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${brand.name} (${brand.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>

            {/* Right Column */}
            <Grid item xs={4}>
              {rightColumn.map((letter) => {
                const filteredBrand = filteredDialogBrandList[letter];
                if (filteredBrand) {
                  return (
                    <Box key={letter} sx={{ marginBottom: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {letter}
                      </Typography>
                      <List>
                        {filteredBrand.map((brand, idx) => (
                          <ListItem key={idx} sx={{ paddingY: 0 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={SelectedBrandTypes.some((pt) => pt.id === brand.id)}
                                  onChange={() => handleBrandTypeChange(brand)}
                                  sx={{ "&.Mui-checked": { color: "#000080" } }}
                                />
                              }
                              label={`${brand.name} (${brand.product_count})`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  );
                }
                return null;
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
        <Button onClick={() => setOpenBrandPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FiltersUi;
