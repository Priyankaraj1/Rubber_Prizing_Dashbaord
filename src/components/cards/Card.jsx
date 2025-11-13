// src/components/cards/Card.jsx
import React from "react";
import "./Card.css";
import PeopleIcon from "@mui/icons-material/People";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import ForestIcon from "@mui/icons-material/Forest";
import AssessmentIcon from "@mui/icons-material/Assessment";

const Card = () => {
  const stats = {
    total_farmers: 3224385,
    total_workers: 3056,
    male_workers: 2884,
    female_workers: 172,
    total_trees: 223561,
    annual_yield: 3224385,
  };

  const cardData = [
    { title: "Total Farmers", value: stats.total_farmers, icon: <PeopleIcon /> },
    { title: "Total Workers", value: stats.total_workers, icon: <AgricultureIcon /> },
    { title: "Male Workers", value: stats.male_workers, icon: <MaleIcon /> },
    { title: "Female Workers", value: stats.female_workers, icon: <FemaleIcon /> },
    { title: "Total Trees", value: stats.total_trees, icon: <ForestIcon /> },
    { title: "Annual Yield", value: stats.annual_yield, icon: <AssessmentIcon /> },
  ];

  // Cycle through 3 accent colors to match design
  const accentColors = ["#2b8a66", "#9ad14a", "#26a59a"];

  return (
    <div className="cards-container">
      {cardData.map((item, index) => {
        const accent = accentColors[index % 3]; // Cycle every 3 cards

        return (
          <div className="card-item" key={index}>
            {/* Left accent bar */}
            <div className="card-accent" style={{ background: accent }} />

            {/* Icon circle */}
            <div className="card-icon" style={{ background: accent }}>
              {item.icon}
            </div>

            {/* Text content */}
            <div className="card-content">
              <div className="card-title">{item.title}</div>
              <div className="card-value">
                {Number(item.value).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;