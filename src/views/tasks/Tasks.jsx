import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"

import { Button, Grid, IconButton, Typography, Link, Container } from "@mui/material"
import { Box } from "@mui/system"
import { Add, Create, Delete, Refresh } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"

import DataTable from "../../components/DataTable"
import TopicChips from "../../components/TopicChips"

import taskService from "../../services/taskService"
import SearchInput from "../../components/SearchInput"

import { useAuth } from "../../contexts/authContext"
import { filterItemsByGroups } from "../../utils"

function topicsCell(params) {
  return <TopicChips topics={params.row.assignments} />
}

function nameCell(params) {
  return (
    <Link component={RouterLink} to={`${params.row.id}`} color="inherit">
      {params.row.name}
    </Link>
  )
}

export default function Tasks(props) {
  const { showNotification } = props

  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [auth] = useAuth()

  const columns = [
    { field: "name", headerName: "Nombre", flex: 0.3, renderCell: nameCell },
    {
      field: "assignments",
      headerName: "Temas",
      flex: 0.5,
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

  async function getAll(query) {
    try {
      setLoading(true)

      const res = await taskService.getAll({
        page: page,
        page_size: pageSize,
        ...(query && { search: query }),
      })
      if (res.status === 200) {
        setData(res.data)
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function deleteTask(id) {
    try {
      const res = await taskService.delete(id)
      if (res.status === 204) {
        showNotification("success", `Tarea ${res.data.name} eliminada`)
        getAll()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function actionsCell(params) {
    const onClickDelete = () => {
      deleteTask(params.row.id)
    }

    return (
      <>
        <IconButton
          component={RouterLink}
          to={{ pathname: `/tareas/${params.row.id}/editar`, state: params.row }}
        >
          <Create />
        </IconButton>
        <IconButton color="error" onClick={onClickDelete}>
          <Delete />
        </IconButton>
      </>
    )
  }

  useEffect(() => {
    getAll()
  }, [page, pageSize])

  return (
    <Container>
      <Grid container>
        <Grid item xs={5}>
          <Typography variant="h5">Tareas</Typography>
        </Grid>
        <Grid item xs={7}>
          <Grid container justifyContent="flex-end">
            <SearchInput callback={getAll} placeholder="Buscar por nombre..." />
            <Box sx={{ "& > button, a": { ml: 1, mb: 1 } }}>
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={getAll}
              >
                Actualizar
              </LoadingButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={RouterLink}
                to="tareas/crear"
                disableElevation
              >
                Nuevo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        columns={filterItemsByGroups(columns, auth.groups)}
        rows={data.results}
        rowCount={data.count}
        page={page}
        onPageChange={page => setPage(page + 1)}
        pageSize={pageSize}
        onPageSizeChange={size => setPageSize(size)}
        loading={loading}
      />
    </Container>
  )
}
