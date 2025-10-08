import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

export function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    businessUnitData: [],
    totalAccepted: 0,
    totalDeclined: 0,
    totalConsents: 0,
    implicitCount: 0,
    explicitCount: 0,
  });

  useEffect(() => {
    const fetchConsentData = async () => {
      try {
        setLoading(true);

        // Fetch consents data from the API
        const response = await fetch("http://localhost:3001/consents");
        const consents = await response.json();

        // Process the data to create analytics
        const businessUnitStats = {};
        let totalAccepted = 0;
        let totalDeclined = 0;
        let totalConsents = 0;
        let implicitCount = 0;
        let explicitCount = 0;

        consents.forEach((consent) => {
          consent.businessUnits.forEach((bu) => {
            const businessUnit = bu.businessUnit;

            if (!businessUnitStats[businessUnit]) {
              businessUnitStats[businessUnit] = {
                businessUnit: businessUnit.replace("Sanlam ", ""), // Shorten for display
                accepted: 0,
                declined: 0,
              };
            }

            bu.consents.forEach((c) => {
              totalConsents++;

              // Count status types
              if (c.statusType === "IMPLICIT") {
                implicitCount++;
              } else if (c.statusType === "EXPLICIT") {
                explicitCount++;
              }

              // Count accepted/declined
              if (c.status === "ACCEPTED") {
                businessUnitStats[businessUnit].accepted++;
                totalAccepted++;
              } else if (c.status === "DECLINED") {
                businessUnitStats[businessUnit].declined++;
                totalDeclined++;
              }
            });
          });
        });

        const businessUnitData = Object.values(businessUnitStats);

        setAnalyticsData({
          businessUnitData,
          totalAccepted,
          totalDeclined,
          totalConsents,
          implicitCount,
          explicitCount,
        });
      } catch (error) {
        console.error("Error fetching consent data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentData();
  }, []);

  const handleBackToSearch = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const {
    businessUnitData,
    totalAccepted,
    totalDeclined,
    totalConsents,
    implicitCount,
    explicitCount,
  } = analyticsData;
  const acceptanceRate =
    totalConsents > 0 ? Math.round((totalAccepted / totalConsents) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Summary Cards */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Consent Analytics Dashboard
        </Typography>

        {/* Summary Cards in Header */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Accepted
              </Typography>
              <Typography
                variant="h5"
                color="success.main"
                sx={{ fontWeight: "bold" }}
              >
                {totalAccepted}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Declined
              </Typography>
              <Typography
                variant="h5"
                color="error.main"
                sx={{ fontWeight: "bold" }}
              >
                {totalDeclined}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography color="textSecondary" gutterBottom variant="caption">
                Acceptance Rate
              </Typography>
              <Typography
                variant="h5"
                color="primary.main"
                sx={{ fontWeight: "bold" }}
              >
                {acceptanceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Pie Chart - Left Side */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "500px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
              Consent Type Distribution
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {implicitCount > 0 || explicitCount > 0 ? (
                <PieChart
                  series={[
                    {
                      innerRadius: 60,
                      outerRadius: 120,
                      data: [
                        {
                          id: 0,
                          value: implicitCount,
                          label: "Implicit",
                          color: "#9c27b0",
                        },
                        {
                          id: 1,
                          value: explicitCount,
                          label: "Explicit",
                          color: "#ff9800",
                        },
                      ],
                    },
                  ]}
                  width={400}
                  height={350}
                />
              ) : (
                <Typography color="textSecondary" align="center">
                  No consent type data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Bar Chart - Right Side */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "500px" }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
              Consent Status by Business Unit
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "400px",
              }}
            >
              {businessUnitData.length > 0 ? (
                <BarChart
                  dataset={businessUnitData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "businessUnit",
                      label: "Business Unit Types",
                      tickPlacement: "middle",
                      tickLabelStyle: {
                        angle: -45,
                        textAnchor: "end",
                        fontSize: 11,
                        fontWeight: "bold",
                      },
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Number of Consents",
                    },
                  ]}
                  series={[
                    {
                      dataKey: "accepted",
                      label: "Accepted",
                      color: "#4caf50",
                    },
                    {
                      dataKey: "declined",
                      label: "Declined",
                      color: "#f44336",
                    },
                  ]}
                  width={550}
                  height={380}
                  margin={{ left: 80, right: 50, top: 30, bottom: 120 }}
                />
              ) : (
                <Typography color="textSecondary" align="center">
                  No consent data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Analytics;
