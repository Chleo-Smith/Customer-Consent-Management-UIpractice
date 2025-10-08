import { CssBaseline, ThemeProvider } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useState, useMemo } from "react";
import { ResponsiveAppBar } from "./components/Nav";
import "./styles.css";
import { Dashboard } from "./pages/Dashboard";
import { darkTheme, lightTheme } from "./components/theme";

export default function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(
    () => (mode === "light" ? lightTheme : darkTheme),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div className="App">
        <ResponsiveAppBar />

        {/* Removed the toggle switch here */}

        <Routes>
          <Route
            path="/"
            element={<Dashboard mode={mode} toggleTheme={toggleTheme} />}
          />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
