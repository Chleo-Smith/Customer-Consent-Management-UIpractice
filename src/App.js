import {
  CssBaseline,
  FormControlLabel,
  Switch,
  ThemeProvider,
} from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import { ResponsiveAppBar } from "./components/Nav";
import logo from "./logo.svg";
import "./styles.css";
import { Dashboard } from "./pages/Dashboard";
import { darkTheme, lightTheme } from "./components/theme";

export default function App() {
  const [mode, setMode] = useState("light");
  const theme = mode === "light" ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div className="App">
        <ResponsiveAppBar />

        {/* Theme Toggle Switch */}
        <div className="theme-switch">
          <FormControlLabel
            control={
              <Switch checked={mode === "dark"} onChange={toggleTheme} />
            }
            label={mode === "dark" ? "Dark Mode" : "Light Mode"}
          />
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
