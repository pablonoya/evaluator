import React, { useState, useEffect } from "react"

import Box from "@mui/system/Box"
import Toolbar from "@mui/material/Toolbar"

import CssBaseline from "@mui/material/CssBaseline"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { esES as coreES } from "@mui/material/locale"
import { esES } from "@mui/x-data-grid"

const theme = createTheme(
  {
    palette: {
      primary: { main: "#1976d2" },
    },
  },
  esES,
  coreES
)

import Header from "./Header"
import Navbar from "./Navbar"
import Routes from "../routes/Routes"
import Notification from "./Notification"

const drawerWidth = 240

export default function Navigation(props) {
  const { window } = props

  const [open, setOpen] = useState(false)

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState(false)
  const [severity, setSeverity] = useState("info")

  const container = window !== undefined ? () => window().document.body : undefined

  const handleOpen = () => {
    setOpen(!open)
  }

  function showNotification(severity, message) {
    setSeverity(severity)
    setNotificationMessage(message)
    setNotificationOpen(true)
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header drawerWidth={drawerWidth} handleOpen={handleOpen} />
        <Navbar
          container={container}
          drawerWidth={drawerWidth}
          open={open}
          handleOpen={handleOpen}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
          <Toolbar />
          <Routes showNotification={showNotification} />
        </Box>

        <Notification
          notificationOpen={notificationOpen}
          handleClose={() => setNotificationOpen(false)}
          notificationMessage={notificationMessage}
          severity={severity}
        />
      </Box>
    </ThemeProvider>
  )
}
