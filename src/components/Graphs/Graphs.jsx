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
} from "recharts";
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
    const fetchPriceData = async () => {
      try {
        const url = new URL("https://agribot-backend.demetrix.in/fetch_rubber_prices");
        url.searchParams.append("from_date", fromDate);
        url.searchParams.append("to_date", toDate);
        url.searchParams.append("grade", selectedGrade);

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
  }, [fromDate, toDate, selectedMarket, selectedGrade]);

  if (!breadcrumbData || !immobileData) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading graphs...</p>;
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
    rss4: "#2e8b57",
    rss5: "#9acd32",
    lead1: "#2e8b57",
    lead2: "#9acd32",
    male: "#2e8b57",
    female: "#9acd32",
  };

  const marketData = {};
  priceData
    .filter((m) => !["Kuttoor", "Pulpally", "KuttoorPulpally"].includes(m.market))
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

  const marketColors = ["#2e8b57", "#cddc39", "#26a69a", "#8e24aa", "#cddc39", "#26a69a"];

  return (
    <div style={{ padding: "0 40px", color: textColor }}>
      {/* 🟩 Rubber Price Chart */}
      <div style={{ marginBottom: "40px" }}>
        <h3 style={{ color: textColor, fontSize: "20px" }}>
          Rubber Price Comparison by Market (INR ₹)
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={priceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
            <YAxis tick={{ fontSize: 12, fill: axisColor }} />
            <Tooltip
              formatter={(value) => `₹${value}`}
              contentStyle={{
                background: cardBg,
                borderRadius: 6,
                border: `1px solid ${isDark ? "#333" : "#ccc"}`,
                color: textColor,
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ color: textColor }} />
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

      {/* 🟦 Intercrops + Gender */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        }}
      >
        {/* Intercrops Distribution */}
        <div>
          <h3 style={{ color: textColor, fontSize: "20px", marginBottom: "10px" }}>
            Intercrops Distribution
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedIntercropData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid stroke={gridColor} />
              <YAxis tick={{ fill: axisColor }} />
              <Tooltip
                formatter={(value, name, props) => [`${value}`, props.payload.name]}
                labelStyle={{ fontWeight: "bold" }}
                contentStyle={{
                  background: cardBg,
                  borderRadius: 6,
                  border: `1px solid ${isDark ? "#333" : "#ccc"}`,
                  color: textColor,
                }}
              />
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

        {/* Gender Distribution */}
        <div>
          <h3 style={{ color: textColor, fontSize: "20px" }}>Gender Distribution</h3>
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
      </div>
    </div>
  );
};

export default Graphs;
