// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";  
import Dashboard from "./pages/Dashboard";
import FarmersTable from "./pages/FarmersTable";
import Advisory from "./pages/Advisory";
import Officer from "./pages/Officer";
import Enquiry from "./pages/Enquiry";
import AdvisoryType from "./pages/AdvisoryType";

export default function App() {
  const [darkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token && token !== "undefined" && token !== "null");
    setCheckingAuth(false);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setIsAuthenticated(false);
  };

  const theme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });

  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  if (checkingAuth) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />

        {/* Protected Section */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Farmers" element={<FarmersTable />} />
          <Route path="/Advisory" element={<Advisory />} />
          <Route path="/Officers" element={<Officer />} />
          <Route path="/Enquiries" element={<Enquiry />} />
          <Route path="/AdvisoryType" element={<AdvisoryType />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
