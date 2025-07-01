import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TableSortLabel,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from '@mui/material';
import { InfoOutlined} from '@mui/icons-material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

function CollapseDetail() {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    orderBy: null,
    order: 'asc',
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dummy data for keywords (replace with your actual data)
  const dummyKeywords = Array.from({ length: 0 }, (_, index) => ({
    id: index + 1,
    phrase: `Keyword ${index + 1}`,
    sales: Math.floor(Math.random() * 100),
    volume: Math.floor(Math.random() * 1000),
    cpr: `$${Math.floor(Math.random() * 50)}`,
    competingProducts: Math.floor(Math.random() * 5000),
    organicRank: Math.random() < 0.8 ? Math.floor(Math.random() * 100) : '-',
    sponsoredRank: Math.random() < 0.6 ? Math.floor(Math.random() * 50) : '-',
  }));

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = dummyKeywords.map((n) => n.id);
      setSelectedKeywords(newSelecteds);
      return;
    }
    setSelectedKeywords([]);
  };

  const handleSelectOneClick = (event, id) => {
    const selectedIndex = selectedKeywords.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedKeywords, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedKeywords.slice(1));
    } else if (selectedIndex === selectedKeywords.length - 1) {
      newSelected = newSelected.concat(selectedKeywords.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedKeywords.slice(0, selectedIndex),
        selectedKeywords.slice(selectedIndex + 1),
      );
    }

    setSelectedKeywords(newSelected);
  };

  const isKeywordSelected = (id) => selectedKeywords.indexOf(id) !== -1;

  const handleRequestSort = (property) => (event) => {
    const isAsc = sortConfig.orderBy === property && sortConfig.order === 'asc';
    setSortConfig({
      order: isAsc ? 'desc' : 'asc',
      orderBy: property,
    });

    // Implement your sorting logic here based on the property
    // For dummy data, you can do something like:
    dummyKeywords.sort((a, b) => {
      if (sortConfig.orderBy === property) {
        const valueA = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
        const valueB = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];
        if (valueA < valueB) {
          return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.order === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });
    // In a real application, you would likely fetch sorted data from your API.
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, dummyKeywords.length - (page - 1) * rowsPerPage);

  const visuallyHidden = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
  };

  const headCells = [
    { id: 'phrase', numeric: false, disablePadding: true, label: 'Keyword Phrase', tooltip: 'The exact keyword phrase' },
    { id: 'sales', numeric: true, disablePadding: false, label: 'Keyword Sales', tooltip: 'Estimated sales attributed to this keyword' },
    { id: 'volume', numeric: true, disablePadding: false, label: 'Search Volume', tooltip: 'Estimated monthly search volume for this keyword' },
    { id: 'cpr', numeric: false, disablePadding: false, label: 'CPR', tooltip: 'Cost Per Ranking - estimated cost to rank on the first page' },
    { id: 'competingProducts', numeric: true, disablePadding: false, label: 'Competing Products', tooltip: 'Number of products competing for this keyword' },
    { id: 'organicRank', numeric: true, disablePadding: false, label: 'Organic Rank', tooltip: 'Organic search position detected for that keyword(s) for the analyzed product' },
    { id: 'sponsoredRank', numeric: true, disablePadding: false, label: 'Sponsored Rank', tooltip: 'Sponsored ads position for that keyword' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        0 Keywords
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 750 }} aria-label="keyword table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedKeywords.length > 0 && selectedKeywords.length < dummyKeywords.length}
                  checked={dummyKeywords.length > 0 && selectedKeywords.length === dummyKeywords.length}
                  onChange={handleSelectAllClick}
                  inputProps={{ 'aria-label': 'select all keywords' }}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  sortDirection={sortConfig.orderBy === headCell.id ? sortConfig.order : false}
                >
                  <TableSortLabel
                    active={sortConfig.orderBy === headCell.id}
                    direction={sortConfig.orderBy === headCell.id ? sortConfig.order : 'asc'}
                    onClick={handleRequestSort(headCell.id)}
                    IconComponent={() => (
                      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                        <ArrowUpwardIcon sx={{ fontSize: 16, color: sortConfig.orderBy === headCell.id && sortConfig.order === 'asc' ? undefined : '#ccc' }} />
                        <ArrowDownwardIcon sx={{ fontSize: 16, color: sortConfig.orderBy === headCell.id && sortConfig.order === 'desc' ? undefined : '#ccc' }} />
                      </Box>
                    )}
                  >
                    {headCell.label}
                    {headCell.tooltip && (
                      <Tooltip title={headCell.tooltip} placement="right">
                        <InfoOutlined sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                    {sortConfig.orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {sortConfig.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyKeywords
              .slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isKeywordSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleSelectOneClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" padding="none">
                      {row.phrase}
                    </TableCell>
                    <TableCell align="right">{row.sales}</TableCell>
                    <TableCell align="right">{row.volume}</TableCell>
                    <TableCell align="right">{row.cpr}</TableCell>
                    <TableCell align="right">{row.competingProducts}</TableCell>
                    <TableCell align="right">{row.organicRank}</TableCell>
                    <TableCell align="right">{row.sponsoredRank}</TableCell>
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={7} />
              </TableRow>
            )}
            {dummyKeywords.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No tracked keywords
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box>
          <FormControl size="small">
            <InputLabel id="rows-per-page-label">Rows per page:</InputLabel>
            <Select
              labelId="rows-per-page-label"
              id="rows-per-page"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={dummyKeywords.length}>All</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Pagination
          count={Math.ceil(dummyKeywords.length / rowsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
}

export default CollapseDetail;