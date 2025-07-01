import React, { useState } from "react";
import { TextField, MenuItem, Radio, RadioGroup, FormControlLabel, Button, FormControl } from "@mui/material";

const FilterInventory = () => {
  const [filters, setFilters] = useState({
    search: "",
    tags: "",
    condition: "",
    category: "",
    fromDate: "",
    toDate: "",
    inventoryStatus: "available",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setFilters({
      search: "",
      tags: "",
      condition: "",
      category: "",
      fromDate: "",
      toDate: "",
      inventoryStatus: "available",
    });
  };

  return (
    <div
      style={{
        width: "300px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        fontSize: "14px", // Set font size to 14px
        height: "400px", // Set a fixed height for the scrollable area
        overflowY: "auto", // Make the container scrollable
      }}
    >
      <h3 style={{ marginBottom: "8px", color: "#333", fontSize: "14px" }}>FILTER INVENTORY</h3>
      <p style={{ fontSize: "14px", color: "#666" }}>40 inventory SKUs found</p>

      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Search inventory"
        name="search"
        value={filters.search}
        onChange={handleChange}
        style={{ marginBottom: "12px" }}
      />

      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Search Tags"
        name="tags"
        value={filters.tags}
        onChange={handleChange}
        style={{ marginBottom: "12px" }}
      />

      <TextField
        select
        fullWidth
        size="small"
        variant="outlined"
        name="condition"
        value={filters.condition}
        onChange={handleChange}
        style={{ marginBottom: "12px" }}
      >
        <MenuItem value="">All Conditions</MenuItem>
        <MenuItem value="new">New</MenuItem>
        <MenuItem value="used">Used</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        size="small"
        variant="outlined"
        name="category"
        value={filters.category}
        onChange={handleChange}
        style={{ marginBottom: "12px" }}
      >
        <MenuItem value="">All Categories</MenuItem>
        <MenuItem value="electronics">Electronics</MenuItem>
        <MenuItem value="furniture">Furniture</MenuItem>
      </TextField>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <TextField
          type="date"
          size="small"
          variant="outlined"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="date"
          size="small"
          variant="outlined"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
          fullWidth
        />
      </div>

      <FormControl component="fieldset" style={{ marginBottom: "12px" }}>
        <RadioGroup name="inventoryStatus" value={filters.inventoryStatus} onChange={handleChange}>
          <FormControlLabel value="available" control={<Radio />} label="Available" />
          <FormControlLabel value="reserved" control={<Radio />} label="Reserved" />
          <FormControlLabel value="onHand" control={<Radio />} label="On Hand" />
        </RadioGroup>
      </FormControl>

      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <Button variant="contained" color="primary" size="small">
          Apply Filter
        </Button>
        <Button variant="text" color="secondary" size="small" onClick={handleClear}>
          Clear filter
        </Button>
      </div>
    </div>
  );
};

export default FilterInventory;
