import React from "react";
import { useTheme } from "@mui/material/styles";

const Footer = () => {
  const theme = useTheme(); 
  const backgroundColor =
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.background.default;

  const textColor =
    theme.palette.mode === "dark"
      ? theme.palette.text.primary
      : theme.palette.text.primary;
  const boxShadow =
    theme.palette.mode === "dark"
      ? "0 -2px 8px rgba(255,255,255,0.05)"
      : "0 -2px 8px rgba(0,0,0,0.1)";
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor,
        color: textColor,
        textAlign: "center",
        padding: "12px 0",
        zIndex: 1000,
        boxShadow,
      }}
    >
      <p style={{ margin: 0, fontSize: "0.875rem" }}>
        © 2025 Copyright : Powered By{" "}
        <span style={{ fontWeight: 600 }}>Demetrix</span>
      </p>
    </footer>
  );
};

export default Footer;
