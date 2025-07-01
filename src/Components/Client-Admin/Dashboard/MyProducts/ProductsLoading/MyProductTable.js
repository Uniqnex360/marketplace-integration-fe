import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Tooltip as MuiTooltip,
} from '@mui/material';
// import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {  useNavigate } from "react-router-dom";
import TabsOverview from '../CollapseDetial/TabsOverview';
import ProductCell from './ProductCell';
import CustomizeTooltip from '../../../CustomTooltip/CustomTooltip';
import ProductCellParent from './ProductCellParent';


const MyProductTable = ({ products, visibleColumns, onSort, isParentType, imageSize }) => {
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({}); // Change to an object
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  localStorage.removeItem('selectedCategory');
  const [sortOrderValue, setSortOrderValue] = useState(1);
  // const initialPage = parseInt(queryParams.get('page'), 10) || 1;
  // const [page, setPage] = useState(initialPage);
  const [sortState, setSortState] = useState({ column: '', order: '' });
  const initialPage = parseInt(queryParams.get('page'), 10) || 1; // Default to 0 if no page param exists
  const [page, setPage] = useState(initialPage);
  const initialRowsPerPage = parseInt(queryParams.get('rowsPerPage'), 10) || 50; // Default to 50 if no rowsPerPage param exists

  const handleExpandClick = (id) => {
    setExpandedRows(prevExpandedRows => ({
      ...prevExpandedRows,
      [id]: !prevExpandedRows[id], // Toggle the expansion state for the specific ID
    }));
    console.log("Expanded item ID:", id);
  };

  const handleSort = (col, order) => {
    console.log(isParentType, 'jjjjj');
    setSortState({ column: col, order: order });
    let sortByValue = order === 1 ? 1 : -1;
    let sortByName = '';
    switch (col) {
      case 'Price':
        sortByName = 'price';
        break;
      case 'Sales Today':
        sortByName = 'salesForToday';
        break;
      case 'Units Sold':
        sortByName = 'unitsSoldForToday';
        break;
      case 'Refunds (Units)':
        sortByName = 'refunds';
        break;
      case 'Refunds($)':
        sortByName = 'refundsAmount';
        break;
      case 'Refund Rate':
        sortByName = 'refundRate';
        break;
      case 'Unit Session %':
        sortByName = 'conversionRate'; // Assuming conversionRate is used for Unit Session %
        break;
      case 'Gross Revenue':
        sortByName = 'grossRevenue';
        break;
      case 'Net Profit':
        sortByName = 'netProfit';
        break;
      case 'Profit Margin':
        sortByName = 'margin';
        break;
      case 'Amazon Fees':
        sortByName = 'totalAmazonFees';
        break;
      case 'COGS':
        sortByName = 'cogs';
        break;
      default:
        sortByName = '';
        break;
    }

    if (sortByName && onSort) {
      onSort({ sortBy: sortByName, sortByValue: sortByValue });
    }
    console.log("Sort Column:", col, "Order:", order, "Sort By Name:", sortByName, "Sort By Value:", sortByValue);
  };
  const handleProductCellClick = (asin) => {
    setExpandedRows(prev => ({
      ...prev,
      [asin]: !prev[asin],
    }));
  };

  // const ExpandedProductInfo = ({ asin }) => {
  //   return (
  //     <Box
  //       sx={{
  //         padding: 2,
  //         borderRadius: '8px',
  //         marginTop: '8px',
  //         position: 'sticky',
  //         top: 56, // Adjust based on your header height
  //         zIndex: 2,
  //         bgcolor: '#fff', // Important to prevent transparent overlap
  //       }}
  //     >
  //       <TabsOverview productId={asin} />
  //     </Box>
  //   );
  // };

  const allColumns = [
    'Products',
    'Insights',
    'Tags',
    'New Keyword Suggestions',
    'Alerts',
    'Keywords Average Rank',
    'of Organic Keywords in Top 10',
    'of Sponsored Keywords in Top 10',
    'Category & Subcategory BSR',
    'Rating & Reviews',
    'Days of Inventory',
    'Stock',
    'Price',
    'Coupon',
    'Sales Today',
    'Units Sold',
    'Refunds (Units)',
    'Refunds($)',
    'Page Views',
    'Page Views Rate',
    'Sessions',
    'TACoS',
    'Buy Box',
    'Conversion Rate',
    'Gross Revenue',
    'Net Profit',
    'Refund Rate',
    'Profit Margin',
    'Amazon Fees',
    'ROI',
    'COGS',
    'Ad Spend',
    'Ad Impressions',
    'Ad Click',
    'Ad Rate',
    'ACoS',
    'RoAS',
    'Ads Total Sales',
  ];

  const columnTooltips = {
    Insights: 'Available insights for this product',
    'Refunds Rate': 'Refund Rate during the selected date range',
    'Profit Margin': 'Profit margin for the selected date range.',
    'Units Sold': 'The number of units sold during the selected period.',
    'Refunds (Units)': 'The total number of units refunded.',
    'Refunds($)': 'The total monetary value of refunds.',
    'Buy Box': 'Indicates who currently holds the Buy Box for the product.',
    'Gross Revenue': 'Total revenue before deducting any expenses.',
    'Sessions': 'The number of visits to the product detail page.',
    'Conversion Rate': 'The percentage of sessions that resulted in a sale.',
    'Alerts': 'Any active alerts related to the product.',
    'Rating & Reviews': 'The average product rating and number of reviews.',
    'Days of Inventory': 'The estimated number of days the current stock will last.',
    'Stock': 'The total number of units currently in stock.',
    'Sales Today': 'The total sales for the current day.',
    'Net Profit': 'The profit remaining after all expenses are deducted.',
    'Amazon Fees': 'The total fees charged by Amazon.',
    'ROI': 'Return on Investment.',
    'COGS': 'Cost of Goods Sold.',
    'Page Views': 'The number of times the product page was viewed.',
    'Page Views Rate': 'The rate of product page views.',
    'Unit Session %': 'The percentage of sessions that resulted in a unit being sold.',
    'Refund Rate': 'The rate of refunds.',
    'Category & Subcategory BSR': 'Best Seller Rank within the product category and subcategory.',
  };


  const sortableColumns = [
    'Price',
    'Sales Today',
    'Units Sold',
    'Refunds (Units)',
    'Refunds($)',
    'Refund Rate',
    'Unit Session %',
    'Gross Revenue',
    'Net Profit',
    'Profit Margin',
    'Amazon Fees',
    'COGS'
  ];

  const handleSortdown = () => {
    setSortOrderValue(-1);
  };
  const handleSortup = () => {
    setSortOrderValue(1);
  };
  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 'none',
        maxHeight: '500px',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <Table size="small" stickyHeader style={{ marginTop: '8px' }}>
        <TableHead>
          <TableRow>
            {visibleColumns.map((col, index) => (
              <TableCell
                key={col}
                sx={{
                  fontSize: '12px',
                  color: '#485E75',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  backgroundColor: '#f8f9fa',
                  top: 0,
                  zIndex: col === 'Products' ? 3 : 1,
                  position: 'sticky',
                  left: col === 'Products' ? 0 : undefined,
                  minWidth: col === 'Products' ? '300px' : 'auto',
                  maxWidth: col === 'Products' ? '600px' : 'auto',
                  width: 'auto',
                  boxShadow: col === 'Products' ? '1px 0 0 0 #e0e0e0' : 'none',
                }}
              >
                <Box display="flex" alignItems="center">
                  {col}
                  {sortableColumns.includes(col) && (
                    <Tooltip title={columnTooltips[col] || ''}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                        <FontAwesomeIcon
                          icon={faSortUp}
                          onClick={() => handleSort(col, 1)}
                          style={{
                            marginBottom: '-10px',
                            height: '15px',
                            width: '25px',
                            color:
                              sortState.column === col && sortState.order === 1
                                ? '#1E88E5'
                                : '#A0C4FF',
                            cursor: 'pointer',
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faSortDown}
                          onClick={() => handleSort(col, -1)}
                          style={{
                            height: '15px',
                            width: '25px',

                            color:
                              sortState.column === col && sortState.order === -1
                                ? '#1E88E5'
                                : '#A0C4FF',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>


        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              width: '100%',
              height: '100%',
            }}
          >
            <Box>Loading...</Box>
          </Box>
        ) : (
          <TableBody>
            {products.map((row) => {
              const isExpanded = expandedRows[isParentType === 'parent' ? row.id : row.asin];

              return (
                <React.Fragment key={isParentType === 'parent' ? row.id : row.asin}>
                  <TableRow>
                    {visibleColumns.map((col) => {
                      const baseCellStyle = {
                        fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
                        fontSize: '14px',
                        color: '#2B3948',
                        position: 'sticky',
                        left: col === 'Products' ? 0 : undefined,
                        backgroundColor: col === 'Products' ? '#fff' : 'inherit',
                        zIndex: col === 'Products' ? 2 : 0,
                        minWidth: col === 'Products' ? '400px' : 'auto',
                        maxWidth: col === 'Products' ? '700px' : 'auto',
                        width: 'auto',
                        boxShadow: col === 'Products' ? '1px 0 0 0 #e0e0e0' : 'none',
                      };

                      return (
                        
                        <TableCell key={col} sx={baseCellStyle} >
                          {col === 'Products' ? (
                            isParentType === 'parent' ? (
                              <ProductCellParent
                                id={row.id}
                                title={row.title}
                                asin={row.product_id}
                                sku={row.parent_sku}
                                skuInfo={row.skuInfo || []}
                                image={row.imageUrl}
                                skuCount={row.sku_count}
                                imageSize={imageSize}
                                page={page}
                                rowsPerPage={initialRowsPerPage}
                                isExpanded={expandedRows[row.id]} // Use the ID for parent expansion
                                onExpand={() => handleExpandClick(row.id)} // Use the ID for parent expansion
                              />
                            ) : (
                              isParentType === 'sku' && (
                                <ProductCell
                                  id={row.id}
                                  title={row.title}
                                  asin={row.product_id}
                                  sku={row.parent_sku}
                                  skuInfo={row.skuInfo || []}
                                  image={row.imageUrl}
                                  skuCount={row.sku_count}
                                  imageSize={imageSize}
                                   page={page}
                                  rowsPerPage={initialRowsPerPage}
                                  isExpanded={expandedRows[row.asin]} // Use asin for SKU expansion
                                  onExpand={() => handleExpandClick(row.asin)} // Use asin for SKU expansion
                                />
                              )
                            )
                          )
                            : col === 'Gross Revenue' ? (

                              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                <span>{row.grossRevenue ? row.grossRevenue : '0'}</span>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    color: row.grossRevenueforPeriod < 0 ? 'red' : 'rgb(51, 204, 153)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >

                                  {Math.abs(row.grossRevenueforPeriod || 0)}
                                  {row.grossRevenueforPeriod < 0 ? <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                    : <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                  } {/* arrow icon */}
                                </span>

                              </div>
                            ) : col === 'Sessions' ? (
                              row.trafficSessions
                            ) : col === 'Conversion Rate' ? (
                              row.conversionRate
                            ) : col === 'Insights' ? (
                              <Box>{/* Insights data */}</Box>
                            ) : col === 'Alerts' ? (
                              'N/A'
                            ) : col === 'Rating & Reviews' ? (
                              row.reviewRating
                            ) : col === 'Buy Box' ? (
                              row.buyBoxWinnerId
                            ) : col === 'Days of Inventory' ? (
                              row.inventoryStatus
                            ) : col === 'Stock' ? (
                              `${row?.stock ?? '0'} In Stock`
                            ) : col === 'Price' ? (
                              row?.price
                            ) :

                              col === 'Sales Today' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                  <span>${row.salesForToday ? row.salesForToday : '0.00'}</span>
                                  {/* <span>{row.salesForTodayPeriod}</span> */}
                                </div>
                              )
                                : col === 'Units Sold' ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                    <span>{row.unitsSoldForToday ? row.unitsSoldForToday : '0.00'}</span>

                                    <span
                                      style={{
                                        fontSize: '12px',
                                        color: row.unitsSoldForPeriod < 0 ? 'red' : 'rgb(51, 204, 153)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >
                                      {Math.abs(row.unitsSoldForPeriod || 0)}
                                      {row.unitsSoldForPeriod < 0 ? (
                                        <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                      ) : (
                                        <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                      )}
                                    </span>

                                  </div>

                                ) : col === 'Refunds (Units)' ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                    <span>{row.refunds ? row.refunds : '0'}</span>
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        color: row.refundsforPeriod < 0 ? 'red' : 'rgb(51, 204, 153)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                      }}
                                    >

                                      {Math.abs(row.refundsforPeriod || 0)}
                                      {row.refundsforPeriod < 0 ? <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                        : <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                      } {/* arrow icon */}
                                    </span>

                                  </div>
                                ) :
                                  col === 'Refunds($)' ? (

                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                      <span>${row.refundsAmount ? row.refundsAmount : '0.00'}</span>

                                      <span
                                        style={{
                                          fontSize: '12px',
                                          color: row.refundsAmountforPeriod < 0 ? 'red' : 'rgb(51, 204, 153)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                      >
                                        $ {Math.abs(row.refundsAmountforPeriod || 0)}
                                        {row.refundsAmountforPeriod < 0 ? (
                                          <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                        ) : (
                                          <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                        )}
                                      </span>

                                    </div>
                                  ) : col === 'Refund Rate' ? (
                                    <span> {row.refundRate}</span>
                                  ) : col === 'Net Profit' ? (


                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                      <span>${row.netProfit ? row.netProfit : '0.00'}</span>
                                      <span
                                        style={{
                                          fontSize: '12px',
                                          color: row.netProfitforPeriod < 0 ? 'red' : 'rgb(51, 204, 153)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                      >
                                        $ {Math.abs(row.netProfitforPeriod || 0)}
                                        {row.netProfitforPeriod < 0 ? (
                                          <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                        ) : (
                                          <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                        )}
                                      </span>

                                    </div>

                                  ) : col === 'Profit Margin' ? (

                                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                                      {/* Display main margin */}
                                      <span>{row.margin ? row.margin : '0.00%'}</span>

                                      {/* Calculate and display margin change with arrow */}
                                      <span
                                        style={{
                                          fontSize: '12px',
                                          color: parseFloat(row.marginforPeriod) < 0 ? 'red' : 'rgb(51, 204, 153)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                      >
                                        {Math.abs(parseFloat(row.marginforPeriod || '0')).toFixed(2)}%
                                        {parseFloat(row.marginforPeriod) < 0 ? (
                                          <ArrowDownwardIcon sx={{ color: 'red', fontSize: 14 }} />
                                        ) : (
                                          <ArrowUpwardIcon sx={{ color: 'rgb(51, 204, 153)', fontSize: 14 }} />
                                        )}
                                      </span>
                                    </div>

                                  ) : col === 'Amazon Fees' ? (

                                    <span>{Math.round(row.totalAmazonFees || 0)}</span>
                                  ) : col === 'ROI' ? (
                                    row.roi
                                  ) : col === 'COGS' ? (
                                    <span>{Math.round(row.cogs || 0)}</span>


                                  ) : col === 'Page Views' ? (
                                    row.pageViews
                                  ) : col === 'Page Views Rate' ? (
                                    row.pageViewsPercentage
                                  ) : col === 'Unit Session %' ? (
                                    row.conversionRate
                                  ) :
                                    col === 'ListingScore' ? (
                                      row.listingScore)
                                      :
                                      col === 'Fulfilment status' ? (
                                        row.fulfillmentChannel)
                                        :
                                        col === 'current price Range' ? (
                                          `$${parseFloat(row.price_start || 0).toFixed(2)}-$${parseFloat(row.price_end || 0).toFixed(2)}`

                                        )
                                          : col === 'Category & Subcategory BSR' ? (
                                            <CustomizeTooltip title={row.subcategoriesBsr}>
                                              <span
                                                style={{
                                                  fontSize: '14px',
                                                  color: row.category ? '#0A6FE8' : '#2B3948', // blue if value exists, black if N/A
                                                  fontWeight: row.category ? '600' : '400',
                                                }}
                                              >
                                                {row.category ? row.category : 'N/A'}
                                              </span>
                                            </CustomizeTooltip>
                                          ) : allColumns.includes(col) && row.hasOwnProperty(col.replace(/ /g, '')) ? (
                                            row[col.replace(/ /g, '')]
                                          ) : (
                                            'N/A'
                                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
        {isExpanded && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} sx={{ padding: 0, border: 'none' }}>
                  <Box
                    sx={{
                      width: '100%',
                      overflowX: 'auto',
                      background: '#fafafa',
                      borderTop: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ minWidth: '1200px', padding: 2 }}>
                      <TabsOverview productId={row.id} />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            )}
                </React.Fragment>
              );
            })}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
};

export default MyProductTable;