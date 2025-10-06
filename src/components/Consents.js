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
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useState } from "react";
import { consentData } from "../data/consentData";

export function Consents() {
  const [editingRowId, setEditingRowId] = useState(null);
  const [updatedConsents, setUpdatedConsents] = useState(
    consentData.data.consents
  );

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

              <TableCell>
                {editingRowId === c.id ? (
                  <Select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  >
                    <MenuItem value="Accepted (Implicit)">
                      Accepted (Implicit)
                    </MenuItem>
                    <MenuItem value="Accepted (Explicit)">
                      Accepted (Explicit)
                    </MenuItem>
                    <MenuItem value="Declined (Implicit)">
                      Declined (Implicit)
                    </MenuItem>
                    <MenuItem value="Declined (Explicit)">
                      Declined (Explicit)
                    </MenuItem>
                  </Select>
                ) : (
                  c.status
                )}
              </TableCell>

              <TableCell>{c.statusType}</TableCell>

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
          ))}
        </TableBody>
      </Table>
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
