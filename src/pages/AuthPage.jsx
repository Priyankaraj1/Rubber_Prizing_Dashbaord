// src/pages/AuthPage.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  useMediaQuery
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import LockIcon from "@mui/icons-material/Lock";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const handleLogin = async () => {
    if (!phone || !password) {
      setError("Phone number and password are required!");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://rubber-backend.solidaridadasia.com/api/webLogin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        const userData = data.data;
        localStorage.setItem("token", userData.token);
        localStorage.setItem("name", userData.name);
        onLogin?.();
        navigate("/Dashboard");
      } else {
        setError(data?.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/bg6.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 1, sm: 2 },
        position: "relative",
      }}
    >
      {/* LOGO */}
      <Box sx={{ position: "absolute", top: 20, left: 20 }}>
        <img
          src="/solidaridad_logo_dark.png"
          alt="Logo"
          style={{ width: isMobile ? "110px" : "140px" }}
        />
      </Box>
      {/* Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: isTablet ? "column" : "row",
          overflow: "hidden",
        }}
      >
        {/* LEFT SIDE - FORM */}
        <Box
          sx={{
            width: isTablet ? "100%" : "50%",
            p: { xs: 3, sm: 4 },
            bgcolor: "#FAFBEF",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: "black" }}>
            Login
          </Typography>
          <TextField
            fullWidth
            placeholder="Phone Number"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#EEF4FF",
                color: "black",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "black",
                opacity: 1,
              },
              "& .MuiSvgIcon-root": {
                color: "black",
              },
            }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#EEF4FF",
                color: "black",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "black",
                opacity: 1,
              },
              "& .MuiSvgIcon-root": {
                color: "black",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Typography
            sx={{
              fontSize: "14px",
              mt: 1,
              mb: 3,
              cursor: "pointer",
              color: "black",
            }}
          >
            Forgot password?
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              py: 1.2,
              background: "#799849",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { background: "#6a873c" },
            }}
          >
            {loading ? "Please wait..." : "LOGIN"}
          </Button>
        </Box>

        
        {!isMobile && (
          <Box
            sx={{
              width: isTablet ? "100%" : "50%",
              height: isTablet ? "250px" : "auto",
              backgroundImage: "url('/t2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
