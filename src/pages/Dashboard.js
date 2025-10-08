import SearchIcon from "@mui/icons-material/Search";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  CircularProgress,
  Button,
  TextField,
  Typography,
  Stack,
  Box,
  Fab,
} from "@mui/material";
import { useState } from "react";
import { Consents } from "../components/Consents";
import BusinessUnit from "../components/BusinessUnit";

export function Dashboard({ mode, toggleTheme }) {
  const [idNumber, setIdNumber] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [customerConsents, setCustomerConsents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

  const handleIdChange = (event) => {
    const value = event.target.value.replace(/\D/g, ""); // only digits
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
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const data = await response.json();
      if (response.ok) setCustomerConsents(data);
      else setCustomerConsents(null);
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
    setSelectedUnit("");

    try {
      const response = await fetch(
        `http://localhost:3001/api/customer/${idNumber}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
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
    if (event.key === "Enter") handleSearch(event);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="search-form-container"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <TextField
          size="small"
          onChange={handleIdChange}
          onKeyPress={handleKeyPress}
          label="Enter ID number"
          variant="outlined"
          fullWidth
          value={idNumber}
          disabled={loading}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={loading} // disable during loading
          sx={{
            height: 40,
            backgroundColor: "#1976d2",
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            "&:hover": { backgroundColor: "#115293" },
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
            <DoneIcon sx={{ fontSize: 16, color: "white" }} />
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

      {/* Marketing Consent Header & Actions */}
      {customerData && (
        <Box className="header-with-buttons" sx={{ mt: 4 }}>
          <Typography variant="h2">Marketing Consent</Typography>
          <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
            Managing consents for:{" "}
            <strong>{customerData.data.customerName}</strong>
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<DoneIcon />}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                height: 40,
              }}
            >
              Accept All
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseIcon />}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                px: 3,
                height: 40,
              }}
            >
              Decline All
            </Button>
          </Stack>
        </Box>
      )}

      {/* Business Unit Filter */}
      {customerData?.data.businessUnits?.length > 0 && (
        <BusinessUnit
          businessUnits={customerData.data.businessUnits}
          value={selectedUnit}
          onChange={setSelectedUnit}
        />
      )}

      {/* Consents Table */}
      {customerData && (
        <Consents
          customerData={customerData}
          customerConsents={customerConsents}
          customerId={idNumber}
          error={error}
          selectedUnit={selectedUnit || null}
        />
      )}

      {/* Floating Theme Toggle FAB */}
      <Fab
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}
        color="primary"
        aria-label="toggle theme"
        onClick={toggleTheme}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </Fab>
    </Box>
  );
}
