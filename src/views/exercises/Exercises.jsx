import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"

import { Button, IconButton, Link, Container, Grid, Box, Typography } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"

import { Create, Delete, Refresh } from "@mui/icons-material"

import exerciseService from "../../services/exerciseService"

import { useAuth } from "../../contexts/authContext"
import { filterItemsByGroups } from "../../utils"

import DataTable from "../../components/DataTable"
import TopicChips from "../../components/TopicChips"
import SearchInput from "../../components/SearchInput"
import WithRole from "../../components/WithRole"

function TopicsCell(params) {
  return <TopicChips topics={params.row.topics} />
}

function NameCell({ row }) {
  if (row.task_id)
    return (
      <Link component={RouterLink} to={`/enviar/${row.task_id}/${row.id}`} color="inherit">
        {row.name}
      </Link>
    )
  return row.name
}

function TaskCell({ row }) {
  return (
    <Link component={RouterLink} to={`/tareas/${row.task_id}`} color="inherit">
      {row.task}
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

  const [auth] = useAuth()

  const columns = filterItemsByGroups(
    [
      {
        field: "task",
        headerName: "Tarea",
        flex: 0.2,
        renderCell: TaskCell,
        groups: ["Alumnos"],
      },
      {
        field: "name",
        headerName: "Nombre",
        flex: 0.2,
        renderCell: NameCell,
      },
      {
        field: "topics",
        headerName: "Temas",
        flex: 0.5,
        sortable: true,
        renderCell: TopicsCell,
      },
      {
        field: "action",
        headerName: "Acciones",
        flex: 0.1,
        sortable: false,
        renderCell: actionsCell,
        groups: ["Docente"],
      },
    ],
    auth.groups
  )

  async function getAllExercises(query) {
    setLoading(true)
    try {
      const { data } = await exerciseService.getAll({
        page: page,
        page_size: pageSize,
        ...(query && { search: query }),
      })
      setData(data)
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
        showNotification("info", `Ejercicio eliminado`)
        getAllExercises()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function actionsCell(params) {
    return (
      <>
        <IconButton component={RouterLink} to={{ pathname: `${params.row.id}/editar` }}>
          <Create />
        </IconButton>

        <IconButton color="error" onClick={() => deleteExercise(params.row.id)}>
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
        <Grid item xs={4}>
          <Typography variant="h5">Ejercicios</Typography>
        </Grid>
        <Grid item xs={8}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button, a": { ml: 1, mb: 1 } }}>
              <SearchInput callback={getAllExercises} placeholder="Buscar por nombre..." />
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={() => getAllExercises()}
              >
                Actualizar
              </LoadingButton>
              <WithRole role="Docente">
                <Button variant="contained" component={RouterLink} to={{ pathname: "crear" }}>
                  + Nuevo
                </Button>
              </WithRole>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        loading={loading}
        columns={filterItemsByGroups(columns, auth.groups)}
        rows={data.results}
        rowCount={data.count}
        getRowId={row => row.id + `${row.task_id}`}
        onPageChange={page => setPage(page + 1)}
        pageSize={pageSize}
        onPageSizeChange={size => setPageSize(size)}
      />
    </Container>
  )
}
