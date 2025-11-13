// src/pages/AdvisoryType.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  IconButton,
  Typography,
  TextField,
  TablePagination,
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
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const AdvisoryType = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [types, setTypes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch Advisory Types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/getAdvisoryTypes`);
        const data = res.data?.data || res.data || [];
        setTypes(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load advisory types.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    const result = types.filter((t) =>
      t.name?.toLowerCase().includes(term)
    );
    setFiltered(result);
    setPage(0);
  }, [search, types]);

  // Open Add Modal
  const handleAdd = () => {
    reset();
    setOpenAdd(true);
  };

  // Submit Add
  const onAddSubmit = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/addAdvisoryType`, {
        name: data.name,
      });
      setTypes((prev) => [...prev, res.data.data]);
      setOpenAdd(false);
    } catch (err) {
      alert("Failed to add advisory type.");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advisory type?")) return;
    try {
      setDeletingId(id);
      await axios.post(`${API_BASE}/deleteAdvisoryType`, { id });
      setTypes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setDeletingId(null);
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
        maxWidth: 1000,
        mx: "auto",
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
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
          onClick={handleAdd}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            bgcolor: "#7B984C",
            "&:hover": { bgcolor: "#7B984C" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add Advisory
        </Button>

        <TextField
          placeholder="Search advisory..."
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
                {["S.No", "Advisory Name", "Delete"].map((h) => (
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
              {paginated.map((type, index) => (
                <tr
                  key={type.id}
                  style={{
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    {page * rowsPerPage + index + 1}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                    {type.name}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <IconButton
                      onClick={() => handleDelete(type.id)}
                      disabled={deletingId === type.id}
                      color="error"
                    >
                      {deletingId === type.id ? (
                        <CircularProgress size={20} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
            />
          </Box>
        </Box>
      )}

      {/* Add Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Add Advisory
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
              label="Advisory Name"
              fullWidth
              {...register("name", {
                required: "Advisory name is required",
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setOpenAdd(false)}>CANCEL</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#7B984C", "&:hover": { bgcolor: "#7B984C" } }}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdvisoryType;