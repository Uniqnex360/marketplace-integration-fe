import React, { useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { FiInfo, FiMoreVertical } from "react-icons/fi";
import "./SaleAndDistribution.css";
import axios from "axios";

// Map of US state codes to approximate lat/lon (centroid of each state)
const stateCoordinates = {
  AL: [-86.7911, 32.8067],
  AK: [-152.4044, 61.3707],
  AZ: [-111.4312, 33.7298],
  AR: [-92.3731, 34.9697],
  CA: [-119.6816, 36.1162],
  CO: [-105.3111, 39.0598],
  CT: [-72.7554, 41.5978],
  DE: [-75.5071, 39.3185],
  FL: [-81.5158, 27.7663],
  GA: [-83.6431, 33.0406],
  HI: [-157.4983, 21.0943],
  ID: [-114.4788, 44.2405],
  IL: [-88.9861, 40.3495],
  IN: [-86.2583, 39.8494],
  IA: [-93.2105, 42.0115],
  KS: [-96.7265, 38.5266],
  KY: [-84.6701, 37.6681],
  LA: [-91.8678, 31.1695],
  ME: [-69.3819, 44.6939],
  MD: [-76.8021, 39.0639],
  MA: [-71.5301, 42.2302],
  MI: [-84.5361, 43.3266],
  MN: [-93.9002, 45.6945],
  MS: [-89.6787, 32.7416],
  MO: [-92.2884, 38.4561],
  MT: [-110.4544, 46.9219],
  NE: [-98.2681, 41.1254],
  NV: [-117.0554, 38.3135],
  NH: [-71.5639, 43.4525],
  NJ: [-74.5210, 40.2989],
  NM: [-106.2485, 34.8405],
  NY: [-74.9481, 42.1657],
  NC: [-79.8064, 35.6301],
  ND: [-99.7840, 47.5289],
  OH: [-82.7649, 40.3888],
  OK: [-96.9289, 35.5653],
  OR: [-122.0709, 44.5720],
  PA: [-77.2098, 40.5908],
  RI: [-71.5118, 41.6809],
  SC: [-80.9450, 33.8569],
  SD: [-99.4388, 44.2998],
  TN: [-86.6923, 35.7478],
  TX: [-97.5635, 31.0545],
  UT: [-111.8624, 40.1500],
  VT: [-72.7107, 44.0459],
  VA: [-78.1699, 37.7693],
  WA: [-121.4905, 47.4009],
  WV: [-80.9545, 38.4912],
  WI: [-89.6165, 44.2685],
  WY: [-107.3025, 42.7559],
};

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const SaleAndDistribution = ({ widgetData, marketPlaceId }) => {
  const [viewMode, setViewMode] = useState("total");
  const [zoom, setZoom] = useState(1);
  const [cityData, setCityData] = useState([]);
  const [filterLevel, setFilterLevel] = useState("city");

  useEffect(() => {
    fetchSaleAndDistribution();
  }, [marketPlaceId, widgetData, filterLevel]);

  const fetchSaleAndDistribution = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}getCitywiseSales/`,
        {
           preset: widgetData,
            level: filterLevel,
            action: 'all',
            marketplace_id: marketPlaceId,
        }
      );
      console.log("API Data:", response.data);

      let formattedData = [];

      if (filterLevel === "state") {
        // Aggregate by state code
        const stateAggregation = {};
        response.data.items.forEach(item => {
          const stateCode = item.state;
          if (!stateCode || !stateCoordinates[stateCode]) return; // skip missing or invalid

          if (!stateAggregation[stateCode]) {
            stateAggregation[stateCode] = { total: 0, population: 0 };
          }
          stateAggregation[stateCode].total += item.gross || 0;
          stateAggregation[stateCode].population += item.population || 0;
        });

        formattedData = Object.entries(stateAggregation).map(([stateCode, values]) => {
          const { total, population } = values;
          const perCapita = population > 0 ? (total / population * 1000) : 0;
          return {
            name: stateCode,
            coordinates: stateCoordinates[stateCode],
            total: Number(total.toFixed(2)),
            perCapita: Number(perCapita.toFixed(2)),
          };
        });
      } else {
        // City or country level (use lat/lon from API)
        formattedData = response.data.items
          .filter(item => item.lat && item.lon && item.population > 0)
          .map(item => {
            const perCapita = item.gross / item.population * 1000;
            return {
              name: item.city || item.state_name || item.country,
              coordinates: [item.lon, item.lat],
              total: Number(item.gross.toFixed(2)),
              perCapita: Number(perCapita.toFixed(2)),
            };
          });
      }

      setCityData(formattedData);
      console.log("Formatted Data:", formattedData);

    } catch (error) {
      console.error('Error fetching sale and distribution data:', error);
    }
  };

  const maxValue = 30;
  const colorScale = scaleLinear().domain([0, 10, 20, 30]).range(["#f0f0ff", "#d0c0ff", "#b090ff", "#8040ff"]);
  const sizeScale = scaleLinear().domain([0, maxValue]).range([4, 25]);

  const handleZoomIn = () => {
    if (zoom < 4) setZoom(zoom + 0.5);
  };

  const handleZoomOut = () => {
    if (zoom > 1) setZoom(zoom - 0.5);
  };

  const handleFilterChange = (e) => {
    setFilterLevel(e.target.value.toLowerCase());
  };

  if (!cityData.length) return <div>Loading sales data...</div>;

  return (
    <div className="sales-map-container">
      <div className="header">
        <div className="title-section">
          <h2>Sales Distribution Map</h2>
          <div className="subtitle">Updated once daily <FiInfo /></div>
        </div>
        <div className="options-section"><FiMoreVertical /></div>
      </div>

      <div className="content-sales-map">
        {/* Filter dropdown */}
        <div className="filter-section">
          <select className="city-filter" value={filterLevel.charAt(0).toUpperCase() + filterLevel.slice(1)} onChange={handleFilterChange}>
            <option value="City">City</option>
            <option value="State">State</option>
            <option value="Country">Country</option>
          </select>
        </div>

        {/* Zoom controls */}
        <div className="zoom-controls">
          <button className="zoom-button" onClick={handleZoomIn}>+</button>
          <button className="zoom-button" onClick={handleZoomOut}>−</button>
        </div>

        {/* Toggle Total/PerCapita */}
        <div className="toggle-section">
          <div className="toggle-container">
            <button onClick={() => setViewMode("total")} className={`toggle-button ${viewMode === "total" ? "active" : ""}`}>Total</button>
            <button onClick={() => setViewMode("perCapita")} className={`toggle-button ${viewMode === "perCapita" ? "active" : ""}`}>Per capita</button>
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <ComposableMap projection="geoAlbersUsa">
            <ZoomableGroup zoom={zoom} center={[-96, 38]}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography key={geo.rsmKey} geography={geo} fill="#F5F5F7" stroke="#DDD" strokeWidth={0.5} />
                  ))
                }
              </Geographies>
              {cityData.map(({ name, coordinates, ...data }) => (
                <Marker key={name} coordinates={coordinates}>
                  <circle
                    r={sizeScale(data[viewMode])}
                    fill={colorScale(data[viewMode])}
                    stroke="#fff"
                    strokeWidth={0.5}
                    fillOpacity={0.7}
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="gradient-bar"></div>
          <div className="legend-labels">
            <span>0</span><span>10</span><span>20</span><span>30</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleAndDistribution;
