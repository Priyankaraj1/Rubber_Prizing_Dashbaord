import React from "react";
import {Drawer,Toolbar,List,ListItemButton,ListItemIcon,ListItemText,Divider,Box,useTheme,useMediaQuery} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DiamondIcon from "@mui/icons-material/Diamond";
import MenuBookIcon from "@mui/icons-material/MenuBook";


import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import TableChartIcon from "@mui/icons-material/TableChart";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
const drawerWidth = 240;
const menuItems = [
  { text: " Overview", icon: <DashboardIcon />, to: "/Dashboard" },
  { text: "Farmer", icon: <DiamondIcon  />, to: "/Farmers" },
  { text: "Advisory", icon: <MenuBookIcon />, to: "/Advisory" },
  { text: "Officers", icon: <NotificationsIcon  />, to: "/Officers" },
  { text: "Enquiries", icon: <TableChartIcon />, to: "/Enquiries" },
  { text: "Advisory Type", icon: <PersonIcon />, to: "/AdvisoryType" },
];
function Sidebar({ mobileOpen, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const drawer = (
    <>
      <Box className="sidebar-toolbar" sx={{ p: 3, mb: 1 }}>
        <img
          src={isDark ? "/solidaridad_logo_dark.png" : "/Solidaridad.jpeg"}
          alt="Logo"
          className="sidebar-logo"
          style={{ maxWidth: "140px", height: "auto" }}
        />
      </Box>
      <Divider sx={{ opacity: isDark ? 0.1 : 0.2 }} />

      <List className="sidebar-menu" sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <NavLink
            to={item.to}
            key={item.text}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            onClick={isMobile ? onClose : undefined}
          >
            <ListItemButton
              className="sidebar-item"
              sx={{
                borderRadius: "10px",
                mb: 1,
                py: 1.5,
                "&:hover": {
                  bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                },
                "&.Mui-selected, &.active": {
                  bgcolor: isDark ? "rgba(255,255,255,0.1)" : theme.palette.primary.main + "15",
                  color: theme.palette.primary.main,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <ListItemIcon 
                className="sidebar-icon" 
                sx={{ 
                  color: "inherit", 
                  minWidth: 40,
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.3rem"
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </NavLink>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, 
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: isDark ? "#1a1a1a" : "#ffffff",
            color: theme.palette.text.primary,
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: isDark ? '0 4px 12px 0 rgba(0,0,0,0.3)' : '0 4px 12px 0 rgba(0,0,0,0.05)'
          },
        }}
      >
        {drawer}
      </Drawer>
    <Drawer
  variant="permanent"
  sx={{
    display: { xs: "none", md: "block" },   // FIXED
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
      bgcolor: isDark ? "#1a1a1a" : "#ffffff",
      color: theme.palette.text.primary,
      borderRight: `1px solid ${
        isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      }`,
    },
  }}
>
  {drawer}
</Drawer>

    </Box>
  );
}
export default Sidebar;

