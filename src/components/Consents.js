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
  Box,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState, useEffect } from "react";

// Default/fallback contact methods if no customer data
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

export function Consents({ customerData, selectedUnit }) {
  const [editingRowId, setEditingRowId] = useState(null);
  const [updatedConsents, setUpdatedConsents] = useState([]);
  const [confirmedConsents, setConfirmedConsents] = useState([]);

  // Flatten consents for the selected business unit or use default
  useEffect(() => {
    if (!customerData) {
      setUpdatedConsents(defaultContactMethods);
      setConfirmedConsents(defaultContactMethods);
      return;
    }

    if (selectedUnit) {
      const bu = customerData.data.businessUnits.find(
        (b) => b.businessUnit.toUpperCase().replace(/\s/g, "_") === selectedUnit
      );

      const consents = bu?.consents || [];
      // Assign IDs if missing
      const mappedConsents = consents.map((c, idx) => ({
        id: c.id || idx + 1,
        ...c,
      }));

      setUpdatedConsents(mappedConsents);
      setConfirmedConsents(mappedConsents);
      setEditingRowId(null);
    } else {
      setUpdatedConsents([]);
      setConfirmedConsents([]);
    }
  }, [customerData, selectedUnit]);

  const handleEdit = (id) => setEditingRowId(id);

  const handleStatusChange = (id, newStatus) => {
    setUpdatedConsents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus, statusType: "Explicit" } : c
      )
    );
  };

  const handleConfirm = (id) => {
    setConfirmedConsents(
      updatedConsents.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status.includes("Accepted") ? "Accepted" : "Declined",
            }
          : c
      )
    );
    setEditingRowId(null);
  };

  const handleCancel = () => {
    setUpdatedConsents(confirmedConsents);
    setEditingRowId(null);
  };

  const handleUpdateAll = (action) => {
    const newConsents = updatedConsents.map((c) => ({
      ...c,
      status: action === "accept" ? "Accepted" : "Declined",
    }));
    setUpdatedConsents(newConsents);
    setConfirmedConsents(newConsents);
    console.log(`Updated all consents to ${action}:`, newConsents);
    // TODO: call backend API here
  };

  if (!customerData) {
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Status Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updatedConsents.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.contactMethod}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{c.statusType}</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))}
            {updatedConsents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  <Typography>
                    Search for a customer to view consents
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contact Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Status Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {updatedConsents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  <Typography>Loading consent data...</Typography>
                </TableCell>
              </TableRow>
            ) : (
              updatedConsents.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.contactMethod}</TableCell>
                  <TableCell>
                    {editingRowId === c.id ? (
                      <Select
                        value={c.status}
                        onChange={(e) =>
                          handleStatusChange(c.id, e.target.value)
                        }
                        size="small"
                      >
                        <MenuItem value="Accepted">Accepted</MenuItem>
                        <MenuItem value="Declined">Declined</MenuItem>
                      </Select>
                    ) : (
                      c.status
                    )}
                  </TableCell>
                  <TableCell>{c.statusType}</TableCell>
                  <TableCell>
                    {editingRowId === c.id ? (
                      <>
                        <IconButton
                          color="success"
                          onClick={() => handleConfirm(c.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton color="error" onClick={handleCancel}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(c.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Actions */}
      {updatedConsents.length > 0 && (
        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleUpdateAll("accept")}
            startIcon={<CheckIcon />}
          >
            Accept All
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleUpdateAll("decline")}
            startIcon={<CancelIcon />}
          >
            Decline All
          </Button>
        </Stack>
      )}
    </>
  );
}
