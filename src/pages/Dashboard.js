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
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Consents } from "../components/Consents";

export function Dashboard() {
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
        <form /* onSubmit={handleSearch} */ className="search-form-container">
          <TextField
            className="search-bar"
            size="small"
            //   onChange={(event) => setSearchTerm(event.target.value)}
            label="Enter ID number"
            variant="outlined"
            fullWidth
            //   value={searchTerm}
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
      </div>

      <div className="header-with-buttons">
        <Typography variant="h2" sx={{ mt: 4 }}>
          Marketing Consent
        </Typography>
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
      <Consents />
    </>
  );
}
