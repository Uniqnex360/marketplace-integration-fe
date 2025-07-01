import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Select, MenuItem, ListItemIcon, CircularProgress } from "@mui/material";

function MarketplaceOption({ handleProduct, handleCategoryList, handleBrandList,clearChannel }) {
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }

  useEffect(()=>{
    
    console.log('555',clearChannel)
    setSelectedCategory(clearChannel)
  },[clearChannel])

  
  // Fetch marketplace list when the component mounts
  useEffect(() => {
    const fetchMarketplaceList = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}getMarketplaceList/?user_id=${userIds}`
      );

        const categoryData = response.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.image_url,
        }));

        setCategories([{ id: "all", name: "All Channels" }, ...categoryData]);
        handleProduct({ id: "all", name: "All Channels" });
      } catch (error) {
        console.error("Error fetching marketplace list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceList();
  }, []);

  // Fetch product categories and brand filter based on selected marketplace
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryFilter(selectedCategory);
      fetchBrandFilterList(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategoryFilter = async (category) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}getProductCategoryList/`, {
        params: {
          marketplace_id: category.id === 'all' ? "" : category.id, user_id: userIds
        },
      });

      if (response.data?.data?.category_list) {
        handleCategoryList(response.data.data.category_list);
      } else {
        console.error("No categories found in the response.");
      }
    } catch (error) {
      console.error("Error fetching product categories:", error);
    }
  };

  const fetchBrandFilterList = async (category) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}getBrandList/`, {
        params: {
          marketplace_id: category.id === 'all' ? "" : category.id,
          user_id:userIds
        },
      });

      if (response.data?.data?.brand_list) {
        handleBrandList(response.data.data.brand_list);
      } else {
        console.error("No brands found in the response.");
      }
    } catch (error) {
      console.error("Error fetching brand list:", error);
    }
  };

  const handleCategoryChange = (event) => {
    const selectedName = event.target.value;
    const selectedCategoryObject = categories.find(
      (category) => category.name === selectedName
    );

    if (selectedCategoryObject) {
      setSelectedCategory(selectedCategoryObject);
      handleProduct(selectedCategoryObject);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Select
        labelId="category-label"
        id="category-select"
        value={selectedCategory.name}
        onChange={handleCategoryChange}
        displayEmpty
        sx={{ width: 180, marginTop:'10px', height: 35, color: "#121212" }}
        MenuProps={{
          PaperProps: {
            sx: {
              
              maxHeight: 150,
              color: "white",
            },
          },
        }}
      >
        {isLoading ? (
          <MenuItem disabled>
         
            <CircularProgress size={24} sx={{ margin: "0 auto", display: "block" }} />
          </MenuItem>
        ) : (
          categories.map((category) => (
            <MenuItem key={category.id} value={category.name} sx={{ height: 30, color: "#000080" }}>
              <ListItemIcon>
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    style={{ width: 17, height: 14, marginRight: 5 }}
                  />
                ) : (
                  <div style={{ width: 20, height: 20, marginRight: 5 }}></div>
                )}
              </ListItemIcon>
              {category.name}
            </MenuItem>
          ))
        )}
      </Select>

      {isLoading && (
        <CircularProgress
          size={24}
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </Box>
  );
}

export default MarketplaceOption;