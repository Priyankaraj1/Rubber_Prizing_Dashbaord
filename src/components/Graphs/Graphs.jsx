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
  LineChart,
  Line,
} from "recharts";
import axios from "axios";

// Custom Triangle Bar Shape
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

const Graphs = () => {
  const [breadcrumbData, setBreadcrumbData] = useState(null);
  const [immobileData, setImmobileData] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [fromDate, setFromDate] = useState("2025-09-01");
  const [toDate, setToDate] = useState("2025-11-12");

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
        const res = await axios.get(
          `https://agribot-backend.demetrix.in/fetch_rubber_prices?from_date=${fromDate}&to_date=${toDate}`
        );
        if (res.data?.data) {
          setPriceData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };
    fetchPriceData();
  }, [fromDate, toDate]);

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
  }).filter((d) => d.value > 0);

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

  return (
    <div style={{ padding: "0 40px", background: "#fff" }}>
      {/* Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* 🟢 Line Chart for Rubber Prices */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px" }}>
            Rubber Price Trend (INR & USD)
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="arrival_date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="INR"
                stroke="#2e8b57"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="INR (₹)"
              />
              <Line
                type="monotone"
                dataKey="USD"
                stroke="#29b6f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="USD ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Farmers vs Producer Societies */}
        <div>
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
              <YAxis dataKey="name" type="category" tick={{ fontSize: 13 }} width={150} />
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
        </div>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Intercrops Distribution */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px", marginBottom: "10px" }}>
            Intercrops Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sortedIntercropData}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend iconType="circle" />
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
