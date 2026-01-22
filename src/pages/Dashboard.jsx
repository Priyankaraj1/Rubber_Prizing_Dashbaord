// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Card from "../components/cards/Card.jsx";
import Graphs from "../components/Graphs/Graphs.jsx";

const PRICE_API = "https://agribot-backend.demetrix.in/fetch_rubber_prices";
const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const MARKETS = [
   { id: "all", name: "All Markets" },
    { id: "agartala", name: "Agartala" },
     { id: "kochi", name: "Kochi" },
      { id: "kottayam", name: "Kottayam" }, 
    ];


export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filters
  const [selectedGrade, setSelectedGrade] = useState("RSS4");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedMarket, setSelectedMarket] = useState("all");


  // Prices
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceDateUsed, setPriceDateUsed] = useState("");
  // Filters
const [showFilters, setShowFilters] = useState(false);
// const [fromDate, setFromDate] = useState(dayjs().startOf("month"));
// const [toDate, setToDate] = useState(dayjs());


const [fromDate, setFromDate] = useState(dayjs().subtract(2, "month"));
const [toDate, setToDate] = useState(dayjs());



  // Stats Modal
  const [openStats, setOpenStats] = useState(false);
  const [stats, setStats] = useState({
    leadFarmers: "",
    producerSociety: "",
    entrepreneur: "",
    demoPlots: "",
    farmersOutreached: "",
    farmersTrained: "",
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch prices with fallback
  const fetchPrices = async (date) => {
    try {
      const res = await axios.get(`${PRICE_API}?date=${date.format("YYYY-MM-DD")}`);
      if (res.data?.data && res.data.data.length > 0) {
        return { data: res.data.data, date: date.format("YYYY-MM-DD") };
      }
    } catch (err) {
      console.warn(`No data for ${date.format("YYYY-MM-DD")}`, err);
    }
    return null;
  };

  useEffect(() => {
    const loadPrices = async () => {
      setLoadingPrices(true);
      let data = null;
      let usedDate = "";

      // Try today
      data = await fetchPrices(dayjs());
      if (data) usedDate = data.date;
      else {
        // Try yesterday
        data = await fetchPrices(dayjs().subtract(1, "day"));
        if (data) usedDate = data.date;
        else {
          // Try 2 days ago
          data = await fetchPrices(dayjs().subtract(2, "day"));
          if (data) usedDate = data.date;
        }
      }

      if (data) {
        const grouped = data.data.reduce((acc, item) => {
          const market = item.market.toLowerCase();
          if (!acc[market]) acc[market] = { market: item.market, data: [] };
          acc[market].data.push({
            grade: item.grade,
            inr: item.INR,
            usd: item.USD,
          });
          return acc;
        }, {});

        setPrices(Object.values(grouped));
        setPriceDateUsed(usedDate);
      } else {
        setPrices([]);
        setPriceDateUsed("No data available");
      }
      setLoadingPrices(false);
    };

    loadPrices();
  }, []);

  // Filter prices
  const filteredPrices =
    selectedMarket === "all"
      ? prices
      : prices.filter((p) => p.market.toLowerCase() === selectedMarket);

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStats((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStats = async () => {
    try {
      const payload = {
        no_of_lead_farmers: parseInt(stats.leadFarmers) || 0,
        producer_society: parseInt(stats.producerSociety) || 0,
        entrepreneur_strengthened: parseInt(stats.entrepreneur) || 0,
        demo_plots: parseInt(stats.demoPlots) || 0,
        total_farmers_outreached: parseInt(stats.farmersOutreached) || 0,
        no_of_farmers_trained: parseInt(stats.farmersTrained) || 0,
      };

      await axios.post(`${API_BASE}/updateImmobile`, payload);
      setSnackbar({ open: true, message: "Stats updated successfully!", severity: "success" });
      setOpenStats(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update stats.",
        severity: "error",
      });
    }
  };
const filterInputSx = {
  // bgcolor: "#fff",
  borderRadius: 1,
  "& .MuiInputBase-input": {
    color: "#000", // text color
  },
  "& .MuiInputLabel-root": {
    color: "#555", // label
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2e7d32", // green when focused
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#ccc",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2e7d32",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2e7d32",
  },
};

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Cards */}
        <Card />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => setOpenStats(true)}
            sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
          >
            UPDATE STATS
          </Button>
         <Button
  variant="contained"
  sx={{ bgcolor: "#4caf50", "&:hover": { bgcolor: "#388e3c" } }}
  onClick={() => setShowFilters((prev) => !prev)}
>
  {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
</Button>

        </Box>

        {/* Price Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Rubber Prices for{" "}
            <Typography component="span" color="green" fontWeight="bold">
              {priceDateUsed === "No data available"
                ? "No Data"
                : dayjs(priceDateUsed).format("DD MMMM YYYY")}
            </Typography>
          </Typography>

          
{showFilters && (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      mt: 2,
      mb: 3,
      borderRadius: 2,
     backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
border: "1px solid #e0e0e0",

    }}
  >
    <Grid container spacing={2}>
      {/* Common style for all inputs */}
      {[
        {
          type: "date",
          label: "From Date",
          value: fromDate,
          onChange: (newValue) => setFromDate(newValue),
        },
        {
          type: "date",
          label: "To Date",
          value: toDate,
          onChange: (newValue) => setToDate(newValue),
        },
      ].map((item, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <DatePicker
            label={item.label}
            value={item.value}
            onChange={item.onChange}
            renderInput={(params) => (
              <TextField
  {...params}
  fullWidth
  size="small"
  sx={{ ...filterInputSx, height: "56px" }}
/>

            )}
          />
        </Grid>
      ))}

      {/* Market Dropdown */}
      <Grid item xs={12} sm={6} md={3}>
       <FormControl
  fullWidth
  size="small"
  sx={{ ...filterInputSx, height: "56px" }}
>

          <InputLabel sx={{ color: "#555" }}>Market</InputLabel>
          <Select
            value={selectedMarket}
            label="Market"
            onChange={(e) => setSelectedMarket(e.target.value)}
            sx={{ height: "100%" }} // match parent height
          >
            {MARKETS.map((market) => (
              <MenuItem key={market.id} value={market.id}>
                {market.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Grade Dropdown */}
      <Grid item xs={12} sm={6} md={3}>
       <FormControl
  fullWidth
  size="small"
  sx={{ ...filterInputSx, height: "56px" }}
>

          <InputLabel>Grade</InputLabel>
          <Select
            value={selectedGrade}
            label="Grade"
            onChange={(e) => setSelectedGrade(e.target.value)}
            sx={{ height: "100%" }}
          >
            <MenuItem value="RSS4">RSS4</MenuItem>
            <MenuItem value="RSS5">RSS5</MenuItem>
            <MenuItem value="Latex60%">Latex60%</MenuItem>
            <MenuItem value="ISNR20">ISNR20</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Apply Button */}
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            height: "56px", // same as inputs
            bgcolor: "#4caf50",
            "&:hover": { bgcolor: "#388e3c" },
          }}
          onClick={() => {
            console.log("Filter applied:", {
              from: fromDate.format("YYYY-MM-DD"),
              to: toDate.format("YYYY-MM-DD"),
              market: selectedMarket,
              grade: selectedGrade,
            });
          }}
        >
          APPLY FILTER
        </Button>
      </Grid>
    </Grid>
  </Paper>
)}



        </Box>

       
{loadingPrices ? (
  <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
    <CircularProgress />
  </Box>
) : filteredPrices.length === 0 ? (
  <Alert severity="info" sx={{ mb: 3, mx: "auto", maxWidth: 600 }}>
    No price data available for the selected filters.
  </Alert>
) : (
  <Box
    sx={{
      maxWidth: 1150,
      mx: "auto",
      mt: 4,
      mb: 6,
      px: { xs: 1, md: 2 },
    }}
  >
    {/* ───── DESKTOP: 3-column grid | MOBILE: 1-column stack ───── */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: { xs: 2, md: 3 },
      }}
    >
    {filteredPrices.map((market) => (
  <Paper
    key={market.market}
    elevation={2}
    sx={{
      borderRadius: "24px",
      overflow: "hidden",
      bgcolor: theme.palette.background.paper,
    }}
  >
    {/* ── MARKET HEADER ── */}
    <Box
      sx={{
        bgcolor: theme.palette.success.dark,
        color: theme.palette.common.white,
        py: 1.5,
        textAlign: "center",
        fontWeight: 600,
        fontSize: { xs: "1rem", md: "1.1rem" },
      }}
    >
      {market.market}
    </Box>

    {/* ── SUB-HEADER (Grade | INR | USD) ── */}
    <Box
      sx={{
        bgcolor:
          theme.palette.mode === "dark"
            ? theme.palette.success.main
            : "#6ea84a",
        color: "white",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        textAlign: "center",
        py: 1,
        fontWeight: 500,
        fontSize: { xs: "0.8rem", md: "0.9rem" },
      }}
    >
      <Typography>Grade</Typography>
      <Typography>INR</Typography>
      <Typography>USD</Typography>
    </Box>

    {/* ── DATA ROWS ── */}
    {market.data.map((item, idx) => (
      <Box
        key={idx}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          textAlign: "center",
          py: 1.5,
          borderBottom:
            idx === market.data.length - 1
              ? "none"
              : `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
          fontWeight: "bold",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>{item.grade}</Typography>

        <Typography sx={{ fontWeight: "bold" }} color="success.main">
          ₹{item.inr}
        </Typography>

        <Typography
          sx={{ fontWeight: "bold" }}
          color={theme.palette.mode === "dark" ? "grey.300" : "text.secondary"}
        >
          ${item.usd}
        </Typography>
      </Box>
    ))}
  </Paper>
))}

    </Box>
  </Box>
)}


        {/* Graphs Section */}
        <Box sx={{ mt: 6 }}>
         
         <Graphs
  fromDate={fromDate.format("YYYY-MM-DD")}
  toDate={toDate.format("YYYY-MM-DD")}
  selectedMarket={selectedMarket}
  selectedGrade={selectedGrade}
/>

        </Box>

        {/* Stats Update Dialog */}
        <Dialog open={openStats} onClose={() => setOpenStats(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Project Stats
            <IconButton
              aria-label="close"
              onClick={() => setOpenStats(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                { label: "Lead Farmers", name: "leadFarmers" },
                { label: "Producer Societies", name: "producerSociety" },
                { label: "Entrepreneurs Strengthened", name: "entrepreneur" },
                { label: "Demo Plots", name: "demoPlots" },
                { label: "Farmers Outreached", name: "farmersOutreached" },
                { label: "Farmers Trained", name: "farmersTrained" },
              ].map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  <TextField
                    label={field.label}
                    name={field.name}
                    value={stats[field.name]}
                    onChange={handleStatsChange}
                    type="number"
                    fullWidth
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStats(false)}>Cancel</Button>
           <Button
  onClick={handleUpdateStats}
  variant="contained"
  sx={{
    bgcolor: "#4caf50",
    "&:hover": { bgcolor: "#388e3c" },
    color: "#fff",
  }}
>
  Update
</Button>

          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}