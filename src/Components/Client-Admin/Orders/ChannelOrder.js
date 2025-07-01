import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Select, MenuItem, ListItemIcon, CircularProgress } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Icon for "Custom Order"
import AppsIcon from "@mui/icons-material/Apps"; // Icon for "All Channels"
import ImageIcon from '@mui/icons-material/Image';  // Fallback icon for other categories (e.g., image-based ones like Walmart, Amazon)

function ChannelOrder({ handleProduct ,clearChannel}) {
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "All Channels",
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  let userIds = "";

  if (userData) {
    const data = JSON.parse(userData);
    userIds = data.id;
  }
   const value = localStorage.getItem('selectedCategory')
 
useEffect(() => {
  
console.log('777',value, clearChannel)
setSelectedCategory(clearChannel)

  }, [ clearChannel]); 

  // Effect to fetch marketplace list and set categories
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

        setCategories([
          { id: "all", name: "All Channels", icon: <AppsIcon fontSize="small" sx={{ height: '13px' }} /> },
          { id: "custom", name: "Custom Order", icon: <ShoppingCartIcon fontSize="small" sx={{ height: '13px' }} /> },
          ...categoryData,
        ]);

        // Load selected category from localStorage (if available)
        const storedCategory = localStorage.getItem("selectedCategory");
        if (storedCategory) {
          setSelectedCategory(JSON.parse(storedCategory));
        } else {
          // Default selection if nothing is stored in localStorage
          setSelectedCategory({ id: "all", name: "All Channels" });
        }
      } catch (error) {
        console.error("Error fetching marketplace list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceList();
  }, [ ]); // Empty dependency array to fetch once after the first render

  const handleCategoryChange = (event) => {
    const selectedName = event.target.value;
    const selectedCategoryObject = categories.find(
      (category) => category.name === selectedName
    );

    if (selectedCategoryObject) {
      // Set the selected category in state
      setSelectedCategory(selectedCategoryObject);

      // Save the selected category object in localStorage
      localStorage.setItem("selectedCategory", JSON.stringify(selectedCategoryObject));

      // Call the handleProduct function if needed
      handleProduct(selectedCategoryObject);

      // If "Custom Order" is selected, navigate to the Custom Order List page
      // if (selectedCategoryObject.id === "custom") {
      //   navigate("/Home/orders/customList/");
      // }
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
        sx={{ width: 180, marginTop: "10px", height: 35, color: "#121212" }}
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
                {category.icon || (
                  category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      style={{ width: 17, height: 14, marginRight: 5 }}
                    />
                  ) : (
                    <ImageIcon sx={{ width: 17, height: 14, marginRight: 5 }} />  // Fallback icon for dynamic categories
                  )
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

export default ChannelOrder;
