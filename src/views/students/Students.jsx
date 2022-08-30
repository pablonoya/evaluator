import { useState, useEffect } from "react"

import { Box } from "@mui/system"
import { LoadingButton } from "@mui/lab"
import { Add, Create, Delete, Refresh, Restore, UploadFile } from "@mui/icons-material"
import { Button, Container, Grid, IconButton, Typography } from "@mui/material"

import DataTable from "../../components/DataTable"
import studentService from "../../services/studentService"

import SearchInput from "../../components/SearchInput"
import FormDialog from "./FormDialog"
import PasswordDialog from "./PasswordDialog"
import UploadedDialog from "./UploadedDialog"

export default function Students(props) {
  const { showNotification } = props

  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [open, setOpen] = useState(false)
  const [openUpload, setOpenUpload] = useState(false)
  const [uploadedUsers, setUploadedUsers] = useState([])

  const [editing, setEditing] = useState(false)
  const [formValues, setFormValues] = useState()

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [restoredPassword, setRestoredPassword] = useState(false)
  const [userId, setUserId] = useState(0)

  const columns = [
    { field: "cu", headerName: "CU", flex: 0.1 },
    { field: "last_name", headerName: "Apellidos", flex: 0.15 },
    { field: "first_name", headerName: "Nombres", flex: 0.15 },
    { field: "username", headerName: "Usuario", flex: 0.15 },
    { field: "phone", headerName: "Teléfono", flex: 0.15 },
    { field: "email", headerName: "Email", flex: 0.15 },
    {
      field: "action",
      headerName: "Acciones",
      flex: 0.15,
      sortable: false,
      renderCell: actionsCell,
    },
  ]

  async function getStudents(query) {
    setLoading(true)
    try {
      const res = await studentService.getAll({
        page: page,
        page_size: pageSize,
        ...(query && { search: query }),
      })

      if (res.status == 200) {
        setData(res.data)
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function deleteStudent(id, name) {
    setLoading(true)
    try {
      const res = await studentService.delete(id)

      if (res.status === 204) {
        showNotification("success", `Estudiante ${name} eliminado`)
        getStudents()
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function uploadStudents(formData) {
    setLoading(true)
    try {
      const { data, status } = await studentService.upload(formData)

      if (status === 201) {
        setOpenUpload(true)
        setUploadedUsers(data.users)
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
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
      deleteStudent(params.row.id, params.row.first_name)
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
  }, [page, pageSize])

  return (
    <Container>
      <Grid container>
        <Grid item xs={4}>
          <Typography variant="h5">Estudiantes</Typography>
        </Grid>
        <Grid item xs={8}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button, a": { ml: 1, mb: 1 } }}>
              <SearchInput callback={getStudents} placeholder="CU, nombre o apellido..." />

              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={() => getStudents()}
              >
                Actualizar
              </LoadingButton>

              <input
                id="file-button"
                type="file"
                accept="*.xlsx"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files[0]

                  let formData = new FormData()
                  formData.append("file", file)
                  uploadStudents(formData)
                }}
              />
              <label htmlFor="file-button">
                <Button
                  variant="outlined"
                  color="success"
                  component="a"
                  startIcon={<UploadFile />}
                  disableElevation
                >
                  Importar
                </Button>
              </label>

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
        pageSize={pageSize}
        onPageSizeChange={size => setPageSize(size)}
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

      <UploadedDialog
        open={openUpload}
        handleClose={() => {
          setOpenUpload(false)
          getStudents()
        }}
        uploadedUsers={uploadedUsers}
      />
    </Container>
  )
}
