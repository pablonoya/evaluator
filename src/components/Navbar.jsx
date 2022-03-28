import { useState } from "react"
import { Link } from "react-router-dom"

import { Box } from "@mui/system"
import {
  Toolbar,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"

import {
  Home,
  Assignment,
  Create,
  Send,
  Group,
  Topic,
  Description,
  BarChart,
} from "@mui/icons-material/"

import { filterItemsByGroups } from "../utils"
import { useAuth } from "./context"

const items = [
  {
    icon: <Topic />,
    name: "Temas",
    route: "/temas",
    groups: ["Docente"],
  },
  {
    icon: <Assignment />,
    name: "Tareas",
    route: "/tareas",
    groups: ["Docente"],
  },
  {
    icon: <Description />,
    name: "Ejercicios",
    route: "/ejercicios",
    groups: ["Alumnos", "Docente"],
  },
  {
    icon: <Send />,
    name: "Mis envíos",
    route: "/mis-envios",
    groups: ["Alumnos"],
  },
  {
    icon: <Group />,
    name: "Estudiantes",
    route: "/estudiantes",
    groups: ["Docente"],
  },
  {
    icon: <Send />,
    name: "Envíos",
    route: "/envios",
    groups: ["Docente"],
  },
  {
    icon: <BarChart />,
    name: "Estadísticas",
    route: "/estadisticas",
    groups: ["Docente"],
  },
]

export default function Navbar(props) {
  const { container, drawerWidth, open, handleOpen } = props

  const [selectedIndex, setSelectedIndex] = useState()
  const [auth, handleAuth] = useAuth()

  const drawerContent = (
    <div>
      <Toolbar>
        <ListItemButton onClick={() => setSelectedIndex(-1)} component={Link} to="/">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText>Home</ListItemText>
        </ListItemButton>
      </Toolbar>
      <Divider />
      <List>
        {filterItemsByGroups(items, auth?.groups).map((item, index) => (
          <ListItemButton
            key={index}
            selected={index == selectedIndex}
            onClick={() => setSelectedIndex(index)}
            component={Link}
            to={item.route}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.name}</ListItemText>
          </ListItemButton>
        ))}
      </List>
    </div>
  )

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        container={container}
        variant="temporary"
        open={open}
        onClose={handleOpen}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}
