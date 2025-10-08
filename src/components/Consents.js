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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import { consentData } from "../data/consentData";

export function Consents({
  customerData,
  customerConsents,
  customerId,
  error,
}) {
  const [editingRowId, setEditingRowId] = useState(null);
  const [updatedConsents, setUpdatedConsents] = useState([]);
  const [confirmedConsents, setConfirmedConsents] = useState([]);

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
    if (!apiConsents?.data?.businessUnits) return [];
    let idCounter = 1;
    return apiConsents.data.businessUnits.flatMap((bu) =>
      bu.consents.map((consent) => ({
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
      }))
    );
  };

  // Load consents from API or default
  useEffect(() => {
    if (customerConsents) {
      const apiConsents = transformApiConsents(customerConsents);
      setUpdatedConsents(apiConsents);
      setConfirmedConsents(apiConsents);
    } else if (!customerData || error) {
      setUpdatedConsents(defaultContactMethods);
      setConfirmedConsents(defaultContactMethods);
    } else {
      setUpdatedConsents([]);
      setConfirmedConsents([]);
    }
  }, [customerConsents, customerData, error, customerId]);

  const handleEdit = (id) => setEditingRowId(id);

  const handleStatusChange = (id, newStatus) => {
    setUpdatedConsents((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              statusType: newStatus.includes("Implicit")
                ? "Implicit"
                : "Explicit",
            }
          : c
      )
    );
  };

  const handleSave = (id) => {
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
      statusType: "Explicit",
    }));
    setUpdatedConsents(newConsents);
    setConfirmedConsents(newConsents);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2, p: 2 }}>
      {/* Bulk action buttons at the top */}
      {updatedConsents.length > 0 && (
        <Stack direction="row" spacing={2} mb={2}>
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
          {updatedConsents.length === 0 && customerData && !customerConsents ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ py: 4, color: "text.secondary" }}
              >
                <Typography variant="body1">Loading consent data...</Typography>
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
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      <MenuItem value="Accepted (Implicit)">Accepted</MenuItem>
                      <MenuItem value="Accepted (Explicit)">Accepted</MenuItem>
                      <MenuItem value="Declined (Implicit)">Declined</MenuItem>
                      <MenuItem value="Declined (Explicit)">Declined</MenuItem>
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
                        onClick={() => handleSave(c.id)}
                      >
                        <SaveIcon />
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

      {/* Data source info */}
      {customerConsents && (
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
    </TableContainer>
  );
}
