// src/pages/AuthPage.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AuthPage({ onLogin }) {
  const [phone, setPhone] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        backgroundImage: "url('/rubber image.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: { xs: "center", md: "flex-end" },
        alignItems: "center",
        p: 3
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: "380px", md: "380px" },
          background: "rgba(5, 28, 66, 0.55)",
          backdropFilter: "blur(6px)",
          borderRadius: 3,
          p: 4,
          color: "white",
          mr: { md: "6%" }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img
            src="/solidaridad_logo_dark.png"
            alt="Logo"
            style={{ width: "120px", height: "auto" }}
          />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 500, mb: 2 }}>
          Login
        </Typography>

        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          Phone Number
        </Typography>
        <TextField
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          sx={{
            mt: 0.5,
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white"
            }
          }}
        />

        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          Password
        </Typography>
        <TextField
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            mt: 0.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white"
            }
          }}
        />

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            mt: 3,
            py: 1.3,
            borderRadius: "30px",
            background: "#799849",
            fontWeight: 600,
            "&:hover": { background: "#6a873c" }
          }}
        >
          {loading ? "Please wait..." : "LOGIN"}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Typography sx={{ fontSize: "14px", opacity: 0.8 }}>
            Forgot password?
          </Typography>
          <Typography sx={{ fontSize: "14px", opacity: 0.8 }}>
            Create an account
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
