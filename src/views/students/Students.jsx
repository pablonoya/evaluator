import { useState, useEffect } from "react"

import { Box } from "@mui/system"
import { LoadingButton } from "@mui/lab"
import { Add, Create, Delete, Password, Refresh, Restore } from "@mui/icons-material"
import { Button, Container, Grid, IconButton, Typography } from "@mui/material"

import DataTable from "../../components/DataTable"
import studentService from "../../services/studentService"

import FormDialog from "./FormDialog"
import PasswordDialog from "./PasswordDialog"

export default function Tasks(props) {
  const { showNotification } = props

  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formValues, setFormValues] = useState()

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [restoredPassword, setRestoredPassword] = useState(false)
  const [userId, setUserId] = useState(0)

  const columns = [
    { field: "cu", headerName: "CU", flex: 0.1 },
    { field: "first_name", headerName: "Nombres", flex: 0.2 },
    { field: "last_name", headerName: "Apellidos", flex: 0.2 },
    { field: "username", headerName: "Usuario", flex: 0.1 },
    { field: "email", headerName: "Email", flex: 0.2 },
    {
      field: "action",
      headerName: "Acciones",
      flex: 0.12,
      sortable: false,
      renderCell: actionsCell,
    },
  ]

  async function getStudents() {
    setLoading(true)
    try {
      const res = await studentService.getAll({ page: page })

      if (res.status == 200) {
        setData(res.data)
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function deleteStudent(id) {
    try {
      const res = await studentService.delete(id)

      if (res.status === 204) {
        showNotification("success", `Estudiante ${res.data.name} eliminado`)
        getStudents()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function actionsCell(params) {
    const onClickEdit = () => {
      setEditing(true)
      setFormValues(params.row)
      setOpen(true)
    }
    const onClickRestore = () => {
      setOpenPasswordDialog(true)
      setUserId(params.row.id)
    }
    const onClickDelete = () => {
      deleteStudent(params.row.id)
    }

    return (
      <>
        <IconButton onClick={onClickEdit} title="Editar">
          <Create />
        </IconButton>
        <IconButton onClick={onClickRestore} title="Restablecer contraseña">
          <Restore />
        </IconButton>
        <IconButton color="error" onClick={onClickDelete} title="Eliminar">
          <Delete />
        </IconButton>
      </>
    )
  }

  useEffect(() => {
    getStudents()
  }, [page])

  return (
    <Container>
      <Grid container>
        <Grid item xs={7}>
          <Typography variant="h5">Estudiantes</Typography>
        </Grid>
        <Grid item xs={5}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button, a": { ml: 1, mb: 1 } }}>
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={getStudents}
              >
                Actualizar
              </LoadingButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setFormValues({})
                  setEditing(false)
                  setOpen(true)
                }}
                disableElevation
              >
                Nuevo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={data.results}
        rowCount={data.count}
        onPageChange={page => setPage(page + 1)}
        loading={loading}
      />

      <FormDialog
        open={open}
        editing={editing}
        formValues={formValues}
        handleClose={() => setOpen(false)}
        getStudents={getStudents}
        showNotification={showNotification}
        setUserId={setUserId}
        setOpenPasswordDialog={setOpenPasswordDialog}
      />

      <PasswordDialog
        open={openPasswordDialog}
        restoredPassword={restoredPassword}
        handleClose={() => setOpenPasswordDialog(false)}
        userId={userId}
        showNotification={showNotification}
      />
    </Container>
  )
}
