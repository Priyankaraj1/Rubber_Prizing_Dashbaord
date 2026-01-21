
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import { getTheme } from "./theme"; 
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import FarmersTable from "./pages/FarmersTable";
import FarmerQuality from "./pages/FarmerQuality";
import Advisory from "./pages/Advisory";
import Officer from "./pages/Officer";
import Enquiry from "./pages/Enquiry";
import AdvisoryType from "./pages/AdvisoryType";
import AddAdvisory from "./pages/AddAdvisory";
export default function App() {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token && token !== "undefined" && token !== "null");
    setCheckingAuth(false);
  }, []);
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", nextMode);
      return nextMode;
    });
  };
  const theme = useMemo(() => getTheme(mode), [mode]);
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setIsAuthenticated(false);
  };
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
        <Route
          element={
            <PrivateRoute>
              <MainLayout onLogout={handleLogout} toggleColorMode={toggleColorMode} />
            </PrivateRoute>
          }
        >
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Farmers" element={<FarmersTable />} />
          <Route path="/Advisory" element={<Advisory />} />
          <Route path="/Officers" element={<Officer />} />
          <Route path="/Enquiries" element={<Enquiry />} />
          <Route path="/farmer-quality/:farmerId" element={<FarmerQuality />} />
          <Route path="/AdvisoryType" element={<AdvisoryType />} />
          <Route path="/add-advisory" element={<AddAdvisory />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
