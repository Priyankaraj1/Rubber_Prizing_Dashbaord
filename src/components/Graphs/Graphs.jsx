import React, { useEffect, useState } from "react";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,LineChart,Line,Legend,PieChart,Pie,Cell,ResponsiveContainer,} from "recharts";
import { LineChartPro } from "@mui/x-charts-pro/LineChartPro";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
    <path
      d={`M${x},${y + height} 
          L${x + width / 2},${y} 
          L${x + width},${y + height} Z`}
      stroke="none"
      fill={fill}
    />
  );
};

const Graphs = ({ fromDate, toDate, selectedMarket, selectedGrade }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const axisColor = isDark ? "#E0E0E0" : "#333";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const cardBg = isDark ? "#1E1E1E" : "#FFFFFF";
  const [breadcrumbData, setBreadcrumbData] = useState(null);
  const [immobileData, setImmobileData] = useState(null);
  const [priceData, setPriceData] = useState([]);
  // Market name mapping specifically for the API
  const MARKET_API_MAP = {
  agartala: "Agartala",
  kochi: "Kochi",
  kottayam: "Kottayam",
  kuttoor: "Kuttoor",
  pulpally: "Pulpally",
};

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [breadcrumbRes, immobileRes] = await Promise.all([
          axios.get("https://rubber-backend.solidaridadasia.com/api/bredcrumb"),
          axios.get("https://rubber-backend.solidaridadasia.com/api/getImmobileData"),
        ]);
        setBreadcrumbData(breadcrumbRes.data.data);
        setImmobileData(immobileRes.data.data);
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
      }
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    if (!fromDate || !toDate) {
      setPriceData([]);
      return;
    }

    const fetchPriceData = async () => {
      try {
        const url = new URL("https://agribot-backend.demetrix.in/fetch_rubber_prices");
        url.searchParams.append("from_date", fromDate);
        url.searchParams.append("to_date", toDate);
        url.searchParams.append("grade", selectedGrade);
if (selectedMarket !== "all") {

  const apiMarketName = MARKET_API_MAP[selectedMarket.toLowerCase()] || selectedMarket;
  url.searchParams.append("market", apiMarketName);
}

        const res = await axios.get(url.toString());
        setPriceData(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching filtered price data:", error);
      }
    };

    fetchPriceData();
  }, [fromDate, toDate, selectedMarket, selectedGrade]);

  if (!breadcrumbData || !immobileData) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading graphs...</p>;
  }

  if (!fromDate || !toDate) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px", color: textColor }}>
        <h3>Please select a date range to view price charts.</h3>
      </div>
     
    );
  }

  
  const genderData = [
    { name: "Male", value: breadcrumbData.total_male_workers },
    { name: "Female", value: breadcrumbData.total_female_workers },
  ];

  const intercropData =
    breadcrumbData.plotwise_unique_intercrops?.map((crop) => ({
      name: crop.inter_crops,
      value: crop.count,
    })) || [];

  const INTERCROP_ORDER = ["No", "Pineapple", "Coffee", "Cocoa", "Banana", "Tubers", "others"];
  const INTERCROP_COLORS = {
    No: "#2b8a66",
    Pineapple: "#9ad14a",
    Coffee: "#cddc39",
    Cocoa: "#26a59a",
    Banana: "#29b6f6",
    Tubers: "#8bc34a",
    others: "#9ad14a",
  };
  const sortedIntercropData = INTERCROP_ORDER.map((cropName) => {
    const found = intercropData.find((d) => d.name === cropName);
    return found || { name: cropName, value: 0 };
  });
  const intercropBarColors = sortedIntercropData.map(
    (d) => INTERCROP_COLORS[d.name] || "#ccc"
  );

  const COLORS = {
    male: "#2e8b57",
    female: "#9acd32",
  };

  const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length && payload[0].value > 0) {
    return (
      <div
        style={{
          background: cardBg,
          borderRadius: 6,
          border: `1px solid ${isDark ? "#333" : "#ccc"}`,
          color: textColor,
          padding: "8px",
        }}
      >
        <p style={{ margin: 0 }}>
          {payload[0].payload.name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const marketData = {};

priceData
  .filter((m) => {
    // Apply selected market filter ONLY
    if (
      selectedMarket !== "all" &&
      m.market.toLowerCase() !== selectedMarket.toLowerCase()
    )
      return false;

    return true;
  })
  .forEach((marketItem) => {
    const marketName = marketItem.market;

    marketItem.prices.forEach((price) => {
      const date = price.arrival_date;
      if (!marketData[date]) marketData[date] = { date };
      marketData[date][`${marketName}_INR`] = parseFloat(price.INR);
    });
  });


  const priceChartData = Object.values(marketData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

const visibleMarkets =
  selectedMarket === "all"
    ? Array.from(new Set(priceData.map((m) => m.market)))
    : [MARKET_API_MAP[selectedMarket.toLowerCase()] || selectedMarket];


  const marketColors = ["#2e8b57", "#cddc39", "#26a69a", "#2b8a66", "#cddc39", "#26a69a"];

  return (
    <div style={{ padding: "0 40px", color: textColor }}>
      {/* 🟩 Rubber Price Chart */}
  <div style={{ width: "100%", height: 500, marginBottom: "40px" }}>
 
     <h3 style={{ color: textColor, fontSize: "20px", marginBottom: "10px" }}>
      Rubber Prizing 
    </h3> {/* Increased height */}
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={priceChartData}
      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
    >
      <CartesianGrid stroke={gridColor} strokeDasharray="2 2" vertical horizontal />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 12, fill: axisColor }}
        tickFormatter={(v) =>
          new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        }
      />
      <YAxis tick={{ fontSize: 12, fill: axisColor }} tickFormatter={(v) => `₹${v}`} />
      <Tooltip
        formatter={(value, name) => [`₹${value}`, name]}
        contentStyle={{
          background: cardBg,
          borderRadius: 6,
          border: `1px solid ${isDark ? "#333" : "#ccc"}`,
          color: textColor,
        }}
        labelStyle={{ fontWeight: "bold" }}
      />
      <Legend wrapperStyle={{ color: textColor }} />

      {visibleMarkets.map((market, idx) => {
        const labelName = MARKET_API_MAP[market.toLowerCase()] || market;
        return (
          <Bar
            key={`${market}_bar`}
            dataKey={`${market}_INR`}
            name={labelName}
            fill={marketColors[idx % marketColors.length]}
            radius={[6, 6, 0, 0]}
            barSize={25}
          />
        );
      })}
    </BarChart>
  </ResponsiveContainer>
</div>



      {/* 🟦 Intercrops + Gender */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "5px"
         
        }}
      >
        {/* Intercrops Distribution */}
        <div>
          <h3 style={{ color: textColor, fontSize: "20px", marginBottom: "10px",  marginBottom: "20px", }}>
            Intercrops Distribution
          </h3>
      <ResponsiveContainer width="480" height={380}>

            <BarChart data={sortedIntercropData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              {/* <CartesianGrid  /> */}
              <YAxis tick={{ fill: axisColor }} />
              <Tooltip content={<CustomTooltip />} />


              <Legend
                verticalAlign="bottom"
                align="center"      
                wrapperStyle={{ color: textColor, marginTop: 20 }}
                content={() => (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "14px",
                      marginTop: "10px",
                    }}
                  >
                    {sortedIntercropData.map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            background: intercropBarColors[i],
                            borderRadius: "50%",
                            border: `1px solid ${isDark ? "#555" : "#ccc"}`,
                          }}
                        />
                        <span style={{ fontSize: 13, color: textColor }}>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Bar dataKey="value" shape={<TriangleBar />} name="Intercrops">
                {sortedIntercropData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={intercropBarColors[index % intercropBarColors.length]}
                    name={entry.name}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
         <div>
          <h3 style={{ color: textColor, fontSize: "20px" ,  marginTop: "20px",}}>Gender Distribution</h3>
         <ResponsiveContainer width="480" height={380}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                label={({ name }) => name}
              >
                {genderData.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS.male : COLORS.female} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: cardBg,
                  borderRadius: 6,
                  border: `1px solid ${isDark ? "#333" : "#ccc"}`,
                  color: textColor,
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: textColor }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        

       
       
      </div>
      {/* 🟢 Agricultural Area Distribution + Tree Histogram */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginTop: "40px",
  }}
>
   

 
  
  
</div>

{/* 🟢 Agricultural Area Distribution + Tree Histogram */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "30px",
    marginTop: "40px",
  }}
