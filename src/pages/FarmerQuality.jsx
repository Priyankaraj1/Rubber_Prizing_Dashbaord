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
  useMediaQuery,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

/* =======================
   API
======================= */
const QUALITY_API =
  "https://rubbersheetquality-backend.demetrix.in/get_rubber_sheet_quality";

const IMPURITY_API =
  "https://rubbersheetquality-backend.demetrix.in/impurity_detection";

/* =======================
   COMPONENT
======================= */
const FarmerQuality = () => {
  const { farmerId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [grade, setGrade] = useState("");

  const [impurityResults, setImpurityResults] = useState({});
  const [impurityLoading, setImpurityLoading] = useState(null);

  const IMAGE_HEIGHT = isMobile ? 260 : 260;

  /* =======================
     FETCH DATA
  ======================= */
  useEffect(() => {
    const fetchQuality = async () => {
      try {
        const res = await axios.get(`${QUALITY_API}?farmer_id=${farmerId}`);
        setData(res.data?.data || []);
      } catch {
        setError("Failed to fetch rubber sheet quality data");
      } finally {
        setLoading(false);
      }
    };
    fetchQuality();
  }, [farmerId]);

  /* =======================
     FILTER
  ======================= */
  const filteredData = data.filter((item) => {
    const created = new Date(item.created_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const dateMatch = (!from || created >= from) && (!to || created <= to);
    const gradeMatch = !grade || item.predicted_class === grade;

    return dateMatch && gradeMatch;
  });

  /* =======================
     IMPURITY HANDLER
  ======================= */
  const handleViewImpurity = async (item, index) => {
    try {
      setImpurityLoading(index);

      const blob = await fetch(item.file_path).then((r) => r.blob());

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");
      formData.append("farmer_id", item.farmer_id);

      const res = await axios.post(IMPURITY_API, formData);

      setImpurityResults((prev) => ({
        ...prev,
        [index]: res.data,
      }));
    } catch {
      alert("Failed to fetch impurity data");
    } finally {
      setImpurityLoading(null);
    }
  };

  /* =======================
     LOADING & ERROR
  ======================= */
  if (loading)
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  /* =======================
     UI
  ======================= */
  return (
  <Box maxWidth="100%" mx={0} p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Rubber Sheet Quality
      </Typography>

      {/* FILTERS */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <TextField
          select
          label="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          {[...new Set(data.map((d) => d.predicted_class))].map((g) => (
            <MenuItem key={g} value={g}>
              {g}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* EMPTY */}
      {filteredData.length === 0 ? (
        <Box mt={8} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            No images uploaded
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredData.map((item, index) => {
            const impurity = impurityResults[index];

            return (
              <Grid item xs={12} key={index}>
                <Card
                  sx={{
                    borderRadius: 2,
                    justifyItems: "center"
,
                    border: "1px solid #eee",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "grid",
                     gridTemplateColumns: isMobile
  ? "1fr"
  : "1.4fr 1fr 1.4fr",

                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    {/* ORIGINAL IMAGE */}
                    <Box
                      sx={{
                        height: IMAGE_HEIGHT,
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                        bgcolor: "#f5f5f5",
                      }}
                    >
                      <img
                        src={item.file_path}
                        alt="Original"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      {impurity && (
                        <Typography
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Original
                        </Typography>
                      )}
                    </Box>

                    {/* CENTER INFO */}
                    <Box
                      textAlign="center"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1.5}
                    >
                      <Typography fontWeight={600} fontSize={16}>
                        Grade: {item.predicted_class} (After)
                      </Typography>

                      {impurity ? (
                        <Box
                          sx={{
                            px: 2,
                            py: 0.8,
                            borderRadius: 1.5,
                            bgcolor: "#fdecea",
                            color: "#d32f2f",
                            fontWeight: 600,
                          }}
                        >
                          Impurity:{" "}
                          {(impurity.impurity_percentage * 100).toFixed(2)}%
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          sx={{
                            px: 3,
                            py: 1,
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                          onClick={() => handleViewImpurity(item, index)}
                          disabled={impurityLoading === index}
                        >
                          {impurityLoading === index
                            ? "Analyzing..."
                            : "View Impurity"}
                        </Button>
                      )}
                    </Box>

                    {/* IMPURITY IMAGE */}
                    {impurity && (
                      <Box
                        sx={{
                          height: IMAGE_HEIGHT,
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                          bgcolor: "#f5f5f5",
                        }}
                      >
                        <img
                          src={impurity.masked_image_path}
                          alt="Impurity"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        <Typography
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "#d32f2f",
                            color: "#fff",
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Impurity
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default FarmerQuality;
