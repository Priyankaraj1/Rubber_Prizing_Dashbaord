// src/theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            background: {
              default: "#121212",
              paper: "#1E1E1E",
            },
            text: {
              primary: "#FFFFFF",
              secondary: "rgba(255,255,255,0.7)",
            },
          }
        : {
            background: {
              default: "#F9FAFB",
              paper: "#FFFFFF",
            },
            text: {
              primary: "#000000",
              secondary: "rgba(0,0,0,0.6)",
            },
          }),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            transition: "background-color 0.3s ease",
          },
        },
      },
    },
  });
