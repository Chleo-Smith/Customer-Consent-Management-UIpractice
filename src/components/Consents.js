import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router";
import { consentData } from "../data/consentData";

export function Consents() {
  const navigate = useNavigate();

  return (
    <table>
      <thead>
        <tr>
          <th>Contact Method</th>
          <th>Status</th>
          <th>Status Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {consentData.data.consents.map((c) => (
          <tr key={c.id}>
            <td>{c.contactMethod}</td>
            <td>{c.status}</td>
            <td>{c.statusType}</td>
            <td>
              <IconButton
                color="primary"
                onClick={() => navigate(`/edit/${c.id}`)}
                aria-label={`Edit ${c.contactMethod} consent`}
              >
                <EditIcon />
              </IconButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
