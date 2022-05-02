import { useState } from "react"

import { Box, Toolbar } from "@mui/material"

import Header from "./Header"
import Navbar from "./Navbar"
import Notification from "./Notification"

import RoutesList from "../routes/RoutesList"

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
    <Box sx={{ display: "flex" }}>
      <Header drawerWidth={drawerWidth} handleOpen={handleOpen} />
      <Navbar container={container} drawerWidth={drawerWidth} open={open} handleOpen={handleOpen} />

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Toolbar />
        <RoutesList showNotification={showNotification} />
      </Box>

      <Notification
        notificationOpen={notificationOpen}
        handleClose={() => setNotificationOpen(false)}
        notificationMessage={notificationMessage}
        severity={severity}
      />
    </Box>
  )
}
