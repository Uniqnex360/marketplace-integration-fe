import React, { useEffect, useState } from 'react';
import axios from "axios";
import dayjs from 'dayjs';
import { format, parseISO } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ProfitAndLoss = ({ widgetData, marketPlaceId, brand_id, product_id, manufacturer_name, fulfillment_channel }) => {
  const [expanded, setExpanded] = useState(null);
  const [summary, setSummary] = useState(null);
  const [graph, setGraph] = useState(null);
  const [summaryOther, setSummaryOther] = useState(null);
  const [summaryDate, setSummaryDate] = useState(null);

  useEffect(() => {
    fetchProfitAndLossDetails();
    fetchProfitAndLossGraph();
  }, [marketPlaceId, widgetData, brand_id, product_id, manufacturer_name, fulfillment_channel]);

  const fetchProfitAndLossDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getProfitAndLossDetails/`, {
        params: {
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
        }
      }
      );
      setSummaryDate(response.data.custom.dateRanges);
      setSummaryOther(response.data.custom.netProfitCalculation);
      setSummary(response.data.custom.summary);
    } catch (error) {
      console.error('Error fetching profit and loss details:', error);
    }
  };

  const fetchProfitAndLossGraph = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}profit_loss_chart/`, {
        params: {
          preset: widgetData,
          marketplace_id: marketPlaceId.id,
          brand_id: brand_id,
          product_id: product_id,
          manufacturer_name: manufacturer_name,
          fulfillment_channel: fulfillment_channel,
        }
      }
      );
      setGraph(response.data.graph);
    } catch (error) {
      console.error('Error fetching profit and loss graph:', error);
    }
  };

  if (!summary) {
    return <div>Loading...</div>;
  }

  const fromDate = format(parseISO(summaryDate?.current?.from), 'MMM dd');
  const toDate = format(parseISO(summaryDate?.current?.to), 'MMM dd');

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

  const yAxisTickFormatter = (value) => {
    const isUnits = graph?.some(series => series.metric === "units" && Object.values(series.values).includes(value));
    return isUnits ? value : `$${value}`;
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
      const today = dayjs().format("YYYY-MM-DD");
      const yesterday = dayjs().subtract(1, 'day').format("YYYY-MM-DD");
      const valueDate = dateObj.format("YYYY-MM-DD");

      const dateLabel =
        (valueDate === today && widgetData === 'Today') ||
          (valueDate === yesterday && widgetData === 'Yesterday')
          ? `${dateObj.format('MMM D')} (${dateObj.format('HH:mm')})`
          : dateObj.format('MMM D');

      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{dateLabel}</p>
          {payload.map((item, index) => (
            <p key={`item-${index}`} style={{ color: item.color }}>
              {formatMetricName(item.name)} : {item.name === 'units' ? item.value : `$${item.value.toFixed(2)}`}
            </p>
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
    { label: "Gross Revenue", value: `$${summary?.grossRevenue?.current?.toFixed(2)}`, delta: summary?.grossRevenue?.delta },
    { label: "Expenses", value: `$${summary?.expenses?.current?.toFixed(2)}`, delta: summary?.expenses?.delta },
    { label: "Margin", value: `${summary?.margin?.current?.toFixed(2)}%`, delta: summary?.margin?.delta },
    { label: "Net Profit", value: `$${summary?.netProfit?.current?.toFixed(2)}`, delta: summary?.netProfit?.delta },
    { label: "Cogs", value: `$${summaryOther?.current?.cogs?.toFixed(2)}`, delta: summaryOther?.current?.cogs },
    { label: "Page Views", value: summary?.pageViews?.current, delta: summary?.pageViews?.delta },
    { label: "Refunds", value: summary?.refunds?.current, delta: summary?.refunds?.delta },
    { label: "ROI", value: `${summary?.roi?.current?.toFixed(2)}%`, delta: summary?.roi?.delta },
    { label: "Sessions", value: summary?.sessions?.current, delta: summary?.sessions?.delta },
    { label: "SKU Count", value: summary?.skuCount?.current, delta: summary?.skuCount?.delta },
    { label: "Units Sold", value: summary?.unitsSold?.current, delta: summary?.unitsSold?.delta },
  ];

  const getCircleColor = (label) => {
    if (label === "Gross Revenue") return "rgb(106, 42, 192)";
    if (label === "Expenses") return "red";
    if (label === "Net Profit") return "green";
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

  return (
    <div style={{ padding: "20px", fontFamily: "'Nunito Sans', -apple-system, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff", margin: "15px 0px 15px 0px" }}>
      <div style={{ width: "100%", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: "5px" }}>P&amp;L</h2>
        <p style={{ color: "#888" }}>{fromDate} - {toDate}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "35%", paddingRight: "20px", borderRight: "1px solid #ddd" }}>
          <div>
            {summaryData.map((item, idx) => (
              <div key={idx} style={{ marginBottom: "15px" }}>
                <div
                  onClick={() => toggleExpansion(idx)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: getFontColor(item.label),
                    fontSize: getFontSize(item.label),
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: getCircleColor(item.label),
                        border: getCircleColor(item.label) === "transparent" ? "1px solid #ccc" : "none",
                        display: "inline-block",
                        marginRight: "8px",
                      }}
                    />
                    <span style={{ fontWeight: getCircleColor(item.label) === "transparent" ? "normal" : "700" }}>{item.label}</span>
                  </div>
                  <span>{item.value}</span>
                </div>

                {expanded === idx && item.delta !== undefined && (
                  <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#555" }}>
                      <span>Change:</span>
                      <span style={{ color: item.delta < 0 ? "red" : "green" }}>
                        {item.delta < 0 ? `-${Math.abs(item.delta).toFixed(2)}` : `+${Math.abs(item.delta).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: "65%", marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="date" tickFormatter={xAxisTickFormatter} />
              <YAxis tickFormatter={yAxisTickFormatter} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" />
              {graph?.find(g => g.metric === 'grossRevenue') && <Line type="monotone" dataKey="grossRevenue" stroke="#6F42C1" name="Gross Revenue" activeDot={{ r: 8 }} />}
              {graph?.find(g => g.metric === 'estimatedPayout') && <Line type="monotone" dataKey="estimatedPayout" stroke="#0DCAF0" name="Estimated Payout" activeDot={{ r: 8 }} />}
              {graph?.find(g => g.metric === 'expenses') && <Line type="monotone" dataKey="expenses" stroke="#DC3545" name="Expenses" activeDot={{ r: 8 }} />}
              {graph?.find(g => g.metric === 'netProfit') && <Line type="monotone" dataKey="netProfit" stroke="#198754" name="Net Profit" activeDot={{ r: 8 }} />}
              {graph?.find(g => g.metric === 'units') && <Line type="monotone" dataKey="units" stroke="#ffc107" name="Units Sold" activeDot={{ r: 8 }} />}
              {graph?.find(g => g.metric === 'ppcSales') && <Line type="monotone" dataKey="ppcSales" stroke="#007bff" name="PPC Sales" activeDot={{ r: 8 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;