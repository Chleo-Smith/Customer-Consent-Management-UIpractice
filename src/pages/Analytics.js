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
    contactMethodData: [],
    contactMethodFrequencyData: [],
    totalAccepted: 0,
    totalDeclined: 0,
    totalConsents: 0,
    implicitCount: 0,
    explicitCount: 0,
    mostPreferredMethod: "",
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
        const contactMethodStats = {};
        const contactMethodFrequencyStats = {};
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

              // Track contact method statistics
              if (!contactMethodStats[c.contactMethod]) {
                contactMethodStats[c.contactMethod] = {
                  contactMethod: c.contactMethod
                    .replace("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                  accepted: 0,
                  declined: 0,
                  total: 0,
                };
              }

              contactMethodStats[c.contactMethod].total++;

              // Track contact method frequency (how often each method is selected)
              if (!contactMethodFrequencyStats[c.contactMethod]) {
                contactMethodFrequencyStats[c.contactMethod] = {
                  contactMethod: c.contactMethod
                    .replace("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                  frequency: 0,
                };
              }

              contactMethodFrequencyStats[c.contactMethod].frequency++;

              // Count status types
              if (c.statusType === "IMPLICIT") {
                implicitCount++;
              } else if (c.statusType === "EXPLICIT") {
                explicitCount++;
              }

              // Count accepted/declined
              if (c.status === "ACCEPTED") {
                businessUnitStats[businessUnit].accepted++;
                contactMethodStats[c.contactMethod].accepted++;
                totalAccepted++;
              } else if (c.status === "DECLINED") {
                businessUnitStats[businessUnit].declined++;
                contactMethodStats[c.contactMethod].declined++;
                totalDeclined++;
              }
            });
          });
        });

        const businessUnitData = Object.values(businessUnitStats);
        const contactMethodData = Object.values(contactMethodStats);
        const contactMethodFrequencyData = Object.values(
          contactMethodFrequencyStats
        );

        // Find most preferred contact method (highest acceptance rate)
        let mostPreferredMethod = "";
        let highestAcceptanceRate = 0;

        contactMethodData.forEach((method) => {
          if (method.total > 0) {
            const acceptanceRate = (method.accepted / method.total) * 100;
            if (acceptanceRate > highestAcceptanceRate) {
              highestAcceptanceRate = acceptanceRate;
              mostPreferredMethod = method.contactMethod;
            }
          }
        });

        setAnalyticsData({
          businessUnitData,
          contactMethodData,
          contactMethodFrequencyData,
          totalAccepted,
          totalDeclined,
          totalConsents,
          implicitCount,
          explicitCount,
          mostPreferredMethod,
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
    contactMethodData,
    contactMethodFrequencyData,
    totalAccepted,
    totalDeclined,
    totalConsents,
    implicitCount,
    explicitCount,
    mostPreferredMethod,
  } = analyticsData;
  const acceptanceRate =
    totalConsents > 0 ? Math.round((totalAccepted / totalConsents) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Summary Cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          Consent Analytics Dashboard
        </Typography>

        {/* Summary Cards in Header */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent
              sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}
            >
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
            <CardContent
              sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}
            >
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
            <CardContent
              sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}
            >
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

          <Card sx={{ minWidth: 140 }}>
            <CardContent
              sx={{ p: 2, "&:last-child": { pb: 2 }, textAlign: "center" }}
            >
              <Typography color="textSecondary" gutterBottom variant="caption">
                Preferred Method
              </Typography>
              <Typography
                variant="body1"
                color="info.main"
                sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
              >
                {mostPreferredMethod || "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
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
                        angle: 0,
                        textAnchor: "middle",
                        fontSize: 11,
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

        {/* Contact Method Effectiveness Chart - Full Width */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: "400px", width: "100%" }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
              Contact Method Effectiveness
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
                width: "100%",
              }}
            >
              {contactMethodData && contactMethodData.length > 0 ? (
                <BarChart
                  dataset={contactMethodData}
                  xAxis={[
                    {
                      scaleType: "band",
                      dataKey: "contactMethod",
                      label: "Contact Methods",
                      tickPlacement: "middle",
                      tickLabelStyle: {
                        angle: 0,
                        fontSize: 11,
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
                      color: "#2196f3",
                    },
                    {
                      dataKey: "declined",
                      label: "Declined",
                      color: "#ff5722",
                    },
                  ]}
                  width={900}
                  height={280}
                  margin={{ left: 80, right: 50, top: 30, bottom: 80 }}
                />
              ) : (
                <Typography color="textSecondary" align="center">
                  No contact method data available
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
