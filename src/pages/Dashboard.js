import SearchIcon from "@mui/icons-material/Search";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { Button, TextField, Typography, Stack, Box } from "@mui/material";
import { useState } from "react";
import { Consents } from "../components/Consents";
import BusinessUnit from "../components/BusinessUnit";

export function Dashboard() {
  const [idNumber, setIdNumber] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [customerConsents, setCustomerConsents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

  // const getApiBaseUrl = () => {
  //   // check if we're in development
  //   if (
  //     window.location.hostname === "localhost" ||
  //     window.location.hostname === "127.0.0.1"
  //   ) {
  //     return "http://localhost:3001"; // local middleware
  //   } else {
  //     // production
  //     return "https://owafrdb867.execute-api.eu-west-1.amazonaws.com/sbx";
  //   }
  // };

  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "" // production url
      : "http://localhost:8080"; // Use port 8080 for development

  // Handle ID input change
  const handleIdChange = (event) => {
    const value = event.target.value.replace(/\D/g, ""); // only digits
    if (value.length <= 13) {
      setIdNumber(value);
      setError("");
      setSearchSuccess(false);
    }
  };

  // Fetch customer consents by customer ID
  const fetchCustomerConsents = async (customerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/consents/${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "Sanlam-ConsentUI/1.0",
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
      setCustomerConsents(null);
    }
  };

  // Handle search
  const handleSearch = async (event) => {
    event.preventDefault();

    if (!idNumber) return setError("Please enter an ID number");
    if (idNumber.length !== 13)
      return setError("ID number must be exactly 13 digits");

    setLoading(true);
    setError("");
    setCustomerData(null);
    setCustomerConsents(null);
    setSearchSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/${idNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Sanlam-ConsentUI/1.0",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCustomerData(data);
        setSearchSuccess(true);
        setSelectedUnit(""); // reset business unit selection
        await fetchCustomerConsents(data.data.customerId);
      } else {
        setError(data.error?.message || "Customer not found");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        window.location.hostname === "localhost"
          ? "Failed to connect to server. Please check if the server is running."
          : "Failed to connect to Sanlam API. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") handleSearch(event);
  };

  return (
    <>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form-container">
        <TextField
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
          sx={{
            ml: 2,
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

      {/* Error */}
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

      {/* Customer Info */}
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

      {/* Marketing Consent Header and Actions */}
      {searchSuccess && customerData && (
        <>
          <Typography variant="h3" sx={{ mt: 4 }}>
            Marketing Consents
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
            Managing consents for:{" "}
            <strong>{customerData.data.customerName}</strong>
          </Typography>

          {/* Business Unit Filter */}
          {customerData.data.businessUnits?.length > 0 && (
            <BusinessUnit
              businessUnits={customerData.data.businessUnits}
              value={selectedUnit}
              onChange={setSelectedUnit}
            />
          )}

          {/* Consents Table */}
          {selectedUnit && (
            <Consents
              customerData={customerData}
              customerConsents={customerConsents}
              customerId={idNumber}
              error={error}
              selectedUnit={selectedUnit}
            />
          )}
        </>
      )}
    </>
  );
}
