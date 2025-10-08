import * as React from "react";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

// Global business units
const globalBusinessUnits = [
  "Sanlam Personal Loans",
  "Sanlam Life Insurance",
  "Sanlam Rewards",
  "Sanlam Investment",
  "Financial Planning",
];

export default function BusinessUnit({ onChange, value }) {
  const theme = useTheme();

  // Map to {label, value} for dropdown
  const availableUnits = globalBusinessUnits.map((bu) => ({
    label: bu,
    value: bu.toUpperCase().replace(/\s/g, "_"),
  }));

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
        {availableUnits.map((bu) => (
          <MenuItem key={bu.value} value={bu.value}>
            {bu.label} {/* Nice display */}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