>
  {/* 🥧 Agricultural Area Distribution */}
  <div>
    <h3 style={{ color: textColor, fontSize: "20px", marginBottom: "10px" }}>
      Agricultural Area Distribution
    </h3>
   <ResponsiveContainer width="380" height={380}>
      <PieChart>
        <Pie
          data={[
            { name: "Immature Area", value: breadcrumbData.total_immature_area },
            { name: "Mature Area", value: breadcrumbData.total_mature_area },
            { name: "Total Agri Area", value: breadcrumbData.total_agri_area },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) => `${value.toFixed(2)}ha`}
          dataKey="value"
        >
          <Cell fill="#7cb342" />
          <Cell fill="#388e3c" />
          <Cell fill="#aeea00" />
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value}`, name]}
          contentStyle={{
            background: cardBg,
            borderRadius: 6,
            border: `1px solid ${isDark ? "#333" : "#ccc"}`,
            color: textColor,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ color: textColor }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div>
    <h3 style={{ color: textColor, fontSize: "20px", marginBottom: "10px" }}>
      Mature vs Immature Trees
    </h3>
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={Object.keys(breadcrumbData.mature_tree_distribution || {}).map(
          (range) => ({
            range,
            Mature: breadcrumbData.mature_tree_distribution[range] || 0,
            Immature: breadcrumbData.immature_tree_distribution[range] || 0,
          })
        )}
        margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="range" tick={{ fontSize: 12, fill: axisColor }} />
        <YAxis tick={{ fontSize: 12, fill: axisColor }} />
        <Tooltip
  formatter={(value, name) => [value, name]}
  labelFormatter={(label) => `${label} years`}
  contentStyle={{
    background: cardBg,
    borderRadius: 6,
    border: `1px solid ${isDark ? "#333" : "#ccc"}`,
    color: textColor,
  }}
/>

        <Legend wrapperStyle={{ color: textColor }} />
        <Bar dataKey="Immature" fill="#8bc34a" barSize={25} />
        <Bar dataKey="Mature" fill="#26a69a" barSize={25} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
          
    </div>
  );
};

export default Graphs;
