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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
         maxWidth: "100%", 
         overflowX: "hidden",
        flexDirection: "column",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
     <Box
  sx={{
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
     maxWidth: "100%", 
    flexDirection: { xs: "column", md: "row" }, // 🔥 MOBILE FIX
  }}
>

        <Sidebar
          mobileOpen={mobileOpen}
          onClose={handleDrawerToggle}
          variant={isMobile ? "temporary" : "persistent"}
        />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" ,minWidth: 0, maxWidth: "100%", }}>
          {/* Topbar includes theme toggle button */}
          <Topbar
            onMenuClick={handleDrawerToggle}
            toggleColorMode={toggleColorMode}
          />
          <Toolbar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minWidth: 0,
               maxWidth: "100%", 
              p: { xs: 1, sm: 2, md: 3 },
              mb: 4,
              width: "100%",
              bgcolor: theme.palette.background.default,
              color: theme.palette.text.primary,
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 2,
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}

export default MainLayout;
