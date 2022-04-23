import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Container } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"
import DataTable from "../../components/DataTable"

const columns = [
  { field: "last_name", headerName: "Apellidos", flex: 0.3 },
  { field: "first_name", headerName: "Nombres", flex: 0.3 },
  { field: "username", headerName: "Usuario", flex: 0.2 },
  { field: "phone", headerName: "Teléfono", flex: 0.2 },
]

export default function UploadedDialog(props) {
  const { open, handleClose, uploadedUsers } = props

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" scroll="body" fullWidth>
      <DialogTitle>Estudiantes registrados</DialogTitle>

      <DialogContent>
        <Container>
          <DataTable
            columns={columns}
            rows={uploadedUsers}
            rowCount={uploadedUsers.count}
            paginationMode="client"
          />
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
