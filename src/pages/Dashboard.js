import SearchIcon from "@mui/icons-material/Search";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { CircularProgress } from "@mui/material";

import { Button, TextField, Typography, Stack, Box, Fab } from "@mui/material";
import { useState } from "react";
import { Consents } from "../components/Consents";

export function Dashboard({ mode, toggleTheme }) {
  const [idNumber, setIdNumber] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [customerConsents, setCustomerConsents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState(false);

  const handleIdChange = (event) => {
    const value = event.target.value.replace(/\D/g, ""); // only allow digits
    if (value.length <= 13) {
      setIdNumber(value);
      setError("");
      setSearchSuccess(false);
    }
  };

  const fetchCustomerConsents = async (customerId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/consents/${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setCustomerConsents(data);
      } else {
        setCustomerConsents(null);
      }
    } catch (err) {
      console.error("Consents fetch error:", err);
      setCustomerConsents(null);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!idNumber) {
      setError("Please enter an ID number");
      return;
    }

    if (idNumber.length !== 13) {
      setError("ID number must be exactly 13 digits");
      return;
    }

    setLoading(true);
    setError("");
    setCustomerData(null);
    setCustomerConsents(null);
    setSearchSuccess(false);

    try {
      const response = await fetch(
        `http://localhost:3001/api/customer/${idNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCustomerData(data);
        setSearchSuccess(true);
        await fetchCustomerConsents(data.data.customerId);
      } else {
        setError(data.error?.message || "Customer not found");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Failed to connect to server. Please check if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(event);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search and Filter Form */}
      <form onSubmit={handleSearch} className="search-form-container">
        <TextField
          className="search-bar"
          size="small"
          onChange={handleIdChange}
          onKeyPress={handleKeyPress}
          label="Enter ID number"
          variant="outlined"
          fullWidth
          value={idNumber}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={loading} // don't click when loading
          sx={{
            ml: 2,
            height: 40,
            backgroundColor: "#1976d2",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </form>

      {/* Loader */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#ffebee",
            border: "2px solid #f44336",
            borderRadius: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: "#f44336",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            <CloseIcon sx={{ fontSize: 16, color: "white" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "#d32f2f", mb: 0.5 }}
            >
              Error: {error}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              <strong>ID:</strong> {idNumber} | <strong>Status:</strong> Not
              Found
            </Typography>
          </Box>
        </Box>
      )}

      {/* Success message */}
      {searchSuccess && customerData && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#e8f5e8",
            border: "2px solid #4caf50",
            borderRadius: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: "#4caf50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            <CloseIcon sx={{ fontSize: 16, color: "white" }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "#2e7d32", mb: 0.5 }}
            >
              Customer Found: {customerData.data.customerName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              <strong>ID:</strong> {idNumber} | <strong>Customer ID:</strong>{" "}
              {customerData.data.customerId} | <strong>Valid:</strong>{" "}
              {customerData.data.isValid ? "Yes" : "No"}
              {customerData.source && (
                <span>
                  {" "}
                  | <strong>Source:</strong> {customerData.source}
                </span>
              )}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header and Buttons */}
      <div className="header-with-buttons">
        <Typography variant="h2" sx={{ mt: 4 }}>
          Marketing Consent
        </Typography>

        {customerData && (
          <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
            Managing consents for:{" "}
            <strong>{customerData.data.customerName}</strong>
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            sx={{
              ml: 2,
              height: 40,
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
            }}
            color="success"
            startIcon={<DoneIcon />}
          >
            Accept All
          </Button>
          <Button
            variant="contained"
            sx={{
              ml: 2,
              height: 40,
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
            }}
            color="error"
            startIcon={<CloseIcon />}
          >
            Decline All
          </Button>
        </Stack>
      </div>

      {/* Consents */}
      <Consents
        customerData={customerData}
        customerConsents={customerConsents}
        customerId={idNumber}
        error={error}
      />

      {/* Floating Theme Toggle FAB */}
      <Fab
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
        }}
        color="primary"
        aria-label="toggle theme"
        onClick={toggleTheme}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </Fab>
    </Box>
  );
}
