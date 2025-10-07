import {
  CssBaseline,
  FormControlLabel,
  Switch,
  ThemeProvider,
  Paper,
  Fab,
} from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useMemo, useState } from "react";
import { ResponsiveAppBar } from "./components/Nav";
import logo from "./logo.svg";
import "./styles.css";
import { Dashboard } from "./pages/Dashboard";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { darkTheme, lightTheme } from "./components/theme";
import { getAppTheme } from "./components/theme";

export default function App() {
  const [mode, setMode] = useState("light");
  //  const theme = mode === "light" ? lightTheme : darkTheme;
  const theme = getAppTheme(mode);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Paper
        sx={{
          minHeight: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          borderRadius: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "auto",
        }}
      >
        <div className="App">
          <ResponsiveAppBar />

          {/* Theme Toggle Switch
          <div className="theme-switch">
            <FormControlLabel
              control={
                <Switch checked={mode === "dark"} onChange={toggleTheme} />
              }
              label={mode === "dark" ? "Dark Mode" : "Light Mode"}
            />
          </div> */}

          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>

          {/* Floating Theme Toggle Button */}
          <Fab
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1300,
            }}
            color="primary"
            aria-label="toggle theme"
            onClick={toggleTheme}
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </Fab>
        </div>
      </Paper>
    </ThemeProvider>
  );
}
