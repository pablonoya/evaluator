import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"

import { Container, Grid, Typography } from "@material-ui/core"
import { Create, Delete, Refresh } from "@mui/icons-material"
import { Button, IconButton, Link } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/system"

import exerciseService from "../../services/exerciseService"

import DataTable from "../../components/DataTable"
import TopicChips from "../../components/TopicChips"
import SelectTasks from "../../components/SelectTasks"
import { useAuth } from "../../components/context"
import { filterItemsByGroups } from "../../utils"

import FormDialog from "./FormDialog"

const initialFormValues = {
  name: "",
  topics: [],
  description: "",
  input_examples: "",
  output_examples: "",
}

function topicsCell(params) {
  return <TopicChips topics={params.row.topics} />
}

function nameCell(params) {
  return (
    <Link component={RouterLink} to={`ejercicios/${params.row.id}/subir`} color="inherit">
      {params.row.name}
    </Link>
  )
}

export default function Exercises(props) {
  const { showNotification } = props

  const [data, setData] = useState({ results: [], count: 0 })
  const [taskId, setTaskId] = useState("")

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)

  const [editing, setEditing] = useState(false)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [auth] = useAuth()

  const columns = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 0.2,
      renderCell: nameCell,
    },
    {
      field: "topics",
      headerName: "Temas",
      flex: 0.6,
      sortable: true,
      renderCell: topicsCell,
    },
    {
      field: "action",
      headerName: "Acciones",
      flex: 0.1,
      sortable: false,
      renderCell: actionsCell,
      groups: ["Docente"],
    },
  ]

  async function getAllExercises() {
    setLoading(true)
    try {
      const res = await exerciseService.getAll({
        task: taskId,
        page: page,
        page_size: pageSize,
      })
      setData(res.data)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function deleteExercise(id) {
    try {
      const { status } = await exerciseService.delete(id)

      if (status === 204) {
        showNotification("success", `Ejercicio ${res.data.name} eliminado`)
        getAllExercises()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function handleNew() {
    setFormValues(initialFormValues)
    setEditing(false)
    setOpen(true)
  }

  function actionsCell(params) {
    const onClickEdit = () => {
      setFormValues(params.row)
      setEditing(true)
      setOpen(true)
    }
    const onClickDelete = () => {
      deleteExercise(params.row.id)
    }

    return (
      <>
        <IconButton onClick={onClickEdit}>
          <Create />
        </IconButton>
        <IconButton color="error" onClick={onClickDelete}>
          <Delete />
        </IconButton>
      </>
    )
  }

  useEffect(() => {
    getAllExercises()
  }, [taskId, page, pageSize])

  return (
    <Container>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="h5">Ejercicios</Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button": { ml: 1, mb: 1 } }}>
              {/* <SelectTasks
                value={taskId}
                onChange={event => setTaskId(event.target.value)}
                displayEmpty
              /> */}
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={getAllExercises}
              >
                Actualizar
              </LoadingButton>
              <Button variant="contained" onClick={handleNew} disableElevation>
                + Nuevo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        loading={loading}
        columns={filterItemsByGroups(columns, auth.groups)}
        rows={data.results}
        rowCount={data.count}
        onPageChange={page => setPage(page + 1)}
        pageSize={pageSize}
        onPageSizeChange={size => setPageSize(size)}
      />

      <FormDialog
        open={open}
        editing={editing}
        taskId={taskId}
        formValues={formValues}
        handleClose={() => setOpen(false)}
        getAllExercises={getAllExercises}
        showNotification={showNotification}
      />
    </Container>
  )
}
