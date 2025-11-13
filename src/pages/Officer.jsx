// src/pages/Officer.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  TablePagination,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import axios from "axios";

const GENDERS = ["male", "female"];

const Officer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  // -----------------------------------------------------------------
  // State
  // -----------------------------------------------------------------
  const [officers, setOfficers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // -----------------------------------------------------------------
  // Fetch officers (GET)
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://rubber-backend.solidaridadasia.com/api/getOfficerData"
        );
        // API may return { data: [...] } or just [...]
        const data = res.data?.data || res.data || [];
        setOfficers(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load officers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  // -----------------------------------------------------------------
  // Search filter
  // -----------------------------------------------------------------
  useEffect(() => {
    const term = search.toLowerCase();
    const result = officers.filter(
      (o) =>
        o.name?.toLowerCase().includes(term) ||
        o.id?.includes(term) ||
        o.phone?.includes(term)
    );
    setFiltered(result);
    setPage(0);
  }, [search, officers]);

  // -----------------------------------------------------------------
  // Add officer (POST) – replace URL with your real endpoint
  // -----------------------------------------------------------------
  const onAddSubmit = async (formData) => {
    try {
      // ----> REPLACE WITH YOUR ADD API <----
      await axios.post("https://rubber-backend.solidaridadasia.com/api/register", formData);
      console.log("Add payload:", formData);

      // Mock new officer (remove when real API is used)
      const newOfficer = {
        id: Math.max(...officers.map((o) => o.id || 0), 0) + 1,
        id: `OFF${1000 + officers.length + 1}`,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        status: true, // active by default
      };
      setOfficers((prev) => [...prev, newOfficer]);
    } catch (err) {
      alert("Failed to add officer.");
    } finally {
      setOpenAdd(false);
      reset();
    }
  };

  
  // Toggle status (PATCH/PUT) – replace URL with your real endpoint
const toggleStatus = async (officer) => {
  const newStatus = !officer.status;
  try {
   
    console.log("Toggle status", officer.id, "→", newStatus);

    setOfficers((prev) =>
      prev.map((o) => (o.id === officer.id ? { ...o, status: newStatus } : o))
    );
  } catch (err) {
    alert("Failed to update status.");
  }
};
  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // -----------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------
  return (
    <Box
      elevation={3}
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        bgcolor: isDark ? "#1e1e1e" : "background.paper",
      }}
    >
      {/* ---------- Header ---------- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "#7B984C",
            "&:hover": { bgcolor: "#388e3c" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add Officer
        </Button>

        <TextField
          placeholder="Search officers..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />
      </Box>

      {/* ---------- Loading / Error ---------- */}
      {loading && (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {/* ---------- Table ---------- */}
      {!loading && (
        <Box sx={{ overflowX: "auto" }}>
          <table
             style={{
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 8px",
    }}
          >
            <thead>
              <tr
                style={{
          backgroundColor: "#37474f",
          color: "white",
          textAlign: "left",
        }}
              >
                {["S.No", "Officer Id", "Name", "Phone", "Gender", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
              fontWeight: 400,
              fontSize: "0.85rem",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((officer, idx) => (
                <tr
                  key={officer.id}
                  style={{
                    backgroundColor: isDark ? "#1e1e1e" : "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: "0.9rem" }}>
                    {page * rowsPerPage + idx + 1}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {officer.id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{officer.name}</td>
                  <td style={{ padding: "10px 12px" }}>{officer.phone}</td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textTransform: "capitalize",
                    }}
                  >
                    {officer.gender}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Switch
                      checked={!!officer.status}
                      onChange={() => toggleStatus(officer)}
                      color="success"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#7B984C",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          { backgroundColor: "#7B984C" },
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              mt: 2,
            }}
          >
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
              sx={{
                ".MuiTablePagination-toolbar": {
                  fontSize: isMobile ? "0.8rem" : "0.875rem",
                  flexWrap: "wrap",
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  { fontSize: isMobile ? "0.75rem" : "0.875rem" },
              }}
            />
          </Box>
        </Box>
      )}

      {/* ---------- Add Officer Dialog ---------- */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          Add New Officer
          <IconButton
            onClick={() => setOpenAdd(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(onAddSubmit)}>
          <DialogContent dividers>
            <TextField
              label="Full Name"
              fullWidth
              margin="normal"
              {...register("name", { required: "Full Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              defaultValue="9696596965"
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Gender"
              fullWidth
              margin="normal"
              defaultValue=""
              {...register("gender", { required: "Gender is required" })}
              error={!!errors.gender}
              helperText={errors.gender?.message}
            >
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g} sx={{ textTransform: "capitalize" }}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setOpenAdd(false)} sx={{ textTransform: "none" }}>
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#7B984C",
                "&:hover": { bgcolor: "#7B984C" },
                textTransform: "none",
                px: 3,
              }}
            >
              ADD OFFICER
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Officer;