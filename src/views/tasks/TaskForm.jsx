import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router"

import { Formik, Form } from "formik"

import { Button, Grid, Container, Typography, IconButton } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"

import { Box } from "@mui/system"
import { Add, Casino, Clear } from "@mui/icons-material"

import DataTable from "../../components/DataTable"
import TextFieldForm from "../../components/TextFieldForm"
import TopicsAutocomplete from "../../components/TopicsAutocomplete"
import ExercisesDialog from "./ExercisesDialog"
import SortingDialog from "./SortingDialog"

import taskService from "../../services/taskService"
import exerciseService from "../../services/exerciseService"
import TopicChips from "../../components/TopicChips"

export default function TaskForm(props) {
  const { showNotification } = props

  const { taskId } = useParams()
  const history = useHistory()

  const [taskData, setTaskData] = useState({ name: "", topics: [] })
  const [openSortingDialog, setOpenSortingDialog] = useState(false)
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false)

  const [exercises, setExercises] = useState([])
  const [count, setCount] = useState(0)

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const editing = taskId != null

  const exercisesColumns = [
    { field: "name", headerName: "Nombre", flex: 0.4 },
    {
      field: "topics",
      headerName: "Temas",
      flex: 0.4,
      renderCell: params => <TopicChips topics={params.row.topics} />,
    },
    {
      field: "remove",
      sortable: false,
      headerName: "Eliminar",
      flex: 0.1,
      renderCell: params => {
        function removeExercise() {
          if (editing) {
            releaseExercise(params.row.id)
          } else {
            setExercises(state => state.filter(e => e.id !== params.row.id))
          }
        }
        return (
          <IconButton onClick={removeExercise}>
            <Clear />
          </IconButton>
        )
      },
    },
  ]

  async function getTask(id) {
    try {
      const { data } = await taskService.get(id)
      setTaskData(data)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  async function getExercisesByTask(taskId) {
    try {
      setLoading(true)
      const { data } = await exerciseService.getAll({
        task: taskId,
        page: page + 1,
        page_size: pageSize,
      })

      setExercises(data.results)
      setCount(data.count)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function releaseExercise(exerciseId) {
    try {
      const { status } = await exerciseService.release({ id: exerciseId })

      if (status === 200) {
        setExercises(state => state.filter(e => e.id !== exerciseId))
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  async function handleSubmit(values) {
    try {
      if (editing) {
        const { status } = await taskService.update(values.id, values)

        if (status == 200) {
          showNotification("success", `Tarea ${values.name} editada`)
        }
      } else {
        const { data, status } = await taskService.create(values)

        await exerciseService.updateTask({
          ids: exercises.map(e => e.id),
          taskId: data.id,
        })

        if (status == 201) {
          showNotification("success", `Tarea ${values.name} creada`)
        }
      }
      history.push("/tareas")
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    if (editing) {
      getTask(taskId)
      getExercisesByTask(taskId)
    }
  }, [taskId, page, pageSize])

  useEffect(() => {
    if (!openExercisesDialog || !openSortingDialog) {
      if (taskId) {
        getExercisesByTask(taskId)
      } else {
        setCount(exercises.length)
      }
    }
  }, [openExercisesDialog, openSortingDialog])

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5">{editing ? "Editar " + taskData.name : "Nueva tarea"}</Typography>
        </Grid>
        <Grid item xs={12}>
          <DialogContentText>Seleccione los temas y ejercicios para esta tarea.</DialogContentText>
        </Grid>
      </Grid>

      <Formik initialValues={taskData} onSubmit={handleSubmit} enableReinitialize>
        {({ values }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextFieldForm name="name" label="Nombre" required />
              </Grid>
              <Grid item xs={6}>
                <TopicsAutocomplete
                  label="Temas"
                  editing={editing}
                  selectedTopics={taskData.topics}
                  showNotification={showNotification}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2} justifyContent="space-between">
                  <Grid item xs={3}>
                    <Typography variant="h6">Ejercicios</Typography>
                  </Grid>
                  <Grid item>
                    <Box sx={{ "& > button": { ml: 1 } }}>
                      <Button
                        variant="outlined"
                        startIcon={<Casino />}
                        onClick={() => {
                          if (!values.topics?.length) {
                            showNotification("warning", "Debe elegir algunos temas")
                            return
                          }
                          setOpenSortingDialog(true)
                        }}
                      >
                        Sortear
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => {
                          if (!values.topics?.length) {
                            showNotification("warning", "Debe elegir algunos temas")
                            return
                          }
                          setOpenExercisesDialog(true)
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
                  rowCount={count}
                  columns={exercisesColumns}
                  rows={exercises}
                  pageSize={pageSize}
                  onPageChange={page => setPage(page)}
                  onPageSizeChange={size => setPageSize(size)}
                  disableSelectionOnClick
                />
              </Grid>

              <Grid container justifyContent="end">
                <Box sx={{ "& > button": { ml: 1, my: 1 } }}>
                  <Button onClick={() => history.push("/tareas")}>Cancelar</Button>
                  <Button variant="contained" type="submit">
                    {editing ? "Guardar" : "Crear nuevo"}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <ExercisesDialog
              open={openExercisesDialog}
              handleClose={() => setOpenExercisesDialog(false)}
              topics={values.topics}
              taskId={taskId}
              setExercises={setExercises}
              showNotification={showNotification}
            />

            <SortingDialog
              open={openSortingDialog}
              handleClose={() => setOpenSortingDialog(false)}
              topics={values.topics}
              taskId={taskId}
              setExercises={setExercises}
              showNotification={showNotification}
            />
          </Form>
        )}
      </Formik>
    </Container>
  )
}
