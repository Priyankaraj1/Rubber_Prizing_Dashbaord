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
  AreaChart,
  Area,
} from "recharts";
import axios from "axios";

// Custom triangular bar shape for Intercrops Distribution
const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
    <path
      d={`M${x},${y + height} L${x + width / 2},${y} L${x + width},${y + height} Z`}
      stroke="none"
      fill={fill}
    />
  );
};

const Graphs = () => {
  const [breadcrumbData, setBreadcrumbData] = useState(null);
  const [immobileData, setImmobileData] = useState(null);

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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (!breadcrumbData || !immobileData) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading graphs...</p>;
  }

  // === Extract Data ===
  const genderData = [
    { name: "Male", value: breadcrumbData.total_male_workers },
    { name: "Female", value: breadcrumbData.total_female_workers },
  ];

  const agriAreaData = [
    { name: "Immature Area", value: breadcrumbData.total_immature_area },
    { name: "Mature Area", value: breadcrumbData.total_mature_area },
    { name: "Total Agri Area", value: breadcrumbData.total_agri_area },
  ];

  const treeAgeData = Object.keys(breadcrumbData.mature_tree_distribution).map((key) => ({
    range: key,
    Mature: breadcrumbData.mature_tree_distribution[key],
    Immature: breadcrumbData.immature_tree_distribution[key],
  }));

  const intercropData = breadcrumbData.plotwise_unique_intercrops.map((crop) => ({
    name: crop.inter_crops,
    value: crop.count,
  }));

  const leadData = [
    { name: "Lead Farmers", value: parseInt(immobileData.no_of_lead_farmers) },
    { name: "Producer Societies", value: parseInt(immobileData.producer_society) },
  ];

  const marketData = [
    { name: "Agartala", RSS4: 17800, RSS5: 17300 },
    { name: "Kochi", RSS4: 18600, RSS5: 18200 },
    { name: "Kottayam", RSS4: 18600, RSS5: 18200 },
  ];

  const COLORS = {
    rss4: "#2e8b57",
    rss5: "#9acd32",
    lead1: "#2e8b57",
    lead2: "#9acd32",
    male: "#2e8b57",
    female: "#9acd32",
    immature: "#9acd32",
    mature: "#2e8b57",
    total: "#7cb342",
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
        {/* Market-wise Price Comparison */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px" }}>Market-wise Price Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend iconType="rect" />
              <Bar dataKey="RSS4" fill={COLORS.rss4} barSize={40} />
              <Bar dataKey="RSS5" fill={COLORS.rss5} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Farmers vs Producer Societies */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px" }}>Lead Farmers vs Producer Societies</h3>
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
       {/* Intercrops Distribution */}
<div>
  <h3 style={{ color: "#004225", fontSize: "20px" }}>Intercrops Distribution</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={intercropData}
      margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
    >
      <CartesianGrid stroke="#e0e0e0" />
      {/* Hide X-axis completely */}
      <XAxis dataKey="name" tick={false} axisLine={false} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip
        contentStyle={{
          background: "#fff",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      {/* ✅ Custom Legend that matches the X-axis values */}
      <Legend
        verticalAlign="bottom"
        align="center"
        iconType="circle"
        wrapperStyle={{
          paddingTop: "10px",
          fontSize: "13px",
        }}
        payload={intercropData.map((entry, index) => {
          const COLORS = [
            "#2b8a66", // No
            "#9ad14a", // Pineapple
            "#26a59a", // Coffee
            "#29b6f6", // Cocoa
            "#004d40", // Banana
            "#8bc34a", // Tubers
            "#cddc39", // others
          ];
          return {
            id: entry.name,
            type: "circle",
            value: entry.name, // 👈 uses your X-axis label instead of "value"
            color: COLORS[index % COLORS.length],
          };
        })}
      />

      {/* ✅ Triangular bars using same colors */}
      <Bar dataKey="value" shape={<TriangleBar />} barSize={25}>
        {intercropData.map((entry, index) => {
          const COLORS = [
            "#2b8a66",
            "#9ad14a",
            "#26a59a",
            "#29b6f6",
            "#004d40",
            "#8bc34a",
            "#cddc39",
          ];
          return (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              name={entry.name}
            />
          );
        })}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>


        {/* Gender Distribution */}
        <div>
          <h3 style={{ color: "#004225", fontSize: "20px" }}>Gender Distribution</h3>
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
