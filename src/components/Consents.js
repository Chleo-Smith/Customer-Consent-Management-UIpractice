import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import BusinessUnit from "./BusinessUnit";

// Global allowed business units (same for all customers)
const GLOBAL_BUSINESS_UNITS = [
  { label: "Sanlam Personal Loans", value: "SANLAM_PERSONAL_LOANS" },
  { label: "Sanlam Life Insurance", value: "SANLAM_LIFE" },
  { label: "Sanlam Rewards", value: "SANLAM_REWARDS" },
  { label: "Sanlam Investment", value: "SANLAM_INVESTMENTS" },
  { label: "Financial Planning", value: "FINANCIAL_PLANNING" },
];

export function Consents({
  customerData,
  customerConsents,
  customerId,
  error,
  selectedUnit,
}) {
  const [editingRowId, setEditingRowId] = useState(null);
  const [updatedConsents, setUpdatedConsents] = useState([]);
  const [confirmedConsents, setConfirmedConsents] = useState([]);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(
    selectedUnit || ""
  );
  const [loading, setLoading] = useState(true);

  const contactMethodMap = {
    SMS: "SMS",
    EMAIL: "Email",
    PHONE: "Phone",
    POST: "Post",
    AUTOMATED_VOICE_CALLS: "Automated voice calls",
  };

  const defaultContactMethods = [
    {
      id: 1,
      contactMethod: "Automated voice calls",
      status: "---",
      statusType: "---",
    },
    { id: 2, contactMethod: "Email", status: "---", statusType: "---" },
    { id: 3, contactMethod: "Phone", status: "---", statusType: "---" },
    { id: 4, contactMethod: "Post", status: "---", statusType: "---" },
    { id: 5, contactMethod: "SMS", status: "---", statusType: "---" },
  ];

  const transformApiConsents = (apiConsents) => {
    if (!apiConsents || !apiConsents.data || !apiConsents.data.businessUnits)
      return [];

    const transformed = [];
    let idCounter = 1;

    apiConsents.data.businessUnits.forEach((bu) => {
      bu.consents.forEach((consent) => {
        transformed.push({
          id: idCounter++,
          contactMethod:
            contactMethodMap[consent.contactMethod] || consent.contactMethod,
          originalContactMethod: consent.contactMethod,
          status:
            consent.status.charAt(0) + consent.status.slice(1).toLowerCase(),
          statusType:
            consent.statusType.charAt(0) +
            consent.statusType.slice(1).toLowerCase(),
          businessUnit: bu.businessUnit,
          rawStatus: consent.status,
          rawStatusType: consent.statusType,
        });
      });
    });

    return transformed;
  };

  // Load and filter consents
  useEffect(() => {
    setLoading(true);

    if (customerConsents) {
      const apiConsents = transformApiConsents(customerConsents);

      // Filter by selected business unit
      const filteredConsents = selectedBusinessUnit
        ? apiConsents.filter((c) => {
            const normalizedUnit = c.businessUnit
              ? c.businessUnit.toUpperCase().replace(/\s/g, "_")
              : "";
            return normalizedUnit === selectedBusinessUnit;
          })
        : apiConsents;

      setUpdatedConsents(filteredConsents);
      setConfirmedConsents(filteredConsents);
    } else if (!customerData || error) {
      setUpdatedConsents(defaultContactMethods);
      setConfirmedConsents(defaultContactMethods);
    } else {
      setUpdatedConsents([]);
      setConfirmedConsents([]);
    }

    setLoading(false);
  }, [customerConsents, customerData, error, selectedBusinessUnit, customerId]);

  const handleEdit = (id) => setEditingRowId(id);

  const handleStatusChange = (id, newStatus) => {
    setUpdatedConsents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus, statusType: "Explicit" } : c
      )
    );
  };

  const handleSave = (id) => {
    const newConsents = updatedConsents.map((c) =>
      c.id === id
        ? {
            ...c,
            status: c.status.includes("Accepted") ? "Accepted" : "Declined",
            statusType: "Explicit",
          }
        : c
    );
    setUpdatedConsents(newConsents);
    setConfirmedConsents(newConsents);
    setEditingRowId(null);
    console.log("Saved consent data:", newConsents);
  };

  const handleCancel = () => {
    setUpdatedConsents(confirmedConsents);
    setEditingRowId(null);
  };

  const handleUpdateAll = (action) => {
    const newConsents = updatedConsents.map((c) => ({
      ...c,
      status: action === "accept" ? "Accepted" : "Declined",
      statusType: "Explicit",
    }));
    setUpdatedConsents(newConsents);
    setConfirmedConsents(newConsents);
    console.log(`Updated all consents to ${action}:`, newConsents);
    // TODO: Call backend API here
  };

  return (
    <div>
      {/* ================== Loader ================== */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <div className="filter-buttons">
        {/* ================== Business Unit Dropdown ================== */}
        <BusinessUnit
          businessUnits={GLOBAL_BUSINESS_UNITS}
          value={selectedBusinessUnit}
          onChange={(val) => setSelectedBusinessUnit(val)}
        />
        {/* ================== Bulk Buttons ================== */}
        {updatedConsents.length > 0 && !loading && (
          <Stack direction="row" spacing={2} mb={2}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => handleUpdateAll("accept")}
            >
              Accept All
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleUpdateAll("decline")}
            >
              Decline All
            </Button>
          </Stack>
        )}
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Contact Method</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Status Type</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {updatedConsents.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  <Typography variant="body1">
                    No consent data available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              updatedConsents.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography variant="body2">{c.contactMethod}</Typography>
                    {customerConsents &&
                      customerConsents.data.businessUnits.length > 1 &&
                      c.businessUnit && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {c.businessUnit}
                        </Typography>
                      )}
                  </TableCell>

                  <TableCell>
                    {editingRowId === c.id ? (
                      <Select
                        value={c.status}
                        onChange={(e) =>
                          handleStatusChange(c.id, e.target.value)
                        }
                      >
                        <MenuItem value="Accepted">
                          Accepted (Explicit)
                        </MenuItem>
                        <MenuItem value="Declined">
                          Declined (Explicit)
                        </MenuItem>
                      </Select>
                    ) : (
                      c.status
                    )}
                  </TableCell>

                  <TableCell>{c.statusType}</TableCell>

                  <TableCell>
                    {editingRowId === c.id ? (
                      <>
                        <Stack direction="row" spacing={2} mb={2}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleSave(c.id)}
                            startIcon={<SaveIcon />}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleCancel(c.id)}
                            startIcon={<CancelIcon />}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(c.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Data Source Info */}
      {customerConsents && !loading && (
        <Typography
          variant="caption"
          sx={{ p: 2, display: "block", color: "text.secondary" }}
        >
          Data source: {customerConsents.source} | Customer ID:{" "}
          {customerConsents.data.customerId} | Business units:{" "}
          {customerConsents.data.businessUnits
            .map((bu) => bu.businessUnit)
            .join(", ")}
        </Typography>
      )}
    </div>
  );
}
