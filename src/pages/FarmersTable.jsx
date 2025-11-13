// src/pages/Farmer.jsx
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
  Menu,
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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const Farmer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  // State
  const [farmers, setFarmers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch Farmers
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/farmer_summary`);
        const data = res.data?.data || res.data || [];
        setFarmers(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load farmers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    const result = farmers.filter(
      (f) =>
        f.name?.toLowerCase().includes(term) ||
        f.grower_id?.includes(term)
    );
    setFiltered(result);
    setPage(0);
  }, [search, farmers]);

  // Export Excel
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/export-user-data`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "farmers.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export failed.");
    }
  };

  // Action Menu
  const handleMenuOpen = (e, farmer) => {
    setAnchorEl(e.currentTarget);
    setSelectedFarmer(farmer);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFarmer(null);
  };

  // Edit
  const handleEdit = () => {
    setValue("grower_id", selectedFarmer.grower_id);
    setValue("name", selectedFarmer.name);
    setValue("gender", selectedFarmer.gender?.toLowerCase());
    setValue("address", selectedFarmer.address || "");
  setValue("total_agri_area", selectedFarmer.total_agri_area || "");
setValue("rubber_area_mature", selectedFarmer.rubber_area_mature || "");
setValue("rubber_area_immature", selectedFarmer.rubber_area_immature || "");
    setValue("farmType", selectedFarmer.farmType || "");
    setValue("latitude", selectedFarmer.latitude || "");
    setValue("longitude", selectedFarmer.longitude || "");
    setValue("harvestingTree", selectedFarmer.harvestingTree || "");
    setValue("yield", selectedFarmer.yield || "");
    setValue("harvestingTrade", selectedFarmer.harvestingTrade || "");
    setOpenEdit(true);
    handleMenuClose();
  };

  const onEditSubmit = async (data) => {
    try {
      await axios.post(`${API_BASE}/update_farmer_summary`, {
        grower_id: selectedFarmer.grower_id,
        ...data,
      });
      setFarmers((prev) =>
        prev.map((f) =>
          f.grower_id === selectedFarmer.grower_id ? { ...f, ...data } : f
        )
      );
    } catch (err) {
      alert("Update failed.");
    } finally {
      setOpenEdit(false);
      reset();
    }
  };

  // Delete
  const handleDelete = () => {
    setOpenDelete(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await axios.post(`${API_BASE}/delete_farmer_summary`, {
        grower_id: selectedFarmer.grower_id,
      });
      setFarmers((prev) =>
        prev.filter((f) => f.grower_id !== selectedFarmer.grower_id)
      );
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setOpenDelete(false);
    }
  };

  // Pagination
  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      elevation={3}
      sx={{
        maxWidth: 1400,
        mx: "auto",
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        bgcolor: isDark ? "#1e1e1e" : "background.paper",
      }}
    >
     
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
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "#7B984C",
            "&:hover": { bgcolor: "#7B984C" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Download Excel
        </Button>

        <TextField
          placeholder="Search by name..."
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

      {/* Loading / Error */}
      {loading && (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Table */}
      {!loading && (
        <Box sx={{ overflowX: "auto" }}>
          <table
           style={{
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 8px",
      borderRadius: "8px",
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
                {[
                  "S.No",
                  "Grower Id",
                  "Name",
                  "Gender",
                  "Total Agri Area",
                  "Mature Area",
                  "Immature Area",
                  "Trees",
                  "Trade",
                  "Action",
                ].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((farmer, idx) => (
                <tr
                  key={farmer.grower_id}
                 style={{
          backgroundColor: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          borderRadius: "6px",
        }}
                >
                  <td style={{ padding: "10px 12px", fontSize: "0.9rem" }}>
                    {page * rowsPerPage + idx + 1}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {farmer.grower_id}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{farmer.name}</td>
                  <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>
                    {farmer.gender}
                  </td>
                 <td style={{ padding: "10px 12px" }}>{farmer.total_agri_area}</td>
<td style={{ padding: "10px 12px" }}>{farmer.rubber_area_mature}</td>
<td style={{ padding: "10px 12px" }}>{farmer.rubber_area_immature}</td>
                  <td style={{ padding: "10px 12px" }}>{farmer.harvesting_tree}</td>
                  <td style={{ padding: "10px 12px" }}>{farmer.harvesting_trade} kg</td>
                  <td style={{ padding: "10px 12px" }}>
                    <IconButton onClick={(e) => handleMenuOpen(e, farmer)}>
                      <MoreVertIcon />
                    </IconButton>
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
                },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Update Farmer Summary
          <IconButton
            onClick={() => setOpenEdit(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <DialogContent dividers>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField label="GROWER ID" value={selectedFarmer?.grower_id} disabled />
              <TextField label="NAME" {...register("name")} fullWidth />

              <TextField label="ADDRESS" {...register("address")} fullWidth />
              <TextField label="GENDER" {...register("gender")} fullWidth />

             <TextField label="TOTAL AGRI AREA" {...register("total_agri_area")} fullWidth />
<TextField label="RUBBER AREA MATURE" {...register("rubber_area_mature")} fullWidth />
<TextField label="RUBBER AREA IMMATURE" {...register("rubber_area_immature")} fullWidth />
              <TextField label="FARM TYPE" {...register("farmType")} fullWidth />

              <TextField label="LATITUDE" {...register("latitude")} fullWidth />
              <TextField label="LONGITUDE" {...register("longitude")} fullWidth />

              <TextField label="HARVESTING TREE" {...register("harvestingTree")} fullWidth />
              <TextField label="YIELD" {...register("yield")} fullWidth />

              <TextField label="HARVESTING TRADE" {...register("harvestingTrade")} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setOpenEdit(false)}>CANCEL</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#7B984C", "&:hover": { bgcolor: "#7B984C" } }}
            >
              SAVE
            </Button>
          </DialogActions>
        </form>
      </Dialog>

     
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Farmer?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedFarmer?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Farmer;