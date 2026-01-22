import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  MenuItem,
  Button,
  useTheme,
  FormHelperText,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Stack,
  IconButton, 
  InputAdornment,           // ← ADD THIS LINE
} from "@mui/material";
import UploadIcon from '@mui/icons-material/Upload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
const QUALITY_API  = "https://rubbersheetquality-backend.demetrix.in/get_rubber_sheet_quality";
const IMPURITY_API = "https://rubbersheetquality-backend.demetrix.in/impurity_detection";
const UPLOAD_API    = "https://rubbersheetquality-backend.demetrix.in/upload";

const FarmerQuality = () => {
  const { farmerId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { state } = useLocation();                     // ← add this
  const farmerName = state?.farmerName || `Farmer ${farmerId}`;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [grade, setGrade] = useState("");

  const [impurityResults, setImpurityResults] = useState({});
  const [impurityLoading, setImpurityLoading] = useState({});

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadGrade, setUploadGrade] = useState("");
  const [uploadRemarks, setUploadRemarks] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Unified height for both image containers
  const imageContainerHeight = isMobile ? 320 : 440;
const imageInputRef = React.useRef(null);
const remarksInputRef = React.useRef(null);
  const imageContainerSx = {
    height: imageContainerHeight,
    borderRadius: 2,
    overflow: "hidden",
    bgcolor: "grey.50",
    border: "1px solid",
    borderColor: "divider",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const fetchQuality = async () => {
    try {
      const res = await axios.get(`${QUALITY_API}?farmer_id=${farmerId}`);
      setData(res.data?.data || []);
    } catch {
      setError("Failed to load rubber sheet quality data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, [farmerId]);

  const filteredData = data.filter((item) => {
    const created = new Date(item.created_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    return (
      (!from || created >= from) &&
      (!to || created <= to) &&
      (!grade || item.predicted_class === grade)
    );
  });

  const handleViewImpurity = async (item, index) => {
    if (impurityResults[index]) return;
    setImpurityLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const blob = await fetch(item.file_path).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, "sheet.jpg");
      formData.append("farmer_id", item.farmer_id);
      const res = await axios.post(IMPURITY_API, formData);
      setImpurityResults((prev) => ({ ...prev, [index]: res.data }));
    } catch {
      alert("Could not analyze impurity.");
    } finally {
      setImpurityLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleViewAllImpurity = async () => {
    for (let i = 0; i < filteredData.length; i++) {
      await handleViewImpurity(filteredData[i], i);
    }
  };

  const resetUpload = () => {
    setUploadImage(null);
    setUploadGrade("");
    setUploadRemarks(null);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleUpload = async () => {
    if (!uploadImage || !uploadGrade) {
      setUploadError("Image and grade are required.");
      return;
    }
    setUploadLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image_file", uploadImage);
      formData.append("rubber_grade", uploadGrade);
      if (uploadRemarks) formData.append("remarks", uploadRemarks);
      await axios.post(UPLOAD_API, formData);
      setUploadSuccess("Upload successful!");
      fetchQuality();
      resetUpload();
      setUploadOpen(false);
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress size={64} /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
const hasImages = data.length > 0;

  return (
    

  <Box sx={{ 
    p: { xs: 2, sm: 3, md: 4 }, 
    maxWidth: "1600px", 
    mx: "auto", 
    minHeight: "100vh" 
  }}>
    {/* Header */}
    <Stack
  direction={{ xs: "column", sm: "row" }}
  justifyContent="space-between"
  alignItems="center"
  spacing={2}
  mb={4}
>
  {/* Left side - Title + Farmer name below it */}
  <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
    <Typography 
      variant={isMobile ? "h6" : "h6"} 
      fontWeight={700}
      gutterBottom={false}
    >
      Rubber Sheet Quality
    </Typography>

    <Typography
      variant="body1"
      color="text.secondary"
      sx={{
        fontSize: { xs: '0.45rem', sm: '1rem' },
        mt: 0.5,                    // small spacing between title and farmer name
        fontWeight: 200,
      }}
    >
      Farmer Name: {farmerName}
    </Typography>
  </Box>

  {/* Right side - Buttons */}
  <Stack 
    direction="row" 
    spacing={2}
    sx={{ 
      justifyContent: { xs: "center", sm: "flex-end" },
      width: { xs: "100%", sm: "auto" }
    }}
  >
    <Button 
      variant="contained"
      sx={{ 
        textTransform: 'none',
        color: "#fff",
        bgcolor: "#7B984C",
        "&:hover": { bgcolor: "#6A8740" },   // slightly darker hover for better feedback
      }} 
      onClick={() => setUploadOpen(true)}
    >
      Upload
    </Button>

    {filteredData.length > 0 && (
      <Button
        variant="contained"
        sx={{ 
          textTransform: 'none',
          color: "#fff", 
          bgcolor: "#7B984C",
          "&:hover": { bgcolor: "#6A8740" },
        }}
        onClick={handleViewAllImpurity}
        disabled={Object.values(impurityLoading).some(Boolean)}
      >
        Detect All
      </Button>
    )}
  </Stack>
</Stack>

    {/* Filters */}
  {/* Filters */}
{hasImages && (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    mb={5}
    sx={{ flexWrap: "wrap", justifyContent: { xs: "center", sm: "flex-start" } }}
  >
    <TextField
      type="date"
      label="From Date"
      InputLabelProps={{ shrink: true }}
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      sx={{ minWidth: 160, flex: 1 }}
    />

    <TextField
      type="date"
      label="To Date"
      InputLabelProps={{ shrink: true }}
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      sx={{ minWidth: 160, flex: 1 }}
    />

    <TextField
      select
      label="Grade"
      value={grade}
      onChange={(e) => setGrade(e.target.value)}
      sx={{ minWidth: 180, flex: 1 }}
    >
      <MenuItem value="">All Grades</MenuItem>
      {[...new Set(data.map(d => d.predicted_class))].map(g => (
        <MenuItem key={g} value={g}>{g}</MenuItem>
      ))}
    </TextField>
  </Stack>
)}


    {/* Cards – one per row, side-by-side images inside */}
    <Stack spacing={4}>
      {filteredData.map((item, index) => {
        const imp = impurityResults[index];
        const analyzing = impurityLoading[index];

        // Same height for both image areas
        const imageHeight = isMobile ? 280 : 420;

        return (
         
 <Card
  key={index}
  elevation={3}
  sx={{
    borderRadius: 3,
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
  }}
>
  <CardContent sx={{ p: { xs: 2, md: 3 }, pb: 2 }}>
    <Stack spacing={3}>
      {/* Grade + Impurity status */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Chip
          label={`Grade: ${item.predicted_class}`}
          color="primary"
          variant="outlined"
          size="medium"
        />

        {imp ? (
          <Chip
            label={`Impurity: ${imp.impurity_percentage}%`}
            color="error"
            size="medium"
          />
        ) : (
          <Button
            variant="contained"
            // color="#7B984C"
            
            size="medium"
            
            onClick={() => handleViewImpurity(item, index)}
            disabled={analyzing}
            sx={{ minWidth: 160,textTransform: 'none',bgcolor: "#7B984C", color: "#fff",borderColor: "#7B984C",
            "&:hover": { bgcolor: "#6A8740", borderColor: "#6A8740" }, }}
          >
            {analyzing ? "Analyzing..." : "Detect Impurity"}
          </Button>
        )} 
      </Stack>

      <Divider />

      {/* Images – original left corner, impurity right corner */}
      {/* Always two equal columns – no layout jump */}
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",           // ← always 50/50
    gap: 0,                                    // no gap between images
    borderRadius: 2,
    overflow: "hidden",
    bgcolor: "grey.50",
    border: "1px solid",
    borderColor: "divider",
  }}
>
  {/* Left: Original Image */}
  <Box
    sx={{
      height: imageContainerHeight,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRight: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography
      variant="subtitle2"
      fontWeight={600}
      color="text.secondary"
      sx={{
        position: "absolute",
        top: 8,
        left: 12,
        bgcolor: "rgba(255,255,255,0.85)",
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        zIndex: 10,
      }}
    >
      Original Image
    </Typography>

    <img
      src={item.file_path}
      alt="Original rubber sheet"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
      }}
    />
  </Box>

  {/* Right: Impurity Detection (placeholder or result) */}
  <Box
    sx={{
      height: imageContainerHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <Typography
      variant="subtitle2"
      fontWeight={600}
      
      sx={{
        position: "absolute",
        top: 8,
        right: 12,
        bgcolor: "rgba(255,255,255,0.85)",
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        zIndex: 10,
      }}
    >
      Impurity Mask
    </Typography>

    {imp ? (
      <img
        src={imp.masked_image_path}
        alt="Impurity detection result"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    ) : analyzing ? (
      <CircularProgress color="error" size={60} />
    ) : (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: "center", px: 3 }}
      >
        Not yet analyzed
      </Typography>
    )}
  </Box>
</Box>

      {/* Timestamp at bottom right */}
      <Typography variant="caption" color="text.secondary" align="right">
        {new Date(item.created_at).toLocaleString()}
      </Typography>
    </Stack>
  </CardContent>
</Card>
);
      })}
    </Stack>

    {filteredData.length === 0 && (
      <Alert severity="info" sx={{ mt: 0, mx: "auto",  }}>
        No images found .
      </Alert>
    )}

      {/* Upload Dialog */}
     <Dialog
  open={uploadOpen}
  onClose={() => setUploadOpen(false)}
  maxWidth="sm"
  fullWidth
  fullScreen={isMobile}
>
  <DialogTitle sx={{
    fontWeight: 600,
    pb: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid",
    borderColor: "divider",
  }}>
    Add New Image
    <IconButton
      aria-label="close"
      onClick={() => setUploadOpen(false)}
      sx={{ color: "text.secondary" }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ py: 3 }}>
    <Stack spacing={3}>
      {/* Image Upload */}
      <TextField
        fullWidth
        label="Select Image"
        value={uploadImage ? uploadImage.name : ""}
        placeholder="No file chosen"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end" sx={{ mr: 1.5 }}>
              {/* <UploadIcon
                color={uploadImage ? "success" : "action"}
                fontSize="medium"
              /> */}
            </InputAdornment>
          ),
        }}
        onClick={() => imageInputRef.current?.click()}
        sx={{
          cursor: 'pointer',
          '& .MuiOutlinedInput-root': {
            pr: 1,
            '&:hover': { bgcolor: 'action.hover' },
            '& fieldset': { borderColor: uploadImage ? 'success.main' : undefined },
          },
          '& .MuiInputBase-root': { cursor: 'pointer' },
        }}
      />

      {/* Hidden file input - Image */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          setUploadImage(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />

      {/* Grade */}
      <TextField
        select
        fullWidth
        label="Grade"
        value={uploadGrade}
        onChange={(e) => setUploadGrade(e.target.value)}
      >
        {["1", "2", "3", "3 after", "4", "4 after"].map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </TextField>

      {/* Remarks (optional file) – now same style as Image */}
      <TextField
        fullWidth
        label="Remarks (optional file)"
        value={uploadRemarks ? uploadRemarks.name : ""}
        placeholder="No file chosen"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end" sx={{ mr: 1.5 }}>
              {/* <UploadIcon
                color={uploadRemarks ? "success" : "action"}
                fontSize="medium"
              /> */}
            </InputAdornment>
          ),
        }}
        onClick={() => remarksInputRef.current?.click()}
        sx={{
          cursor: 'pointer',
          '& .MuiOutlinedInput-root': {
            pr: 1,
            '&:hover': { bgcolor: 'action.hover' },
            '& fieldset': { borderColor: uploadRemarks ? 'success.main' : undefined },
          },
          '& .MuiInputBase-root': { cursor: 'pointer' },
        }}
      />

      {/* Hidden file input - Remarks */}
      <input
        ref={remarksInputRef}
        type="file"
        hidden
        onChange={(e) => {
          setUploadRemarks(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />

      {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
      {uploadSuccess && <Alert severity="success" sx={{ mt: 1 }}>{uploadSuccess}</Alert>}
    </Stack>
  </DialogContent>

  <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
    <Button
      onClick={() => setUploadOpen(false)}
      sx={{ textTransform: "none", color: "text.secondary" }}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      onClick={handleUpload}
      disabled={uploadLoading || !uploadImage || !uploadGrade}
      sx={{
        bgcolor: "#7B984C",
        "&:hover": { bgcolor: "#6A8740" },
        textTransform: "none",
        px: 4,
        fontWeight: 500,
      }}
    >
      {uploadLoading ? "Uploading..." : "Add Image"}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default FarmerQuality;