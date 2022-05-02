// import "vite/modulepreload-polyfill"

import React from "react"
import ReactDOM from "react-dom"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import { BrowserRouter } from "react-router-dom"

import CssBaseline from "@mui/material/CssBaseline"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { esES as coreES } from "@mui/material/locale"
import { esES } from "@mui/x-data-grid"

import { AuthProvider } from "./contexts/authContext"
import App from "./App"

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  esES,
  coreES
)

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
)
