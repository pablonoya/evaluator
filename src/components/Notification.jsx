import { Snackbar } from "@material-ui/core"
import { Alert } from "@mui/material"

export default function Notification(props) {
  const { notificationOpen, handleClose, severity, notificationMessage } = props

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={notificationOpen}
      autoHideDuration={4000}
      onClose={handleClose}
    >
      <Alert severity={severity} onClose={handleClose}>
        {notificationMessage}
      </Alert>
    </Snackbar>
  )
}
