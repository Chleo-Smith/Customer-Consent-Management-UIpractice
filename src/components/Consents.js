import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router";
import { consentData } from "../data/consentData";

export function Consents() {
  const navigate = useNavigate();

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
          {consentData.data.consents.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.contactMethod}</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell>{c.statusType}</TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/edit/${c.id}`)}
                  aria-label={`Edit ${c.contactMethod} consent`}
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
