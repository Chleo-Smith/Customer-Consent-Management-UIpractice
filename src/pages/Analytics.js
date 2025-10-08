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

export function Analytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    businessUnitData: [],
    totalAccepted: 0,
    totalDeclined: 0,
    totalConsents: 0,
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

  const { businessUnitData, totalAccepted, totalDeclined, totalConsents } =
    analyticsData;
  const acceptanceRate =
    totalConsents > 0 ? Math.round((totalAccepted / totalConsents) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Navigation Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Consent Analytics Dashboard</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Accepted
              </Typography>
              <Typography variant="h4" color="success.main">
                {totalAccepted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Declined
              </Typography>
              <Typography variant="h4" color="error.main">
                {totalDeclined}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Acceptance Rate
              </Typography>
              <Typography variant="h4" color="primary.main">
                {acceptanceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Consent Status by Business Unit
            </Typography>
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
                      fontSize: 12,
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
                    color: "#22a7eeff",
                  },
                  {
                    dataKey: "declined",
                    label: "Declined",
                    color: "#e700004f",
                  },
                ]}
                width={800}
                height={400}
                margin={{ left: 80, right: 50, top: 50, bottom: 120 }}
              />
            ) : (
              <Typography color="textSecondary" align="center">
                No consent data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Analytics;
