import SearchIcon from "@mui/icons-material/Search";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Alert,
  Box,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Consents } from "../components/Consents";

export function Dashboard() {
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
      setError(""); // clear previous errors
      setSearchSuccess(false);
    }
  };

  // fetch customer consents
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

    // Validation
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
      // call middleware API
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
        // customer found
        setCustomerData(data);
        setSearchSuccess(true);

        //find consents for customer
        await fetchCustomerConsents(data.data.customerId);
      } else {
        //  customer not found or validation error
        setError(data.error?.message || "Customer not found");
        // console.log("Error:", data.error);
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

  //   const [customers, setCustomers] = useState([]);
  //   const [searchTerm, setSearchTerm] = useState("");
  //   const [loading, setLoading] = useState(false);

  //   const navigate = useNavigate();

  //   async function getDevices(search = "") {
  //     setLoading(true);
  //     const url = new URL("https://68871b87071f195ca97f46b5.mockapi.io/devices");

  //     if (search) url.searchParams.append("search", search);

  //     const response = await fetch(url);
  //     const data = await response.json();
  //     console.log("Fetched customer:", data);
  //     setCustomer(Array.isArray(data) ? data : []);
  //     setLoading(false);
  //   }

  //   useEffect(() => {
  //     getCustomer();
  //   }, []);

  //   const handleSearch = (event) => {
  //     event.preventDefault();
  //     getCustomers(searchTerm);
  //   };

  return (
    <>
      <div>
        {/* Search and Filter Form */}
        <form onSubmit={handleSearch} className="search-form-container">
          <TextField
            className="search-bar"
            size="small"
            //   onChange={(event) => setSearchTerm(event.target.value)}
            onChange={handleIdChange}
            onKeyPress={handleKeyPress}
            label="Enter ID number"
            variant="outlined"
            fullWidth
            //   value={searchTerm}
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
              "&:hover": {
                backgroundColor: "#115293",
              },
            }}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </form>
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
      </div>

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
            type="submit"
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
            type="submit"
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

      <Consents
        customerData={customerData}
        customerConsents={customerConsents}
        customerId={idNumber}
      />
    </>
  );
}
