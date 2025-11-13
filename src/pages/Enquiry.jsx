// src/pages/Enquiry.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
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
  Link,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import { useForm } from "react-hook-form";
import axios from "axios";

const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const Enquiry = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  // State
  const [enquiries, setEnquiries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [openReply, setOpenReply] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const imageRef = useRef();
  const videoRef = useRef();
  const audioRef = useRef();
  const pdfRef = useRef();

  // Fetch Enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/getEnquiries`);
        const data = res.data?.data || res.data || [];
        setEnquiries(data);
        setFiltered(data);
      } catch (err) {
        setError("Failed to load enquiries.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  // Search
  useEffect(() => {
    const term = search.toLowerCase();
    const result = enquiries.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.phone?.includes(term) ||
        e.query?.toLowerCase().includes(term)
    );
    setFiltered(result);
    setPage(0);
  }, [search, enquiries]);

  // Open Reply Modal
 // Open Reply Modal
const handleReply = (enquiry) => {
  setSelected(enquiry);
  reset();

  setOpenReply(true);

  // Wait for dialog to render, then clear inputs
  setTimeout(() => {
    if (imageRef.current) imageRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
    if (audioRef.current) audioRef.current.value = "";
    if (pdfRef.current) pdfRef.current.value = "";
  }, 100);
};

  // Open View Reply Modal
  const handleView = (enquiry) => {
    setSelected(enquiry);
    setOpenView(true);
  };

  // Submit Reply
  const onReplySubmit = async (data) => {
    const formData = new FormData();
    formData.append("enquiry_id", selected.id);
    formData.append("query_answer", data.query_answer);
    if (imageRef.current.files[0]) formData.append("image_answer", imageRef.current.files[0]);
    if (videoRef.current.files[0]) formData.append("video_answer", videoRef.current.files[0]);
    if (audioRef.current.files[0]) formData.append("audio_answer", audioRef.current.files[0]);
    if (pdfRef.current.files[0]) formData.append("docs_pdf", pdfRef.current.files[0]);

    try {
      await axios.post(`${API_BASE}/replyEnquiry`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update local state
      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === selected.id
            ? {
                ...e,
                admin_reply: [
                  {
                    query_answer: data.query_answer,
                    image_answer: imageRef.current.files[0]?.name || null,
                    video_answer: videoRef.current.files[0]?.name || null,
                    audio_answer: audioRef.current.files[0]?.name || null,
                    docs_pdf: pdfRef.current.files[0]?.name || null,
                  },
                ],
              }
            : e
        )
      );
      setOpenReply(false);
    } catch (err) {
      alert("Failed to send reply.");
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
            maxWidth: 1200,
            mx: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            bgcolor: isDark ? "#1e1e1e" : "background.paper",
          }}
        >
      {/* Search */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <TextField
          placeholder="Search enquiries..."
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
                {["Id", "Name", "Phone", "Query", "Image", "Video", "Audio", "Action"].map((h) => (
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
  {paginated.map((enq) => (
    <tr
      key={enq.id}
      style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
         backgroundColor: isDark ? "#1e1e1e" : "white",
        borderRadius: "8px",
      }}
    >
      <td style={{ padding: "10px 12px" }}>{enq.id}</td>
      <td style={{ padding: "10px 12px", fontWeight: 500 }}>{enq.name}</td>
      <td style={{ padding: "10px 12px" }}>{enq.phone}</td>
      <td style={{ padding: "10px 12px", maxWidth: 200, whiteSpace: "normal" }}>
        {enq.query}
      </td>

      {/* Image column */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        {enq.image ? (
          <img
            src={enq.image}
            alt="query"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ) : (
          ""
        )}
      </td>

      {/* Video column */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        {enq.video ? (
          <video
            src={enq.video}
            controls
            style={{
              width: 80,
              height: 60,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        ) : (
          ""
        )}
      </td>

      {/* Audio column */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        {enq.audio ? (
          <audio
            controls
            src={enq.audio}
            style={{ width: "100%" }}
          />
        ) : (
          ""
        )}
      </td>

      {/* Action column */}
      <td style={{ padding: "10px 12px", textAlign: "center" }}>
        {enq.admin_reply && enq.admin_reply.length > 0 ? (
          <IconButton onClick={() => handleView(enq)} color="primary">
            <ArrowDownwardIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => handleReply(enq)} color="success">
            <SendIcon />
          </IconButton>
        )}
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

      {/* Reply Modal */}
      <Dialog open={openReply} onClose={() => setOpenReply(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reply to Farmer</DialogTitle>
        <IconButton
          onClick={() => setOpenReply(false)}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <form onSubmit={handleSubmit(onReplySubmit)}>
          <DialogContent dividers>
            <TextField
              label="Query answer"
              multiline
              rows={3}
              fullWidth
              {...register("query_answer", { required: "Answer is required" })}
              error={!!errors.query_answer}
              helperText={errors.query_answer?.message}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>Image (Optional)</Typography>
            <Button variant="outlined" component="label" size="small">
              Choose File
              <input type="file" hidden accept="image/*" ref={imageRef} />
            </Button>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {imageRef.current?.files[0]?.name || "No file chosen"}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Video (Optional)</Typography>
            <Button variant="outlined" component="label" size="small">
              Choose File
              <input type="file" hidden accept="video/*" ref={videoRef} />
            </Button>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {videoRef.current?.files[0]?.name || "No file chosen"}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Voice (Optional)</Typography>
            <Button variant="outlined" component="label" size="small">
              Choose File
              <input type="file" hidden accept="audio/*" ref={audioRef} />
            </Button>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {audioRef.current?.files[0]?.name || "No file chosen"}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Docs or PDF (Optional)</Typography>
            <Button variant="outlined" component="label" size="small">
              Choose File
              <input type="file" hidden accept=".pdf,.doc,.docx" ref={pdfRef} />
            </Button>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {pdfRef.current?.files[0]?.name || "No file chosen"}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenReply(false)}>CANCEL</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: "#7B984C" }}>
              SEND
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Reply Modal */}
      {/* View Reply Modal */}
<Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Admin Reply</DialogTitle>
  <IconButton
    onClick={() => setOpenView(false)}
    sx={{ position: "absolute", right: 8, top: 8 }}
  >
    <CloseIcon />
  </IconButton>
  <DialogContent dividers>
    {selected?.admin_reply?.[0] ? (
      <Box sx={{ display: "grid", gap: 2 }}>
        <Typography><strong>Answer:</strong> {selected.admin_reply[0].query_answer}</Typography>

        {selected.admin_reply[0].image_answer && (
          <Box>
            <Typography variant="subtitle2">Image:</Typography>
            <img
              src={selected.admin_reply[0].image_answer}
              alt="Reply Image"
              style={{
                width: "100%",
                maxHeight: 250,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </Box>
        )}

        {selected.admin_reply[0].video_answer && (
          <Box>
            <Typography variant="subtitle2">Video:</Typography>
            <video
              src={selected.admin_reply[0].video_answer}
              controls
              style={{
                width: "100%",
                borderRadius: 8,
                maxHeight: 250,
              }}
            />
          </Box>
        )}

        {selected.admin_reply[0].audio_answer && (
          <Box>
            <Typography variant="subtitle2">Audio:</Typography>
            <audio
              controls
              src={selected.admin_reply[0].audio_answer}
              style={{ width: "100%" }}
            />
          </Box>
        )}

        {selected.admin_reply[0].docs_pdf && (
          <Box>
            <Typography variant="subtitle2">Document/PDF:</Typography>
            <iframe
              src={selected.admin_reply[0].docs_pdf}
              title="PDF Preview"
              style={{
                width: "100%",
                height: 400,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            />
          </Box>
        )}
      </Box>
    ) : (
      <Typography>No reply yet.</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenView(false)}>Close</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default Enquiry;