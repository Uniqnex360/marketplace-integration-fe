import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import dayjs from 'dayjs';

import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
    Box, Switch, Button, Typography, ListItemText, MenuItem, IconButton, ListItemIcon, Menu,
} from '@mui/material';
import {
    Download as DownloadIcon, Download, Delete,
    PictureAsPdf as PdfIcon,
    Remove as RemoveIcon, MoreVert
} from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DottedCircleLoading from '../../../../Loading/DotLoading';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const SalesProfitAndLoss = ({productId, widgetData, startDate,endDate}) => {
    
    const [expanded, setExpanded] = useState(null);
    const [summary, setSummary] = useState(null);
    const [graph, setGraph] = useState(null);
    const [summaryOther, setSummaryOther] = useState(null);
    const [summaryDate, setSummaryDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openNote, setOpenNote] = useState(false);
    const [events, setEvents] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    let lastParamsRef = useRef("");
    
      const [loadingBody, setLoadingBody] = useState(false);
    const openDownloadMenu = Boolean(anchorEl);
    const downloadButtonRef = useRef(null);
    const chartContainerRef = useRef(null); // Ref for the chart container
    const userData = localStorage.getItem("user");
    let userIds = "";
    if (userData) {
        const data = JSON.parse(userData);
        userIds = data.id;
    }
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleRemoveWidget = () => {
        console.log('Remove widget clicked');
        // Implement your remove widget logic here
    };

    const handleDownloadClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseDownloadMenu = () => {
        setAnchorEl(null);
    };

    const handleDownloadOptionClick = async (option) => {
        console.log(`Download option "${option}" clicked`);
        handleCloseDownloadMenu();

        if (option === 'PDF' && chartContainerRef.current) {
            setLoading(true);
            try {
                const canvas = await html2canvas(chartContainerRef.current);
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', 'a4');
                const imgWidth = pdf.internal.pageSize.getWidth() - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save(`Profit_And_Loss_${new Date().toISOString().slice(0, 10)}.pdf`);
            } catch (error) {
                console.error('Error generating PDF:', error);
            } finally {
                setLoading(false);
            }
        } else if (option === 'PNG' && chartContainerRef.current) {
            try {
                const canvas = await html2canvas(chartContainerRef.current);
                const link = document.createElement('a');
                link.download = `Profit_And_Loss_Chart_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Error generating PNG:', error);
            }
        } else if (option === 'JPEG' && chartContainerRef.current) {
            try {
                const canvas = await html2canvas(chartContainerRef.current);
                const link = document.createElement('a');
                link.download = `Profit_And_Loss_Chart_${new Date().toISOString().slice(0, 10)}.jpeg`;
                link.href = canvas.toDataURL('image/jpeg');
                link.click();
            } catch (error) {
                console.error('Error generating JPEG:', error);
            }
        } else if (option === 'CSV') {
            // Implement CSV download logic here using processedChartData and potentially summary data
            const csvData = [
                "Metric,Current,Previous,Delta",
                `Gross Revenue,<span class="math-inline">\{summary?\.grossRevenue?\.current?\.toFixed\(2\)\},</span>{summary?.grossRevenue?.previous?.toFixed(2)},${summary?.grossRevenue?.delta?.toFixed(2)}`,
                `Expenses,<span class="math-inline">\{summary?\.expenses?\.current?\.toFixed\(2\)\},</span>{summary?.expenses?.previous?.toFixed(2)},${summary?.expenses?.delta?.toFixed(2)}`,
                `Net Profit,<span class="math-inline">\{summary?\.netProfit?\.current?\.toFixed\(2\)\},</span>{summary?.netProfit?.previous?.toFixed(2)},${summary?.netProfit?.delta?.toFixed(2)}`,
                `COGS,<span class="math-inline">\{summaryOther?\.current?\.cogs?\.toFixed\(2\)\},</span>{summaryOther?.previous?.cogs?.toFixed(2)},${(summaryOther?.current?.cogs - summaryOther?.previous?.cogs)?.toFixed(2)}`,
                `Refunds,<span class="math-inline">\{summary?\.refunds?\.current\},</span>{summary?.refunds?.previous},${summary?.refunds?.delta}`,
                `Base Price,<span class="math-inline">\{summaryOther?\.current?\.base_price?\.toFixed\(2\)\},</span>{summaryOther?.previous?.base_price?.toFixed(2)},${(summaryOther?.current?.base_price - summaryOther?.previous?.base_price)?.toFixed(2)}`,
                `Giftwrap Price,<span class="math-inline">\{summaryOther?\.current?\.giftwrapPrice?\.toFixed\(2\)\},</span>{summaryOther?.previous?.giftwrapPrice?.toFixed(2)},${(summaryOther?.current?.giftwrapPrice - summaryOther?.previous?.giftwrapPrice)?.toFixed(2)}`,
                `Total Tax,<span class="math-inline">\{summaryOther?\.current?\.totalTax?\.toFixed\(2\)\},</span>{summaryOther?.previous?.totalTax?.toFixed(2)},${(summaryOther?.current?.totalTax - summaryOther?.previous?.totalTax)?.toFixed(2)}`,
                `Shipping,<span class="math-inline">\{summaryOther?\.current?\.shipping?\.toFixed\(2\)\},</span>{summaryOther?.previous?.shipping?.toFixed(2)},${(summaryOther?.current?.shipping_cost - summaryOther?.previous?.shipping_cost)?.toFixed(2)}`,
                `Shipping Chargeback,<span class="math-inline">\{summaryOther?\.current?\.shippingChargeback?\.toFixed\(2\)\},</span>{summaryOther?.previous?.shippingChargeback?.toFixed(2)},${(summaryOther?.current?.shippingChargeback - summaryOther?.previous?.shippingChargeback)?.toFixed(2)}`,
                `Giftwrap Chargeback,<span class="math-inline">\{summaryOther?\.current?\.giftwrapChargeback?\.toFixed\(2\)\},</span>{summaryOther?.previous?.giftwrapChargeback?.toFixed(2)},${(summaryOther?.current?.giftwrapChargeback - summaryOther?.previous?.giftwrapChargeback)?.toFixed(2)}`,
                // `Reimbursements,<span class="math-inline">\{summaryOther?\.current?\.reimbursements?\.toFixed\(2\)\},</span>{summaryOther?.previous?.reimbursements?.toFixed(2)},${(summaryOther?.current?.reimbursements - summaryOther?.previous?.reimbursements)?.toFixed(2)}`,
                `Amazon Fees,<span class="math-inline">\{summaryOther?\.current?\.channel_fee?\.toFixed\(2\)\},</span>{summaryOther?.previous?.channel_fee?.toFixed(2)},${(summaryOther?.current?.channel_fee - summaryOther?.previous?.channel_fee)?.toFixed(2)}`,
                // `Promo Value,<span class="math-inline">\{summaryOther?\.current?\.promoValue?\.toFixed\(2\)\},</span>{summaryOther?.previous?.promoValue?.toFixed(2)},${(summaryOther?.current?.promoValue - summaryOther?.previous?.promoValue)?.toFixed(2)}`,
                // `PPC Costs,<span class="math-inline">\{summaryOther?\.current?\.ppcCosts?\.toFixed\(2\)\},</span>{summaryOther?.previous?.ppcCosts?.toFixed(2)},${(summaryOther?.current?.ppcCosts - summaryOther?.previous?.ppcCosts)?.toFixed(2)}`,
                `Total Tax (Cost),<span class="math-inline">\{summaryOther?\.current?\.f?\.toFixed\(2\)\},</span>{summaryOther?.previous?.totalTaxCost?.toFixed(2)},${(summaryOther?.current?.totalCosts - summaryOther?.previous?.totalCosts)?.toFixed(2)}`,
                Object.keys(processedChartData[0] || {}).join(','),
                ...processedChartData.map(item => Object.values(item).join(',')),
            ].join('\n');
            const link = document.createElement('a');
            link.download = `Profit_And_Loss_Data_${new Date().toISOString().slice(0, 10)}.csv`;
            link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
            link.click();
        } else if (option === 'XLS') {
            // Implement XLS download logic here (you might need a library like xlsx)
            console.log('XLS download logic needs implementation with all data fields');
        }
    };


    const handleDownloadCSV = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}profitLossChartCsv/`, {
                    user_id: userIds,
                    preset: widgetData,
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    start_date:startDate?.format('YYYY-MM-DD'),
                    end_date:endDate?.format('YYYY-MM-DD'),
                    product_id: [productId],
                    
       
                },{
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'profitLossChart.csv');
        } catch (error) {
            console.error('CSV Download Error:', error);
        }
    };

    const handleDownloadXLS = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_IP}profitLossExportXl/`, {
                    user_id: userIds,
                   preset: widgetData,
                     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    start_date:startDate?.format('YYYY-MM-DD'),
                    end_date:endDate?.format('YYYY-MM-DD'),
                    product_id: [productId],
                },
                  {
                     responseType: 'blob',
            });
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'profitLossChart.xlsx');
        } catch (error) {
            console.error('XLS Download Error:', error);
        }
    };

    useEffect(() => {

          const currentParams = JSON.stringify({productId, widgetData, startDate,endDate
          
          })
        if (lastParamsRef.current !== currentParams) {
            lastParamsRef.current = currentParams;
          
     fetchProfitAndLossDetails();
        fetchProfitAndLossGraph();
        }
      console.log('local',productId)
    }, [productId, widgetData, startDate,endDate]);

    const fetchProfitAndLossDetails = async () => {
      setLoadingBody(true)
        try {


 const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';

    const payload = {
      product_id: productId,
      user_id: userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (widgetData) {
      payload.preset = widgetData;
    } else {
      payload.start_date = startDate?.format('YYYY-MM-DD');
      payload.end_date = endDate?.format('YYYY-MM-DD');
    }

    const paramsKey = JSON.stringify(payload);
    if (lastParamsRef.current === paramsKey) return; // Prevent duplicate fetch
    lastParamsRef.current = paramsKey;

    const response = await axios.post(
      `${process.env.REACT_APP_IP}getProfitAndLossDetailsForProduct/`,
      payload
    );

    
                console.log('response date',response.data.data)
            setSummaryDate(response.data.data.custom.dateRanges);
            setSummaryOther(response.data.data.custom.netProfitCalculation);
            console.log('lklk',response.data.data.custom.netProfitCalculation)
            setSummary(response.data.data.custom.summary);
        } catch (error) {
            console.error('Error fetching profit and loss details:', error);
        }finally {
      setLoadingBody(false)
    }
    };

    const fetchProfitAndLossGraph = async () => {
        setLoading(true)
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id || '';

    const payload = {
      user_id: userId,
      product_id: productId,
     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (widgetData) {
      payload.preset = widgetData;
    } else {
      payload.start_date = startDate?.format('YYYY-MM-DD');
      payload.end_date = endDate?.format('YYYY-MM-DD');
    }

    const response = await axios.post(
      `${process.env.REACT_APP_IP}profitlosschartForProduct/`,
      payload
    );
            setGraph(response.data.data.graph);
        } catch (error) {
            console.error('Error fetching profit and loss graph:', error);
        } finally {
            setLoading(false)
        }
    };


// Extracting dates
const fromDate = summaryDate?.current?.from;
const toDate = summaryDate?.current?.to;

// Format only the exact UTC date — no time zone conversion
const formattedCurrentDate = fromDate
  ? dayjs.utc(fromDate).format('MMM DD, YYYY')
  : '';

const formattedDateRange = fromDate && toDate
  ? `${dayjs.utc(fromDate).format('MMM DD, YYYY')} - ${dayjs.utc(toDate).format('MMM DD, YYYY')}`
  : '';

  
    const xAxisTickFormatter = (value) => {
        const dateObj = dayjs(value);
        const today = dayjs().format("YYYY-MM-DD");
        const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
        const valueDate = dateObj.format("YYYY-MM-DD");

        if ((valueDate === today && widgetData === 'Today') ||
            (valueDate === yesterday && widgetData === 'Yesterday')) {
            return dateObj.format('HH:mm');
        }

        return dateObj.format('MMM D');
    };

    const calculateTicks = () => {
        if (!processedChartData || processedChartData.length === 0) {
            return [];
        }

        if (widgetData === 'Today' || widgetData === 'Yesterday') {
            const timestamps = processedChartData.map(item => item.date);
            const minTime = dayjs(Math.min(...timestamps));
            const maxTime = dayjs(Math.max(...timestamps));
            const diffHours = maxTime.diff(minTime, 'hour');
            const interval = Math.ceil(diffHours / 6) || 4;

            const ticks = [];
            for (let i = 0; i <= 24; i += interval) {
                const tickTime = minTime.add(i, 'hour').valueOf();
                if (tickTime >= minTime.valueOf() && tickTime <= maxTime.valueOf()) {
                    ticks.push(tickTime);
                }
            }
            return ticks.filter((v, i, a) => a.indexOf(v) === i);
        } else {
            const uniqueDates = [...new Set(processedChartData.map(item => dayjs(item.date).format('YYYY-MM-DD')))];
            if (uniqueDates.length <= 5) {
                return processedChartData.map(item => item.date);
            } else {
                const interval = Math.ceil(uniqueDates.length / 5);
                return uniqueDates.filter((date, index) => index % interval === 0).map(dateStr => dayjs(dateStr).valueOf());
            }
        }
    };

    const yAxisTickFormatter = (value) => {
        return `$${value}`;
    };

    const yAxisUnitsTickFormatter = (value) => {
        return value;
    };

    const processedChartData = graph?.length > 0
        ? Object.keys(graph[0].values).map(key => {
            const dataPoint = { date: new Date(key).getTime() };
            graph.forEach(item => {
                dataPoint[item.metric] = item.values[key];
            });
            return dataPoint;
        })
        : [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dateObj = dayjs(label);
            const today = dayjs().format("YYYY-MM-YYYY-MM-DD");
            const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
            const valueDate = dateObj.format("YYYY-MM-DD");

            const isTodayOrYesterday =
                (valueDate === today && widgetData === 'Today') ||
                (valueDate === yesterday && widgetData === 'Yesterday');

            const dateLabel = isTodayOrYesterday
                ? (
                    <>
                        {dateObj.format('MMM D')} (<span>{dateObj.format('HH:mm')}</span>)
                    </>
                )
                : dateObj.format('MMM DD, YY');

            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', width: '230px', border: '1px solid #ccc' }}>
                    <p className="label" style={{ margin: '0 0 8px 0' }}>{dateLabel}</p>
                    {payload.map((item, index) => (
                        <div
                            key={`item-${index}`}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', color: '#485E75' }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: item.color,
                                    marginRight: '6px'
                                }} />
                                {formatMetricName(item.name)}
                            </span>
                            <span style={{ color: '#000', fontWeight: 'bold' }}>
                                {item.name === 'units' ? item.value : `$${item.value?.toFixed(2)}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    function formatMetricName(metric) {
        switch (metric) {
            case "grossRevenue": return "Gross Revenue";
            case "estimatedPayout": return "Estimated Payout";
            case "expenses": return "Expenses";
            case "netProfit": return "Net Profit";
            case "units": return "Units Sold";
            case "ppcSales": return "PPC Sales";
            default: return metric;
        }
    }

    const summaryData = [
      { label: "Base Price", value: `$${summaryOther?.current?.base_price?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.base_price - summaryOther?.previous?.base_price)?.toFixed(2) },
      // { label: "Giftwrap Price", value: `$${summaryOther?.current?.giftwrapPrice?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.giftwrapPrice - summaryOther?.previous?.giftwrapPrice)?.toFixed(2) },
      { label: "Total Tax", value: `$${summaryOther?.current?.totalTax?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.totalTax - summaryOther?.previous?.totalTax)?.toFixed(2) },
      { label: "Shipping", value: `$${summaryOther?.current?.shipping_cost?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.shipping_cost - summaryOther?.previous?.shipping_cost)?.toFixed(2) },
      // { label: "Shipping Chargeback", value: `$${summaryOther?.current?.shippingChargeback?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.shippingChargeback - summaryOther?.previous?.shippingChargeback)?.toFixed(2) },
      // { label: "Giftwrap Chargeback", value: `$${summaryOther?.current?.giftwrapChargeback?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.giftwrapChargeback - summaryOther?.previous?.giftwrapChargeback)?.toFixed(2) },
      { label: "Gross Revenue", value: `$${summary?.grossRevenue?.current?.toFixed(2) ?? '0.00'}`, delta: summary?.grossRevenue?.delta?.toFixed(2) },
      // { label: "Reimbursements", value: `$${summaryOther?.current?.reimbursements?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.reimbursements - summaryOther?.previous?.reimbursements)?.toFixed(2) },
      { label: "Amazon Fees", value: `$${summaryOther?.current?.channel_fee?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.channel_fee - summaryOther?.previous?.channel_fee)?.toFixed(2) },
      { label: "Refunds", value: `$${summaryOther?.current?.productRefunds?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.productRefunds - summaryOther?.previous?.productRefunds)?.toFixed(2) },
      // { label: "Promo Value", value: `$${summaryOther?.current?.promoValue?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.promoValue - summaryOther?.previous?.promoValue)?.toFixed(2) },
      // { label: "Estimated Payout", value: `$${summary?.netProfit?.current?.estimatedPayout?.toFixed(2) ?? '0.00'}`},
      { label: "COGS", value: `$${summaryOther?.current?.cogs?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.cogs - summaryOther?.previous?.cogs)?.toFixed(2) },
      // { label: "PPC Costs", value: `$${(summaryOther?.current?.ppcProductCost + summaryOther?.current?.ppcBrandsCost + summaryOther?.current?.ppcDisplayCost + summaryOther?.current?.ppcStCost)?.toFixed(2) ?? '0.00'}`, delta: ((summaryOther?.current?.ppcProductCost + summaryOther?.current?.ppcBrandsCost + summaryOther?.current?.ppcDisplayCost + summaryOther?.current?.ppcStCost) - (summaryOther?.previous?.ppcProductCost + summaryOther?.previous?.ppcBrandsCost + summaryOther?.previous?.ppcDisplayCost + summaryOther?.previous?.ppcStCost))?.toFixed(2) },
      { label: "Total Tax (Cost)", value: `$${summaryOther?.current?.totalCosts?.toFixed(2) ?? '0.00'}`, delta: (summaryOther?.current?.totalCosts - summaryOther?.previous?.totalTaxWithheld)?.toFixed(2) },
      { label: "Expenses", value: `$${summary?.expenses?.current?.toFixed(2) ?? '0.00'}`, delta: summary?.expenses?.delta?.toFixed(2) },
      { label: "Net Profit", value: `$${summary?.netProfit?.current?.toFixed(2) ?? '0.00'}`, delta: summary?.netProfit?.delta?.toFixed(2) },
  ];

    const getCircleColor = (label) => {
        if (label === "Gross Revenue") return "rgb(106, 42, 192)";
        if (label === "Expenses") return "red";
        if (label === "Net Profit" || label === "Estimated Payout") return "green";
        return "transparent";
    };

  const getFontSize = (label) => {
    return (label === "Gross Revenue" || label === "Expenses" || label === "Net Profit") ? "16px" : "14px";
  };

  const getFontColor = (label) => {
    return (label === "Gross Revenue" || label === "Expenses" || label === "Net Profit") ? "rgb(19, 25, 31)" : "rgb(72, 94, 117)";
  };

  const toggleExpansion = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const hasUnits = graph?.some(g => g.metric === 'units');
  const hasOtherMetrics = graph?.some(g => g.metric !== 'units');

  return (
    <div style={{ padding: "20px", fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff", margin: "15px 0px 15px 0px" }}>
     {loadingBody ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, width: '100%' }}>
          <DottedCircleLoading />
        </Box>
      ) : (<Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom={2}>
        <Box sx={{ marginTop: '-30px' }}>
          <h3 style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: "15px", color: "#19232E" }}>P&L</h3>
   <Typography sx={{marginBottom: "15px", color:'#485E75', fontSize: '14px', mb: 0.5 }}>
                               {widgetData === 'Today' || widgetData === 'Yesterday'
                                   ? formattedCurrentDate
                                   : formattedDateRange}
                           </Typography>       </Box>
        <Box display="flex" alignItems="center" gap={2}>
     
        
             <Box>
            <IconButton
              aria-label="download"
              size="small"
              onClick={handleDownloadClick}
              ref={downloadButtonRef}
            >
              <MoreVert />
            </IconButton>
            <Menu
              id="download-menu"
              anchorEl={anchorEl}
              open={openDownloadMenu}
              onClose={handleCloseDownloadMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ borderBottom: '1px solid #ddd' }}>
                <MenuItem    sx={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: 14,
                            }} onClick={() => handleDownloadOptionClick('PNG')}>
                  <ListItemIcon>
                  <ImageIcon sx={{ width:'18px', height: '18px' , paddingRight:'3px'}} />

                  </ListItemIcon>
                  <ListItemText primary="Download PNG image" />
                </MenuItem>
                <MenuItem   sx={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: 14,
                            }} onClick={() => handleDownloadOptionClick('JPEG')}>
                  <ListItemIcon>
                    <ImageIcon sx={{ width:'18px', height: '18px' , paddingRight:'3px'}} />
                  </ListItemIcon>
                  <ListItemText primary="Download JPEG image" />
                </MenuItem>
                <MenuItem    sx={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: 14,
                            }} onClick={() => handleDownloadOptionClick('PDF')}>
                  <ListItemIcon sx={{fontSize:'14px'}}>
                    <PdfIcon sx={{ width:'18px', height: '18px' , paddingRight:'-7px'}}/>
                  </ListItemIcon>
                  <ListItemText primary="Download PDF document" />
                </MenuItem>
              </Box>
              <Box sx={{ borderBottom: '1px solid #ddd' }}>
                <MenuItem  onClick={() => {
                                handleDownloadCSV();
                                handleClose();
                            }}
                            sx={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: 14,
                            }}>
                  <ListItemIcon>
                    <InsertDriveFileIcon sx={{ width:'18px', height: '18px' , paddingRight:'3px'}}/>
                  </ListItemIcon>
                  <ListItemText primary="Download CSV" />
                </MenuItem>
                <MenuItem onClick={() => {
                                handleDownloadXLS();
                                handleClose();
                            }}
                            sx={{
                                color: '#485E75',
                                fontFamily: "'Nunito Sans', sans-serif",
                                fontSize: 14,
                            }}>
                  <ListItemIcon>
                    <Download sx={{ width:'18px', height: '18px' , paddingRight:'3px'}} />
                  </ListItemIcon>
                  <ListItemText primary="Download XLS" />
                </MenuItem>
              </Box>
              <MenuItem onClick={handleRemoveWidget}>
                <ListItemIcon>
                  <Delete sx={{ width:'18px', height: '18px' , paddingRight:'3px'}}/>
                </ListItemIcon>
                <ListItemText primary="Remove" />
              </MenuItem>
            </Menu>
          </Box>
          </Box>
          </Box>
  
    
        <div style={{ display: "flex", flexDirection: "row", alignItems: 'flex-start' }}>
      <div style={{
  width: "35%",
  paddingRight: "20px",
  maxHeight: 400,
  overflowX: 'hidden',
  borderRight: "1px solid lightgray",
  overflowY: "auto",
  paddingRight: "0.5em", /* Use em for better responsiveness */
  scrollbarWidth: 'thin', /* For Firefox */
  "&::-webkit-scrollbar": {
    width: "1px", /* Reduce the overall width */
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgb(212, 219, 225)',
    borderRadius: 10,
    minHeight: 4,
    '&:hover': {
      backgroundColor:'rgb(189, 198, 207)',
    },
    '&:active': {
      backgroundColor: 'rgb(161, 180, 201)',
    },
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#555",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "8px",
  },
}}>
            <div>
              {summaryData.map((item, idx) => (
                <div key={idx} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: getCircleColor(item.label),
                          display: "inline-block",
                          marginRight: "8px",
                        }}
                      />
                      <span style={{ color: getFontColor(item.label) }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: "bold", color: "#19232E" }}>{item.value}</span>
                  </div>
                  {expanded === idx && item.delta !== undefined && (
                    <div style={{ marginLeft: "18px", marginTop: "8px", color: "#637381", fontSize: "0.9em" }}>
                      <span>Change: </span>
                      <span style={{ color: item.delta < 0 ? "red" : "green" }}>
                        {item.delta < 0 ? `-${Math.abs(item.delta).toFixed(2)}` : `+${Math.abs(item.delta).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

           <div style={{ width: "65%", height: '450px' }} ref={chartContainerRef}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedChartData} margin={{ top: 10, right: hasUnits ? 50 : 30, left: 0, bottom: 30 }}>
                <CartesianGrid horizontal={true} vertical={false} stroke="#ccc" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  padding={{ left: 20, right: 20 }}
                  tickFormatter={xAxisTickFormatter}
                  axisLine={true}
                  tickLine={false}
                  ticks={calculateTicks()}
                  />
                  {hasOtherMetrics && (
                    <YAxis
                      tickFormatter={yAxisTickFormatter}
                      axisLine={false}
                      tickLine={false}
                      yAxisId="left"
                    />
                  )}
                  {hasUnits && (
                    <YAxis
                      tickFormatter={yAxisUnitsTickFormatter}
                      axisLine={false}
                      tickLine={false}
                      orientation="right"
                      yAxisId="right"
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  {graph?.find(g => g.metric === 'grossRevenue') && <Line type="monotone" dataKey="grossRevenue" strokeWidth={2}  stroke="#6F42C1" name="Gross Revenue" dot={false} activeDot={{ r: 5 }} yAxisId="left" />}
                  {/* {graph?.find(g => g.metric === 'estimatedPayout') && <Line type="monotone" dataKey="estimatedPayout" stroke="#0DCAF0" name="Estimated Payout" dot={false} activeDot={{ r: 5 }} yAxisId="left" />} */}
                  {graph?.find(g => g.metric === 'expenses') && <Line type="monotone" dataKey="expenses" strokeWidth={2}  stroke="#DC3545" name="Expenses" dot={false} activeDot={{ r: 5 }} yAxisId="left" />}
                  {graph?.find(g => g.metric === 'netProfit') && <Line type="monotone" dataKey="netProfit" strokeWidth={2}  stroke="#198754" name="Net Profit" dot={false} activeDot={{ r: 5 }} yAxisId="left" />}
                  {graph?.find(g => g.metric === 'units') && <Line type="monotone" dataKey="units" strokeWidth={2}  stroke="#b8b8ff" name="Units Sold" dot={false} activeDot={{ r: 5 }} yAxisId="right" />}
                  {graph?.find(g => g.metric === 'ppcSales') && <Line type="monotone" dataKey="ppcSales" strokeWidth={2}  stroke="#49beaa" name="PPC Sales" dot={false} activeDot={{ r: 5 }} yAxisId="left" />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
      </Box>
    )}
      </div>
    );
  };
  
  export default SalesProfitAndLoss;