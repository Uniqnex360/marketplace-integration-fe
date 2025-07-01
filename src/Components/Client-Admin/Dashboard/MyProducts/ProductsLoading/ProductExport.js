import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import ExportIcon from '@mui/icons-material/FileDownloadOutlined';
import * as XLSX from 'xlsx';

function ProductExport({ products }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    const headers = [
      "ID", "Title", "Image URL", "Parent SKU", "Marketplace", "Category",
      "SKU Count", "Stock", "Price Start", "Price End", "COGS", "Sales For Today",
      "Sales For Today Period", "Units Sold For Today", "Units Sold For Period",
      "Refunds", "Refunds For Period", "Refunds Amount", "Refunds Amount For Period",
      "Gross Revenue", "Gross Revenue For Period", "Net Profit", "Net Profit For Period",
      "Margin", "Margin For Period", "Total Channel Fees", "Buy Box Winner ID",
      "Review Rating", "Page Views", "Page Views Percentage", "Traffic Sessions",
      "Conversion Rate", "ROI", "Inventory Status", "Tags", "Refund Rate", "ASIN",
      "Total Stock", "Fulfillment Status", "Current Price Range"
    ];

    const data = products.map(product => [
      product.id, product.title, product.imageUrl, product.parent_sku,
      product.marketplace, product.category, product.sku_count, product.stock,
      product.price_start, product.price_end, product.cogs, product.salesForToday,
      product.salesForTodayPeriod, product.unitsSoldForToday, product.unitsSoldForPeriod,
      product.refunds, product.refundsforPeriod, product.refundsAmount,
      product.refundsAmountforPeriod, product.grossRevenue, product.grossRevenueforPeriod,
      product.netProfit, product.netProfitforPeriod, product.margin, product.marginforPeriod,
      product.totalchannelFees, product.buyBoxWinnerId, product.reviewRating, product.pageViews,
      product.pageViewsPercentage, product.trafficSessions, product.conversionRate,
      product.roi, product.inventoryStatus, product.tags ? product.tags.join(', ') : '',
      product.refundRate, product.asin, product.totalStock, product.fulfillmentStatus,
      product.currentPriceRange
    ]);

    const csvRows = [headers, ...data].map(row => row.join(','));
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleClose();
  };

  const exportToXLSX = () => {
    const headers = [
      "ID", "Title", "Image URL", "Parent SKU", "Marketplace", "Category",
      "SKU Count", "Stock", "Price Start", "Price End", "COGS", "Sales For Today",
      "Sales For Today Period", "Units Sold For Today", "Units Sold For Period",
      "Refunds", "Refunds For Period", "Refunds Amount", "Refunds Amount For Period",
      "Gross Revenue", "Gross Revenue For Period", "Net Profit", "Net Profit For Period",
      "Margin", "Margin For Period", "Total Channel Fees", "Buy Box Winner ID",
      "Review Rating", "Page Views", "Page Views Percentage", "Traffic Sessions",
      "Conversion Rate", "ROI", "Inventory Status", "Tags", "Refund Rate", "ASIN",
      "Total Stock", "Fulfillment Status", "Current Price Range"
    ];

    const data = products.map(product => [
      product.id, product.title, product.imageUrl, product.parent_sku,
      product.marketplace, product.category, product.sku_count, product.stock,
      product.price_start, product.price_end, product.cogs, product.salesForToday,
      product.salesForTodayPeriod, product.unitsSoldForToday, product.unitsSoldForPeriod,
      product.refunds, product.refundsforPeriod, product.refundsAmount,
      product.refundsAmountforPeriod, product.grossRevenue, product.grossRevenueforPeriod,
      product.netProfit, product.netProfitforPeriod, product.margin, product.marginforPeriod,
      product.totalchannelFees, product.buyBoxWinnerId, product.reviewRating, product.pageViews,
      product.pageViewsPercentage, product.trafficSessions, product.conversionRate,
      product.roi, product.inventoryStatus, product.tags ? product.tags.join(', ') : '',
      product.refundRate, product.asin, product.totalStock, product.fulfillmentStatus,
      product.currentPriceRange
    ]);

    const worksheetData = [headers, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        startIcon={<ExportIcon />}
        sx={{
          textTransform: 'none',
          fontSize: '12px',
          color: '#485E75',
          borderRadius: '8px',
          fontFamily: "'Nunito Sans', sans-serif",
        }}
      >
        Export data...
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={exportToCSV} sx={{fontSize:'16px', color: '#485E75', fontFamily: "'Nunito Sans', sans-serif" }}>...as a CSV file</MenuItem>
        <MenuItem onClick={exportToXLSX} sx={{fontSize:'16px',  color: '#485E75', fontFamily: "'Nunito Sans', sans-serif"}}>...as a XLSX file</MenuItem>
      </Menu>
    </>
  );
}

export default ProductExport;