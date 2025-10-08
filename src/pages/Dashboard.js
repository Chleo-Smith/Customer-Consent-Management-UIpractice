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

  // Handle ID input change
  const handleIdChange = (event) => {
    const value = event.target.value.replace(/\D/g, ""); // only digits
    if (value.length <= 13) {
      setIdNumber(value);
      setError(""); // clear previous errors
      setSearchSuccess(false);
    }
  };

  // Fetch customer consents
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

  // Handle search
  const handleSearch = async (event) => {
    event.preventDefault();

    // Validation
    if (!idNumber) return setError("Please enter an ID number");
    if (idNumber.length !== 13)
      return setError("ID number must be exactly 13 digits");

    setLoading(true);
    setError("");
    setCustomerData(null);
    setCustomerConsents(null);
    setSearchSuccess(false);
    setSelectedUnit("");

    try {
      const response = await fetch(
        `http://localhost:3001/api/customer/${idNumber}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
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
        <div className="header-with-buttons">
          <Typography variant="h2" sx={{ mt: 4 }}>
            Marketing Consent
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, color: "text.secondary" }}>
            Managing consents for:{" "}
            <strong>{customerData.data.customerName}</strong>
          </Typography>
        </div>
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
    </>
  );
}
