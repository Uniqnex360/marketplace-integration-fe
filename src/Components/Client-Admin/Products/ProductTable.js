import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  useMediaQuery,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  Menu,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { Refresh, Download } from "@mui/icons-material";
import PublishIcon from "@mui/icons-material/Publish";
import DottedCircleLoading from "../../Loading/DotLoading";
import FiltersUi from "./FiltersUi"; // Import your Filters UI component
import soon from "../../assets/soon.png"; // Fallback image
import ProductImport from "../Products/ProductImport";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MarketplaceOption from "./MarketplaceOption";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductTable = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State variables
  const [searchQuery, setSearchQuery] = useState(""); // Debounced search query
  const [searchTerm, setSearchTerm] = useState(""); // Input field value
  const [importOpen, setImportOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [updatedList, setUpdatedList] = useState([]); // Selected category names for filtering
  const [UpdatedBrandId, setUpdatedBrandList] = useState([]); // Selected brand IDs for filtering
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]); // This seems redundant with updatedList, clarify its purpose if different
  const [setCategoryFilterList, setsetCategoryFilterList] = useState([]); // This also seems redundant, clarify its purpose if different
  const [currentColumn, setCurrentColumn] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [brandFilterList, setBrandFilterList] = useState([]); // List of available brands for filters
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default rows per page
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false); // Flag to prevent multiple API calls
  const [categories, setCategories] = useState([
    "All",
    "Category 1",
    "Category 2",
  ]);

  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const initialRowsPerPage =
    parseInt(searchParams.get("rowsPerPage"), 10) || 50;

  // Ref to store last API call parameters to prevent unnecessary fetches
  let lastParamsRef = useRef("");

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    return storedCategory
      ? JSON.parse(storedCategory)
      : { id: "all", name: "All Channels" };
  });

  // Effect to set initial rowsPerPage from URL on component mount
  useEffect(() => {
    setRowsPerPage(initialRowsPerPage);
  }, [location.search]);

  // Effect to ensure 'page' query parameter exists in URL
  useEffect(() => {
    if (!searchParams.has("page")) {
      searchParams.set("page", "1");
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [location, navigate, searchParams]);

  // Main effect to fetch products based on dependencies
  useEffect(() => {
    // Construct current parameters for comparison
    const currentParams = JSON.stringify({
      updatedList,
      UpdatedBrandId,
      page,
      rowsPerPage,
      sortConfig,
      selectedCategory, // Use selectedCategory here
      searchQuery,
    });

    // Only fetch if parameters have actually changed
    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      fetchProducts(); // Call fetchProducts without arguments, as it will read from state
    }
  }, [
    updatedList,
    UpdatedBrandId,
    page,
    rowsPerPage,
    sortConfig,
    selectedCategory,
    searchQuery,
  ]); // Dependency array

  // Effect to set search term from location state (for navigation)
  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery);
      setSearchQuery(location.state.searchQuery); // Also set the debounced search query
    }
  }, [location.state]);

  const handleImportClick = () => {
    setImportOpen(true);
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1); // Reset page to 1 when sorting is applied
    setAnchorEl(null); // Close the menu after selection
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleImportClose = () => {
    setImportOpen(false);
  };

  const fetchProducts = async () => {
    if (isFetching) return;

    setLoading(true);
    setIsFetching(true);

    try {
      const userData = localStorage.getItem("user");
      let userIds = "";

      if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
      }

      const validRowsPerPage =
        rowsPerPage && rowsPerPage > 0 ? rowsPerPage : 50;
      const skip = (page - 1) * validRowsPerPage;

      const response = await axios.post(
        `${process.env.REACT_APP_IP}getProductList/`,
        {
          user_id: userIds,
          marketplace: selectedCategory?.id === "all" ? "all" : "",
          marketplace_id:
            selectedCategory?.id && selectedCategory.id !== "all"
              ? selectedCategory.id
              : "",
          category_name: updatedList,
          brand_id_list: UpdatedBrandId,
          search_query: searchQuery, // Use the state variable directly
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          skip: skip >= 0 ? skip : 0,
          limit: validRowsPerPage,
        }
      );

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.product_list)
      ) {
        const products = response.data.data.product_list.map((product) => ({
          productId: product.id,
          image: product.image_url || soon,
          title: product.product_title || "N/A",
          sku: product.sku || "N/A",
          category: product.category || "N/A",
          marketplacelogo: product.marketplace_image_url || {
            image_url: soon,
            name: "N/A",
          },
          quantity: product.quantity || 0,
          price: product.price ? `$${product.price}` : "$0.00",
        }));

        setProductData(products);
        setProductCount(response.data.data.total_count);
        setTotalPages(
          Math.ceil(response.data.data.total_count / validRowsPerPage)
        );
      } else {
        console.error("No valid products found in response:", response.data);
        setProductData([]);
        setProductCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = e.target.value;
    setRowsPerPage(newRowsPerPage);
    navigate(`/Home/products?page=1&rowsPerPage=${newRowsPerPage}`); // Reset to page 1
    setPage(1);
  };

  const handlePageChange = (e, value) => {
    navigate(`/Home/products?page=${value}&rowsPerPage=${rowsPerPage}`);
    setPage(value);
  };
  const handleChangePage = (event, newPage) => {
    navigate(`/Home/products?page=${newPage}&&rowsPerPage=${rowsPerPage}`);
    setPage(newPage);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Update the input field value
    // Debounce the search query update to avoid excessive API calls
    if (e.target.timeout) {
      clearTimeout(e.target.timeout);
    }
    e.target.timeout = setTimeout(() => {
      setSearchQuery(value); // This triggers the useEffect to fetch data
      setPage(1); // Reset to page 1 on new search
    }, 500); // 500ms debounce
  };

  const handleAddFilterClick = () => {
    setFilterVisible(!filterVisible);
  };

  const handleResetChange = () => {
    setSearchTerm("");
    setSearchQuery(""); // Clear the search query
    setSortConfig({ key: "", direction: "asc" });
    setUpdatedBrandList([]);
    setUpdatedList([]);
    setFilterVisible(false);

    localStorage.removeItem("marketplace");
    const resetCategory = { id: "all", name: "All Channels" };
    setSelectedCategory(resetCategory);
    localStorage.setItem("selectedCategory", JSON.stringify(resetCategory));

    setPage(1); // Reset to page 1

    // The useEffect will now naturally re-fetch with the reset states
    toast.success("Filters reset successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleProduct = (category) => {
    localStorage.setItem("marketplace", JSON.stringify(category));
    setSelectedCategory(category);
    setPage(1); // Reset page to 1 when changing marketplace
  };

  const handleCategoryList = (catList) => {
    setsetCategoryFilterList(catList);
  };

  const handleBrandList = (brandList) => {
    setBrandFilterList(brandList);
  };

  const handleBrandChange = (val) => {
    const productList = val?.updatedList;
    if (!Array.isArray(productList)) {
      console.error("Error: Expected an array but received", productList);
      return;
    }
    const productTypeNames = productList.map((item) => item.name);
    setUpdatedList(productTypeNames);
    setPage(1); // Reset page to 1 when applying category filter
  };

  const handleFilterBrand = (val) => {
    const productList = val?.updatedList;
    if (!Array.isArray(productList)) {
      console.error("Error: Expected an array but received", productList);
      return;
    }
    const productTypeId = productList.map((item) => item.id);
    setUpdatedBrandList(productTypeId);
    setPage(1); // Reset page to 1 when applying brand filter
  };

  const hanldefiltersCategory = (filteredCategories) => {
    console.log("george", filteredCategories);
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        marginTop: "40px",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          color: "#000080",
          flex: 1,
          overflow: "hidden",
          marginTop: "50px",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexDirection: "row" }}>
          {filterVisible && (
            <Box
              sx={{
                width: "215px",
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: 0,
              }}
            >
              <FiltersUi
                categories={categories}
                setCategoryFilterList={setCategoryFilterList}
                onProductTypeChange={handleBrandChange}
                brandFilterList={brandFilterList}
                onBrandTypeChange={handleFilterBrand}
              />
            </Box>
          )}

          {/* Fixed Header (Search, Buttons) */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              my: 2,
              justifyContent: "flex-end",
              alignItems: "center",
              position: "fixed",
              top: 0,
              right: 0,
              marginTop: "90px",
              marginRight: "22px",
              width: "100%", // Adjust width if filter is visible
              backgroundColor: "white",
              zIndex: 100,
              padding: "10px",
            }}
          >
            <Box sx={{ marginTop: "-7px" }}>
              <MarketplaceOption
                handleProduct={handleProduct}
                handleCategoryList={handleCategoryList}
                handleBrandList={handleBrandList}
                clearChannel={selectedCategory}
              />
            </Box>

            <TextField
              size="small"
              placeholder="Search Title | SKU | Product Type"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                width: 300,
                "& input": {
                  fontSize: "14px",
                  // Center the text (and placeholder) inside the input
                },
              }}
            />

            <Tooltip title="Filter" arrow>
              <Button
                variant="text"
                color="primary"
                onClick={handleAddFilterClick}
                sx={{
                  backgroundColor: "#000080",
                  color: "white",
                  minWidth: "auto",
                  height: "32px", // Set a fixed height for consistency
                  width: "32px", // Set fixed width for consistency (same for all buttons)

                  padding: "6px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
              >
                <FilterListIcon sx={{ color: "white", fontSize: "20px" }} />
              </Button>
            </Tooltip>

            <Tooltip title="Import" arrow>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#000080",
                  minWidth: "auto",
                  padding: "6px",
                  height: "32px", // Set a fixed height for consistency
                  width: "32px", // Set fixed width for consistency (same for all buttons)

                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
                onClick={handleImportClick}
              >
                <PublishIcon sx={{ color: "white", fontSize: "20px" }} />
              </Button>
            </Tooltip>

            {/* Add Export button with icon */}
            <Tooltip title="Export" arrow>
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "#000080",
                  minWidth: "auto",
                  padding: "6px",
                  display: "flex",
                  height: "32px", // Set a fixed height for consistency
                  width: "32px", // Set fixed width for consistency (same for all buttons)

                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
                // onClick={handleExportClick}
              >
                <Download sx={{ color: "white", fontSize: "20px" }} />
              </Button>
            </Tooltip>

            <Tooltip title="Reset" arrow>
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "#000080",
                  minWidth: "auto",
                  padding: "6px",
                  height: "32px", // Set a fixed height for consistency
                  width: "32px", // Set fixed width for consistency (same for all buttons)

                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "darkblue",
                  },
                }}
                onClick={() => {
                  handleResetChange(); // Call the fetchOrders function
                }}
              >
                <Refresh sx={{ color: "white", fontSize: "20px" }} />
              </Button>
            </Tooltip>

            <Typography variant="body2">
              Total Products: {productCount ? productCount : "0"}
            </Typography>
          </Box>

          {/* Table Section (Scrollable) */}
          <Box
            sx={{
              flex: 1,
              marginTop: "60px", // Adjust for fixed header space (change based on header height)
              height: "calc(100vh - 120px)", // Full height minus header (or any top bar height)
              overflowY: "auto", // Enable vertical scrolling
              overflowX: "hidden", // Prevent horizontal scrolling
              width: "100%", // Ensure it doesn't exceed the parent width
              "&::-webkit-scrollbar": {
                width: "3px", // Slightly wider scrollbar for better visibility
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "10px", // Round corners for the scrollbar thumb
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555", // Darker thumb color on hover for better UX
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1", // Track color (background of scrollbar)
                borderRadius: "10px", // Round corners for the track
              },
            }}
          >
            {/* {loading ? (
          <TableRow>
            <TableCell colSpan={7} align="center">
              <DottedCircleLoading />
            </TableCell>
          </TableRow>
          ) : ( */}

            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "85%",
                border: "1px solid #ddd",
                overflowY: "overlay",
                overflowX: "overlay",
                "&::-webkit-scrollbar": {
                  height: "2px",
                  width: "2px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "10px",
                },
              }}
            >
              <Table stickyHeader sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    {/* Render Static Column Headers */}
                    <TableCell
                      sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Image
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        backgroundColor: "#f6f6f6",
                        minWidth: 60, // The default minWidth for other columns
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        SKU
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        backgroundColor: "#f6f6f6",
                        minWidth: 210, // You can adjust this value to make it wider
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Title
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "product_title")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        minWidth: 120,
                        backgroundColor: "#f6f6f6",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Category
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "category")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Channel
                      </Typography>
                    </TableCell>
                    {/* <TableCell sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}>
          <Typography variant="subtitle2" fontWeight="bold">Published Status</Typography>
        </TableCell> */}
                    <TableCell
                      sx={{
                        textAlign: "center",
                        backgroundColor: "#f6f6f6",
                        minWidth: 90, // The default minWidth for other columns
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Quantity
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "quantity")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        minWidth: 70,
                        backgroundColor: "#f6f6f6",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Price
                        <IconButton onClick={(e) => handleOpenMenu(e, "price")}>
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ textAlign: "center", backgroundColor: "#f6f6f6" }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        Action
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && productData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <DottedCircleLoading />
                      </TableCell>
                    </TableRow>
                  ) : productData.length > 0 ? (
                    productData.map((product) => (
                      <TableRow key={product.productId} hover>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Link
                            to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                            style={{ textDecoration: "none" }}
                          >
                            <img
                              src={product.image}
                              alt="Product"
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 5,
                              }}
                            />
                          </Link>
                        </TableCell>

                        <TableCell
                          sx={{
                            textAlign: "center",
                            minWidth: 120, // Adjust the width for the SKU column
                            width: 120, // Set a fixed width (you can adjust the value)
                            wordBreak: "break-word", // Allow long words to break into the next line
                            whiteSpace: "normal", // Allow text to wrap to the next line
                            overflow: "hidden", // Hide any overflow content
                            textOverflow: "ellipsis", // Optional: shows ellipsis if the content overflows
                          }}
                        >
                          <Link
                            to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                            style={{ color: "#121212", textDecoration: "none" }}
                          >
                            {product.sku || "N/A"}
                          </Link>
                        </TableCell>

                        <TableCell sx={{ textAlign: "center" }}>
                          <Link
                            to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            <span>{product.title}</span>
                          </Link>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {product.category || "N/A"}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ width: "100px", padding: "8px" }}
                        >
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            justifyContent="center"
                            alignItems="center"
                            gap={1}
                          >
                            {product.marketplacelogo &&
                            product.marketplacelogo.length > 0 ? (
                              product.marketplacelogo.map(
                                (imageUrl, imgIndex) => (
                                  <Box
                                    key={imgIndex}
                                    sx={{
                                      width: 30,
                                      height: 30,
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                      backgroundColor: "#fff",
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`Marketplace Logo ${imgIndex}`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                      }}
                                    />
                                  </Box>
                                )
                              )
                            ) : (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ textAlign: "center" }}
                              >
                                N/A
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* <TableCell sx={{ textAlign: "center" }}>
              {product.publishedStatus || "N/A"}
            </TableCell> */}
                        <TableCell
                          sx={{ textAlign: "center", paddingLeft: "3px" }}
                        >
                          {product.quantity || 0}
                        </TableCell>
                        <TableCell
                          sx={{
                            paddingLeft: "3px",
                            textAlign: "center",
                            minWidth: 70, // Increase the width of the price column (you can adjust this value as needed)
                            width: 70, // Fixed width
                          }}
                        >
                          {product.price || "$0.00"}
                        </TableCell>

                        <TableCell sx={{ textAlign: "center" }}>
                          <Link
                            to={`/Home/products/details/${product.productId}?page=${page}&&rowsPerPage=${rowsPerPage}`}
                            style={{ textDecoration: "none" }}
                          >
                            <IconButton color="primary">
                              <EditIcon sx={{ color: "#000080" }} />
                            </IconButton>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1">
                          No data available.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                size="small"
                sx={{ minWidth: 70 }}
              >
                <MenuItem value={50}>50/page</MenuItem>
                <MenuItem value={75}>75/page</MenuItem>
                <MenuItem value={100}>100/page</MenuItem>
              </Select>

              <Pagination
                count={totalPages} // Total number of pages
                page={page} // Current page
                onChange={handlePageChange} // Change page handler
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                color="primary"
                size="small"
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
                  // setPage(1); // Reset to first page when rows per page change
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {/* Sorting for Brand */}
        {currentColumn === "product_title" && (
          <>
            <MenuItem onClick={() => handleSelectSort("product_title", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("product_title", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}

        {currentColumn === "quantity" && (
          <>
            <MenuItem onClick={() => handleSelectSort("quantity", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("quantity", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}

        {currentColumn === "category" && (
          <>
            <MenuItem onClick={() => handleSelectSort("category", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("category", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
        {/* Sorting for Price */}
        {currentColumn === "price" && (
          <>
            <MenuItem onClick={() => handleSelectSort("price", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("price", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Product Import Dialog */}
      <ProductImport open={importOpen} onClose={handleImportClose} />
    </Box>
  );
};

export default ProductTable;
