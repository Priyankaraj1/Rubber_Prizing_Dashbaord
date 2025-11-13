import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import axios from "axios";

// 🟢 Custom Triangle Bar Shape (for Intercrops)
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

const Graphs = ({ fromDate, toDate, selectedMarket,selectedGrade }) => {

  const [breadcrumbData, setBreadcrumbData] = useState(null);
  const [immobileData, setImmobileData] = useState(null);
  const [priceData, setPriceData] = useState([]);



  // 🟩 Fetch All Data
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

  // 🟦 Fetch Rubber Price Data
 useEffect(() => {
  const fetchPriceData = async () => {
    try {
      const url = new URL("https://agribot-backend.demetrix.in/fetch_rubber_prices");
      url.searchParams.append("from_date", fromDate);
      url.searchParams.append("to_date", toDate);
      url.searchParams.append("grade", selectedGrade); // 🔥 Add grade filter

      if (selectedMarket !== "all") {
        url.searchParams.append("market", selectedMarket);
      }

      const res = await axios.get(url.toString());
      if (res.data?.data) {
        setPriceData(res.data.data);
      } else {
        setPriceData([]);
      }
    } catch (error) {
      console.error("Error fetching filtered price data:", error);
    }
  };

  fetchPriceData();
}, [fromDate, toDate, selectedMarket, selectedGrade]); // ✅ include selectedGrade dependency


  if (!breadcrumbData || !immobileData) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading graphs...</p>;
  }

  // === Extract Data ===
  const genderData = [
    { name: "Male", value: breadcrumbData.total_male_workers },
    { name: "Female", value: breadcrumbData.total_female_workers },
  ];

  const leadData = [
    { name: "Lead Farmers", value: parseInt(immobileData.no_of_lead_farmers) },
    { name: "Producer Societies", value: parseInt(immobileData.producer_society) },
  ];

  // === Intercrop Data ===
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
    rss4: "#2e8b57",
    rss5: "#9acd32",
    lead1: "#2e8b57",
    lead2: "#9acd32",
    male: "#2e8b57",
    female: "#9acd32",
  };

  // 🟡 Build Market Price Data (INR Only)
  const marketData = {};
  priceData
    .filter((m) => !["Kuttoor", "Pulpally", "KuttoorPulpally"].includes(m.market)) // hide these markets
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

  const visibleMarkets = Array.from(
    new Set(priceData.map((m) => m.market).filter((m) => !["Kuttoor", "Pulpally", "KuttoorPulpally"].includes(m)))
  );

  const marketColors = [
    "#2e8b57",
    "#cddc39",
    "#26a69a",
    "#8e24aa",
    "#cddc39",
    "#26a69a",
  ];

  return (
    <div style={{ padding: "0 40px", background: "#fff" }}>
      {/* 🟢 Rubber Price Chart (INR Only Bars) */}
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ color: "#004225", fontSize: "20px" }}>
          Rubber Price Comparison by Market (INR ₹)
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={priceChartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => `₹${value}`}
              contentStyle={{
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend />

            {/* INR - Bars Only */}
            {visibleMarkets.map((market, idx) => (
              <Bar
                key={`${market}_bar`}
                dataKey={`${market}_INR`}
                name={`${market} (INR ₹)`}
                fill={marketColors[idx % marketColors.length]}
                barSize={20}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🟣 Three Small Charts Below */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        {/* Lead Farmers vs Producer Societies */}
        {/* <div>
          <h3 style={{ color: "#004225", fontSize: "20px" }}>
            Lead Farmers vs Producer Societies
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={leadData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
              barSize={50}
            >
              <CartesianGrid stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 13 }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                {leadData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? COLORS.lead1 : COLORS.lead2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}
        {/* Intercrops Distribution */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px", marginBottom: "10px" }}>
            Intercrops Distribution
          </h3>
          <ResponsiveContainer width="500" height={400}>
            <BarChart
              data={sortedIntercropData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis />
             <Tooltip
  formatter={(value, name, props) => {
   
    return [`${value}`, props.payload.name];
  }}
  labelStyle={{ fontWeight: "bold" }}
  contentStyle={{
    background: "#fff",
    borderRadius: 6,
    border: "1px solid #ccc",
  }}
/>

             <Legend
  verticalAlign="bottom"
  align="center"
  wrapperStyle={{ marginTop: 20 }} 
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
              border: "1px solid #ccc",
              boxShadow: "0 0 2px rgba(0,0,0,0.2)",
            }}
          />
          <span style={{ fontSize: 13, color: "#333" }}>{entry.name}</span>
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
          <h3 style={{ color: "#004225", fontSize: "20px" }}>
            Gender Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
                  background: "#fff",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Graphs;
