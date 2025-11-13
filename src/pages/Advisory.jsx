// src/pages/Advisory.jsx
import React, { useState, useEffect, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
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
  Link,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const ADVISORY_TYPES = [
  { id: 1, name: "Cultivation" },
  { id: 2, name: "Plant Protection" },
  { id: 3, name: "Cultural Operation" },
  { id: 4, name: "General" },
];

const Advisory = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State
  const [advisories, setAdvisories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [showFiles, setShowFiles] = useState({});

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const pdfRef = useRef();
  const imgRef = useRef();
  const videoRef = useRef();
  const audioRef = useRef();

  // Fetch Advisories
  useEffect(() => {
    const fetchAdvisories = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/getAdvisory`);
        const data = res.data?.data || res.data || [];
        setAdvisories(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load advisories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisories();
  }, []);

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    const result = advisories.filter(
      (a) =>
        a.title?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
    );
    setFiltered(result);
    setPage(0);
  }, [search, advisories]);

  // Action Menu
  const handleMenuOpen = (e, adv) => {
    setAnchorEl(e.currentTarget);
    setSelected(adv);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  // Add
  const handleAdd = () => {
    reset();
    pdfRef.current.value = "";
    imgRef.current.value = "";
    videoRef.current.value = "";
    audioRef.current.value = "";
    setOpenAdd(true);
  };

  const onAddSubmit = async (data) => {
    const formData = new FormData();
    formData.append("advisory_type", data.advisory_type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (pdfRef.current.files[0]) formData.append("pdf_file", pdfRef.current.files[0]);
    if (imgRef.current.files[0]) formData.append("image_file", imgRef.current.files[0]);
    if (videoRef.current.files[0]) formData.append("video_file", videoRef.current.files[0]);
    if (audioRef.current.files[0]) formData.append("audio_file", audioRef.current.files[0]);

    try {
      const res = await axios.post(`${API_BASE}/addAdvisory`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdvisories((prev) => [...prev, res.data.data]);
      setOpenAdd(false);
    } catch (err) {
      alert("Failed to add advisory.");
    }
  };

  // Edit
  const handleEdit = () => {
    setValue("advisory_type", selected.advisory_type);
    setValue("title", selected.title);
    setValue("description", selected.description);
    setOpenEdit(true);
    handleMenuClose();
  };

  const onEditSubmit = async (data) => {
    const formData = new FormData();
    formData.append("id", selected.id);
    formData.append("advisory_type", data.advisory_type);
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (pdfRef.current.files[0]) formData.append("pdf_file", pdfRef.current.files[0]);
    if (imgRef.current.files[0]) formData.append("image_file", imgRef.current.files[0]);
    if (videoRef.current.files[0]) formData.append("video_file", videoRef.current.files[0]);
    if (audioRef.current.files[0]) formData.append("audio_file", audioRef.current.files[0]);

    try {
      await axios.post(`${API_BASE}/updateAdvisory`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdvisories((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? {
                ...a,
                advisory_type: data.advisory_type,
                title: data.title,
                description: data.description,
              }
            : a
        )
      );
      setOpenEdit(false);
    } catch (err) {
      alert("Update failed.");
    }
  };

  // Delete
  const handleDelete = () => {
    setOpenDelete(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await axios.post(`${API_BASE}/deleteAdvisory`, { id: selected.id });
      setAdvisories((prev) => prev.filter((a) => a.id !== selected.id));
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setOpenDelete(false);
    }
  };

  // Toggle file visibility
  const toggleFiles = (id) => {
    setShowFiles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pagination
  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
        <Box>
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
                  backgroundColor: isDark ? "#1f1f1f" : "#37474f",
                  color: isDark ? "#fff" : "#fff",
                  textAlign: "left",
                }}
              >
                {["Id", "Type", "Title", "Description", "Action"].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 16px",
                      fontWeight: 400,
                      fontSize: "0.85rem",
                      borderTopLeftRadius: i === 0 ? "8px" : 0,
                      borderTopRightRadius: i === 4 ? "8px" : 0,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((adv) => (
                <React.Fragment key={adv.id}>
                  <tr
                    style={{
                      backgroundColor: isDark ? "#1e1e1e" : "#fff",
                      boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.08)",
                      borderRadius: "6px",
                    }}
                  >
                    <td style={{ padding: "6px 10px", fontSize: "0.85rem" }}>{adv.id}</td>
                    <td style={{ padding: "6px 10px", fontSize: "0.85rem" }}>
                      {ADVISORY_TYPES.find((t) => t.id === adv.advisory_type)?.name || adv.advisory_type}
                    </td>
                    <td style={{ padding: "6px 10px", fontWeight: 500, fontSize: "0.9rem" }}>
                      {adv.title}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        maxWidth: 380,
                        whiteSpace: "normal",
                        lineHeight: "1.4",
                        fontSize: "0.85rem",
                        color: isDark ? "#ddd" : "#333",
                      }}
                    >
                      {adv.description}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "right", width: "70px" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, adv)}
                        sx={{ color: isDark ? "#ccc" : "#555" }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>

                  {/* Show Files Row */}
                  {showFiles[adv.id] && (
                    <tr>
                      <td colSpan={5} style={{ padding: "6px 12px", backgroundColor: isDark ? "#1b1b1b" : "#f9f9f9" }}>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                          {adv.document && (
                            <Link href={adv.document} target="_blank" rel="noopener" sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "#d32f2f",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                              fontSize: "0.8rem",
                            }}>
                              <PictureAsPdfIcon fontSize="small" />
                              PDF Document
                            </Link>
                          )}
                          {adv.image && <Link href={adv.image} target="_blank" rel="noopener" color="primary" sx={{ fontSize: "0.8rem" }}>Image</Link>}
                          {adv.video && <Link href={adv.video} target="_blank" rel="noopener" color="primary" sx={{ fontSize: "0.8rem" }}>Video</Link>}
                          {adv.audio && <Link href={adv.audio} target="_blank" rel="noopener" color="primary" sx={{ fontSize: "0.8rem" }}>Audio</Link>}
                        </Box>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" }, mt: 2 }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage={"Rows per page:"}
              sx={{
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  color: isDark ? "#fff" : "inherit",
                },
              }}
            />
          </Box>
        </Box>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { minWidth: 150 } }}>
        <MenuItem onClick={handleEdit} sx={{ gap: 1 }}>
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem onClick={() => toggleFiles(selected.id)} sx={{ gap: 1 }}>
          <VisibilityOffIcon fontSize="small" /> {showFiles[selected?.id] ? "Hide" : "Show"} Files
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main", gap: 1 }}>
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      {/* Add / Edit Dialog */}
      <Dialog open={openAdd || openEdit} onClose={() => { setOpenAdd(false); setOpenEdit(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {openAdd ? "Add Advisory" : "Edit Advisory"}
          <IconButton onClick={() => { setOpenAdd(false); setOpenEdit(false); }} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit(openAdd ? onAddSubmit : onEditSubmit)}>
          <DialogContent dividers>
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                select
                label="Advisory Type *"
                {...register("advisory_type", { required: "Type is required" })}
                error={!!errors.advisory_type}
                helperText={errors.advisory_type?.message}
              >
                {ADVISORY_TYPES.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Title *"
                {...register("title", { required: "Title is required" })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />

              <TextField
                label="Description *"
                multiline
                rows={3}
                {...register("description", { required: "Description is required" })}
                error={!!errors.description}
                helperText={errors.description?.message}
              />

              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                Media Files (Optional)
              </Typography>

              {["pdf", "image", "video", "audio"].map((type) => (
                <Box key={type}>
                  <Typography variant="body2" color="text.secondary">
                    {type === "pdf" && "PDF Advisory (.pdf)"}
                    {type === "image" && "Image Advisory (only .jpeg)"}
                    {type === "video" && "Video Advisory (only .mp4)"}
                    {type === "audio" && "Voice Advisory (only .mp3)"}
                  </Typography>
                  <Button variant="outlined" component="label" size="small" sx={{ mt: 1 }}>
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept={
                        type === "pdf" ? ".pdf" :
                        type === "image" ? ".jpeg,.jpg" :
                        type === "video" ? ".mp4" : ".mp3"
                      }
                      ref={type === "pdf" ? pdfRef : type === "image" ? imgRef : type === "video" ? videoRef : audioRef}
                    />
                  </Button>
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {(type === "pdf" ? pdfRef : type === "image" ? imgRef : type === "video" ? videoRef : audioRef).current?.files[0]?.name || "No file chosen"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => { setOpenAdd(false); setOpenEdit(false); }}>CANCEL</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#7B984C", "&:hover": { bgcolor: "#7B984C" } }}>SAVE</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Advisory?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{selected?.title}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Advisory;
