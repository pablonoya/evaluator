import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { Formik, Form } from "formik"

import { Button, Grid, Container, Typography, IconButton } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"
import { Box } from "@mui/system"

import { Add, Clear, Create } from "@mui/icons-material"

import DataTable from "../../components/DataTable"
import TextFieldForm from "../../components/TextFieldForm"
import TopicsDialog from "./TopicsDialog"

import taskService from "../../services/taskService"

function ActionsCell(props) {
  return (
    <>
      <IconButton onClick={props.handleEdit}>
        <Create />
      </IconButton>
      <IconButton onClick={props.handleRemove}>
        <Clear />
      </IconButton>
    </>
  )
}

export default function TaskForm(props) {
  const { showNotification } = props

  const { taskId } = useParams()
  const navigate = useNavigate()

  const [taskData, setTaskData] = useState({ name: "" })
  const [assignments, setAssignments] = useState([])

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [edit, setEdit] = useState(false)
  const [assignment, setAssignment] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

  const editing = taskId != null

  const exercisesColumns = [
    {
      headerName: "Tema",
      field: "name",
      flex: 0.7,
    },
    {
      headerName: "Nro. de ejercicios",
      field: "exercises_number",
      flex: 0.2,
    },
    {
      field: "remove",
      sortable: false,
      headerName: "Acciones",
      flex: 0.1,
      renderCell: params => (
        <ActionsCell
          handleEdit={() => handleEdit(params)}
          handleRemove={() => handleRemove(params)}
        />
      ),
    },
  ]

  function handleEdit(params) {
    setEdit(true)
    setOpenDialog(true)
    setAssignment(params.row)
  }

  function handleRemove(params) {
    if (editing) {
      releaseAssignment(params.row.id)
    } else {
      setAssignments(state => state.filter(t => t.id !== params.row.id))
    }
  }

  async function getTask(id) {
    try {
      setLoading(true)
      const { data } = await taskService.get(id)

      setTaskData(data)
      setAssignments(data.assignments)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function releaseAssignment(id) {
    try {
      setLoading(true)
      const { status } = await taskService.release(taskId, { assignment: id })

      if (status === 200) {
        setAssignments(state => state.filter(e => e.id !== id))
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values) {
    values.assignments = assignments

    try {
      if (editing) {
        const { status } = await taskService.update(values.id, values)

        if (status == 200) {
          showNotification("success", `Tarea ${values.name} editada`)
        }
      } else {
        const { status } = await taskService.create(values)

        if (status == 201) {
          showNotification("success", `Tarea ${values.name} creada`)
        }
      }
      navigate("/tareas")
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    if (editing) {
      getTask(taskId)
    }
  }, [taskId, page, pageSize])

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">{editing ? "Editar " + taskData.name : "Nueva tarea"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <DialogContentText>
            Seleccione los temas y la cantidad deejercicios para esta tarea.
          </DialogContentText>
        </Grid>
      </Grid>

      <Formik initialValues={taskData} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextFieldForm name="name" label="Nombre" required />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent="space-between">
                <Grid item xs={3}>
                  <Typography variant="h6">Temas</Typography>
                </Grid>
                <Grid item>
                  <Box sx={{ "& > button": { ml: 1 } }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setEdit(false)
                        setOpenDialog(true)
                      }}
                    >
                      Añadir
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <DataTable
                loading={loading}
                page={page}
                pageSize={pageSize}
                onPageChange={page => setPage(page)}
                onPageSizeChange={size => setPageSize(size)}
                columns={exercisesColumns}
                rows={assignments}
                rowCount={assignments.length}
              />
            </Grid>

            <TopicsDialog
              edit={edit}
              open={openDialog}
              handleClose={() => setOpenDialog(false)}
              taskId={taskId}
              assignment={assignment}
              assignments={assignments}
              setAssignments={setAssignments}
              showNotification={showNotification}
            />

            <Grid container justifyContent="end">
              <Box sx={{ "& > button": { ml: 1, my: 1 } }}>
                <Button onClick={() => navigate("/tareas")}>Cancelar</Button>
                <Button variant="contained" type="submit">
                  {editing ? "Guardar" : "Crear"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Container>
  )
}
