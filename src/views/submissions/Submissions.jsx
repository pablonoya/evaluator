import { useEffect, useState } from "react"

import { Button, Container, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { LoadingButton } from "@mui/lab"
import { AssignmentTurnedIn, Refresh } from "@mui/icons-material"

import submissionService from "../../services/submissionService"
import SearchInput from "../../components/SearchInput"
import DataTable from "../../components/DataTable"

import SubmissionDetail from "./SubmissionDetail"
import SubmissionQueue from "./SubmissionQueue"
import { useAuth } from "../../contexts/authContext"
import { filterItemsByGroups } from "../../utils"

export default function Submissions(props) {
  const { showNotification } = props

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [data, setData] = useState({ results: [], count: 0 })
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState([])
  const [auth] = useAuth()

  const columns = filterItemsByGroups(
    [
      { field: "task_name", headerName: "Tarea", flex: 0.15 },
      { field: "exercise_name", headerName: "Ejercicio", flex: 0.2 },
      {
        field: "student",
        headerName: "Estudiante",
        flex: 0.15,
        groups: ["Docente"],
      },
      { field: "status_name", headerName: "Estado", flex: 0.15 },
      { field: "score", headerName: "Calificación", flex: 0.1 },
      { field: "datetime", headerName: "Evaluado", flex: 0.15 },
      {
        field: "actions",
        headerName: "Acciones",
        flex: 0.15,
        renderCell: actionsCell,
        groups: ["Docente"],
      },
    ],
    auth.groups
  )

  async function getAllSubmissions(query) {
    try {
      setLoading(true)

      const res = await submissionService.getAll({
        page: page + 1,
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

  async function getSubmission(id) {
    try {
      const res = await submissionService.get(id)

      setDetails(res.data)
      setOpen(true)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function actionsCell(params) {
    const onClick = () => {
      getSubmission(params.row.id)
    }

    return (
      <Button onClick={onClick} startIcon={<AssignmentTurnedIn />}>
        Revisar
      </Button>
    )
  }

  useEffect(() => {
    getAllSubmissions()
  }, [page, pageSize])

  return (
    <Container component="main">
      <Grid container>
        <Grid item xs={12}>
          <SubmissionQueue showNotification={showNotification} />
        </Grid>

        <Grid item xs={4}>
          <Typography variant="h5">Envíos</Typography>
        </Grid>
        <Grid item xs={8}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button": { ml: 1, mb: 1 } }}>
              <SearchInput callback={getAllSubmissions} placeholder="Tarea o ejercicio..." />
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={() => getAllSubmissions()}
              >
                Actualizar
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={data.results}
        rowCount={data.count}
        page={page}
        onPageChange={setPage}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={size => setPageSize(size)}
      />

      <SubmissionDetail
        open={open}
        handleClose={() => setOpen(false)}
        details={details}
        showNotification={showNotification}
      />
    </Container>
  )
}
