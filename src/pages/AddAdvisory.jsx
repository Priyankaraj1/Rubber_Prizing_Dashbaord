import React, { useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://rubber-backend.solidaridadasia.com/api";

const ADVISORY_TYPES = [
  { id: 1, name: "Cultivation" },
  { id: 2, name: "Plant Protection" },
  { id: 3, name: "Cultural Operation" },
  { id: 4, name: "General" },
];

export default function AddAdvisory() {
  const navigate = useNavigate();

  const pdfRef = useRef();
  const imgRef = useRef();
  const videoRef = useRef();
  const audioRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
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
      });      alert("Advisory Added Successfully!");
      navigate("/advisory"); 
    } catch (err) {
      console.error(err);
      alert("Failed to add advisory.");
    }
  };
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add Advisory
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              select
              label="Advisory Type *"
              {...register("advisory_type", { required: "Type is required" })}
              error={!!errors.advisory_type}
              helperText={errors.advisory_type?.message}
            >
              {ADVISORY_TYPES.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
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
            <Typography variant="subtitle1" fontWeight={600} mt={1}>
              Media Files (Optional)
            </Typography>

            {[
              { type: "pdf", label: "PDF Advisory (.pdf)", accept: ".pdf", ref: pdfRef },
              { type: "image", label: "Image Advisory (.jpeg)", accept: ".jpeg,.jpg", ref: imgRef },
              { type: "video", label: "Video Advisory (.mp4)", accept: ".mp4", ref: videoRef },
              { type: "audio", label: "Voice Advisory (.mp3)", accept: ".mp3", ref: audioRef },
            ].map((f) => (
              <Box key={f.type}>
                <Typography variant="body2" color="text.secondary">
                  {f.label}
                </Typography>

                <Button variant="outlined" component="label" size="small" sx={{ mt: 1 }}>
                  Choose File
                  <input type="file" hidden accept={f.accept} ref={f.ref} />
                </Button>

                <Typography variant="caption" sx={{ ml: 1 }}>
                  {f.ref.current?.files[0]?.name || "No file chosen"}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button
              onClick={() => navigate("/advisory")}
              sx={{ color: "#555" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#7B984C",
                "&:hover": { bgcolor: "#6f8a45" },
              }}
            >
              Save Advisory
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
