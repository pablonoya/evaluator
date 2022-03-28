import { useEffect, useState } from "react"

import { Button, Container, Grid, IconButton, Typography } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { AssignmentTurnedIn, Refresh } from "@mui/icons-material"

import DataTable from "../../components/DataTable"
import SubmissionDetail from "./SubmissionDetail"

import submissionService from "../../services/submissionService"

export default function Submissions(props) {
  const { showNotification } = props

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ results: [], count: 0 })
  const [open, setOpen] = useState(false)
  const [details, setDetails] = useState([])

  const columns = [
    { field: "exercise_name", headerName: "Ejercicio", flex: 0.3 },
    { field: "student", headerName: "Estudiante", flex: 0.3 },
    { field: "status_name", headerName: "Estado", flex: 0.2 },
    { field: "date", headerName: "Evaluado", flex: 0.2 },
    { field: "actions", headerName: "Acciones", flex: 0.2, renderCell: actionsCell },
  ]

  function handlePageChange(page) {
    setPage(page + 1)
  }

  async function getSubmissions(page) {
    try {
      setLoading(true)

      const res = await submissionService.getAll({ page: page })
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
    getSubmissions(page)
  }, [page])

  return (
    <Container>
      <Grid container>
        <Grid item xs={7}>
          <Typography variant="h5">Envíos</Typography>
        </Grid>
        <Grid item xs={5}>
          <Grid container justifyContent="flex-end">
            <LoadingButton
              sx={{ mb: 1 }}
              variant="outlined"
              startIcon={<Refresh />}
              loading={loading}
              loadingPosition="start"
              onClick={() => getSubmissions()}
            >
              Actualizar
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={data.results}
        rowCount={data.count}
        onPageChange={handlePageChange}
        loading={loading}
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
