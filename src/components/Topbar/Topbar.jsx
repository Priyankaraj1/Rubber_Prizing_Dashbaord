import React, { useState, useEffect } from "react";
import {AppBar,Toolbar,Typography,IconButton,Box,Avatar,Menu,MenuItem,useMediaQuery,Breadcrumbs,Link,Divider,ListItemIcon,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useTheme } from "@mui/material/styles";
import { useLocation, Link as RouterLink } from "react-router-dom";
const drawerWidth = 240;
function Topbar({ onMenuClick, toggleColorMode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState("");
  useEffect(() => {
    const nameFromStorage = localStorage.getItem("name");
    const tokenFromStorage = localStorage.getItem("token");
    if (nameFromStorage) setUserName(nameFromStorage);
    if (tokenFromStorage) setToken(tokenFromStorage);
  }, []);
  const pathnames = location.pathname.split("/").filter((x) => x);
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#ffffff",
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)"
        }`,
        width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, sm: `${drawerWidth}px` },
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <Toolbar sx={{ minHeight: 70, px: 3 }}>
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, color: theme.palette.text.primary }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              mx: 1.5,
              color: theme.palette.text.secondary,
            },
            "& .MuiLink-root": {
              fontSize: "0.9rem",
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiTypography-root": {
              fontSize: "0.9rem",
              fontWeight: 600,
            },
          }}
        >
         <Link component={RouterLink} to="/dashboard" underline="hover" color="inherit">
  Home
</Link>
         {pathnames.map((value, index) => {
  const to = `/${pathnames.slice(0, index + 1).join("/")}`;
  const isLast = index === pathnames.length - 1;
  const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
  return isLast ? (
    <Typography key={to} color="text.primary">
      {formattedValue}
    </Typography>
  ) : (
    <Link
      key={to}
      component={RouterLink}
      to={to}
      underline="hover"
      color="inherit"
    >
      {formattedValue}
    </Link>
  );
})}
        </Breadcrumbs>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={toggleColorMode}
          sx={{
            mr: 2,
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
            },
          }}
        >
          {theme.palette.mode === "dark" ? (
            <LightModeOutlinedIcon />
          ) : (
            <DarkModeOutlinedIcon />
          )}
        </IconButton>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            p: "4px 8px",
            borderRadius: "8px",
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <Avatar alt="User" src="/Rubber.png" sx={{ width: 32, height: 32 }} />
          {!isMobile && (
            <Typography variant="body2">
              {userName || "User"}
            </Typography>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: "12px", minWidth: 160 },
          }}
        >
          <Divider />
          <MenuItem
            onClick={() => {
              localStorage.removeItem("name");
              localStorage.removeItem("token");
              setUserName("");
              setToken("");
              window.location.href = "/"; 
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
