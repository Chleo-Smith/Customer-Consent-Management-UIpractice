import React from "react";
import { Container, Typography, Paper, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function Analytics() {
  const navigate = useNavigate();

  const handleBackToSearch = () => {
    navigate("/");
  };

  return "hello";
}

export default Analytics;
