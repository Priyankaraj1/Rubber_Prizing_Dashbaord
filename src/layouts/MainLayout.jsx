import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Topbar from "../components/Topbar/Topbar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
function MainLayout({ toggleColorMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); 
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={handleDrawerToggle}
          variant={isMobile ? "temporary" : "persistent"} 
        />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Topbar onMenuClick={handleDrawerToggle} toggleColorMode={toggleColorMode} />
          <Toolbar /> 
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 1,
              mb: 4,
              width: "100%",
             
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Footer />
      </Box>
    </Box>
  );
}
export default MainLayout;
