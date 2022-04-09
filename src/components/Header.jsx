import { useState } from "react"

import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { AccountCircle } from "@mui/icons-material"

import { useHistory } from "react-router-dom"

import { useAuth } from "../contexts/authContext"

export default function Header(props) {
  const { drawerWidth, handleOpen } = props

  const [auth, handleAuth] = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const history = useHistory()

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    history.push("/perfil")
    handleClose()
  }

  const logout = () => {
    handleAuth(false)
    handleClose()
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleOpen}
          sx={{
            mr: 2,
            display: { sm: "none" },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
          Evaluador
        </Typography>

        {auth && (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={event => {
                setAnchorEl(event.currentTarget)
              }}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Perfil</MenuItem>
              <MenuItem onClick={logout}>Cerrar sesión</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  )
}
