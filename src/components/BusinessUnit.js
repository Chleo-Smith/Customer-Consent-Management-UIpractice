import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

// Allowed business units
const allowedUnits = [
  "SANLAM_PERSONAL_LOANS",
  "SANLAM_LIFE",
  "SANLAM_REWARDS",
  "SANLAM_INVESTMENTS",
  "FINANCIAL_PLANNING",
];

export default function BusinessUnit({ businessUnits = [], onChange, value }) {
  const theme = useTheme();

  // Filter customer business units against allowed units
  const availableUnits = (businessUnits || []).filter((bu) =>
    allowedUnits.includes(bu.businessUnit.toUpperCase().replace(/\s/g, "_"))
  );

  const handleChange = (event) => {
    onChange && onChange(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, width: 300 }}>
      <InputLabel id="business-unit-label">Business Unit</InputLabel>
      <Select
        labelId="business-unit-label"
        id="business-unit-select"
        value={value || ""}
        onChange={handleChange}
        input={<OutlinedInput label="Business Unit" />}
      >
        {availableUnits.map((bu) => {
          const formattedName = bu.businessUnit
            .toUpperCase()
            .replace(/\s/g, "_");
          return (
            <MenuItem key={formattedName} value={formattedName}>
              {bu.businessUnit}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
