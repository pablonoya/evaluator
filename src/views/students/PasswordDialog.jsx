import { useEffect, useState } from "react"

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Container,
} from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"

import authService from "../../services/authService"

export default function PasswordDialog(props) {
  const { open, handleClose, userId, showNotification } = props
  const [password, setPassword] = useState("")

  async function generatePassword(id) {
    try {
      const res = await authService.generatePassword(id)
      setPassword(res.data)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    generatePassword(userId)
  }, [open])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" scroll="body">
      <DialogTitle>Contraseña generada</DialogTitle>

      <DialogContent>
        <DialogContentText></DialogContentText>
        <Container>
          <Typography variant="h2">{password}</Typography>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
