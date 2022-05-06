import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"

import { Container, Grid, Typography } from "@material-ui/core"
import { CheckCircle, Close, Refresh } from "@mui/icons-material"
import { Link } from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { Box } from "@mui/system"

import practiceService from "../../services/practiceService"

import DataTable from "../../components/DataTable"
import TopicChips from "../../components/TopicChips"
import { useAuth } from "../../contexts/authContext"
import { filterItemsByGroups } from "../../utils"

import SearchInput from "../../components/SearchInput"
import { useParams } from "react-router-dom"

function topicsCell(params) {
  return <TopicChips topics={params.row.topics} />
}

function nameCell(params) {
  return (
    <Link component={RouterLink} to={`/ejercicios/${params.row.id}/subir`} color="inherit">
      {params.row.name}
    </Link>
  )
}

function StatusCell({ row }) {
  return row.status ? <CheckCircle color="success" /> : <Close color="error" />
}

export default function ExercisesStudent(props) {
  const { showNotification } = props

  const [auth] = useAuth()
  const { taskId } = useParams()

  const [data, setData] = useState({ results: [], count: 0 })

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState()

  const columns = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 0.3,
      renderCell: nameCell,
    },
    {
      field: "topics",
      headerName: "Temas",
      flex: 0.5,
      sortable: true,
      renderCell: topicsCell,
    },
    {
      field: "submitted",
      headerName: "Enviado",
      flex: 0.15,
      renderCell: StatusCell,
    },
  ]

  async function getAllPractices() {
    setLoading(true)
    try {
      const res = await practiceService.getAll({
        page: page,
        page_size: pageSize,
        taskId: taskId,
        userId: auth.id,
        ...(query && { search: query }),
      })
      setData(res.data)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllPractices()
  }, [taskId, page, pageSize, query])

  return (
    <Container>
      <Grid container>
        <Grid item xs={5}>
          <Typography variant="h5">Ejercicios</Typography>
        </Grid>
        <Grid item xs={7}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button": { ml: 1, mb: 1 } }}>
              <SearchInput query={query} setQuery={setQuery} placeholder="Buscar por nombre..." />
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={getAllPractices}
              >
                Actualizar
              </LoadingButton>
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
    </Container>
  )
}
