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
  Chip,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState, useEffect } from "react";
import { consentData } from "../data/consentData";

export function Consents({ customerData, customerConsents, customerId }) {
  const [editingRowId, setEditingRowId] = useState(null);
  const [updatedConsents, setUpdatedConsents] = useState([]);

  // mapping API data to display name
  const contactMethodMap = {
    SMS: "SMS",
    EMAIL: "Email",
    PHONE: "Phone",
    POST: "Post",
    AUTOMATED_VOICE_CALLS: "Automated voice calls",
  };

  const transformApiConsents = (apiConsents) => {
    if (!apiConsents || !apiConsents.data || !apiConsents.data.businessUnits) {
      return [];
    }

    const transformedConsents = [];
    let idCounter = 1;

    apiConsents.data.businessUnits.forEach((businessUnit) => {
      businessUnit.consents.forEach((consent) => {
        transformedConsents.push({
          id: idCounter++,
          contactMethod:
            contactMethodMap[consent.contactMethod] || consent.contactMethod,
          originalContactMethod: consent.contactMethod,
          status:
            consent.status.charAt(0) + consent.status.slice(1).toLowerCase(),
          statusType:
            consent.statusType.charAt(0) +
            consent.statusType.slice(1).toLowerCase(),
          businessUnit: businessUnit.businessUnit,
          rawStatus: consent.status,
          rawStatusType: consent.statusType,
        });
      });
    });

    return transformedConsents;
  };

  useEffect(() => {
    if (customerConsents) {
      const apiConsents = transformApiConsents(customerConsents);
      setUpdatedConsents(apiConsents);
    } else if (!customerData) {
      // If no customer data, use default consents from consentData
      setUpdatedConsents(consentData.data.consents);
    } else {
      // Customer found but no consents yet (loading)
      setUpdatedConsents([]);
    }
  }, [customerConsents, customerData]);

  const handleEdit = (id) => {
    setEditingRowId(id);
  };

  const handleStatusChange = (id, newStatus) => {
    setUpdatedConsents((prevConsents) =>
      prevConsents.map((c) =>
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

  // Handler when user clicks "Save"
  const handleSave = (id) => {
    setUpdatedConsents((prevConsents) =>
      prevConsents.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status.includes("Accepted") ? "Accepted" : "Declined",
            }
          : c
      )
    );

    console.log("Saved consent data:", updatedConsents);
    setEditingRowId(null);
  };

  // Handler when user clicks "Cancel"
  const handleCancel = () => {
    setUpdatedConsents(consentData.data.consents);
    setEditingRowId(null);
  };

  //loading state
  // Show loading/empty state
  if (!customerData) {
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
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
            {updatedConsents.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.contactMethod}</TableCell>
                <TableCell>
                  {editingRowId === c.id ? (
                    <Select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    >
                      <MenuItem value="Accepted (Implicit)">Accepted</MenuItem>
                      <MenuItem value="Accepted (Explicit)">Accepted</MenuItem>
                      <MenuItem value="Declined (Implicit)">Declined</MenuItem>
                      <MenuItem value="Declined (Explicit)">
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
                      <IconButton
                        color="success"
                        aria-label="Save"
                        onClick={() => handleSave(c.id)}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="Cancel"
                        onClick={handleCancel}
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(c.id)}
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {updatedConsents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  <Typography variant="body1">
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
    <TableContainer component={Paper} sx={{ mt: 2 }}>
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
                    // FIXED: Remove Chip styling, just show plain text
                    c.status
                  )}
                </TableCell>

                <TableCell>
                  {/* FIXED: Remove Chip styling, just show plain text */}
                  {c.statusType}
                </TableCell>

                {/* Actions Cell */}
                <TableCell>
                  {editingRowId === c.id ? (
                    <>
                      <IconButton
                        color="success"
                        aria-label="Save"
                        onClick={() => handleSave(c.id)}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        aria-label="Cancel"
                        onClick={handleCancel}
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(c.id)}
                      aria-label="Edit"
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

      {/* Show data source info when customer consents are loaded */}
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

    //       {consentData.data.consents.map((c) => (
    //         <TableRow key={c.id}>
    //           <TableCell>{c.contactMethod}</TableCell>
    //           <TableCell>{c.status}</TableCell>
    //           <TableCell>{c.statusType}</TableCell>
    //           <TableCell>
    //             <IconButton
    //               color="primary"
    //               onClick={() => navigate(`/edit/${c.id}`)}
    //               aria-label={`Edit ${c.contactMethod} consent`}
    //             >
    //               <EditIcon />
    //             </IconButton>
    //           </TableCell>
    //         </TableRow>
    //       ))}
    //     </TableBody>
    //   </Table>
    // </TableContainer>
  );
}
