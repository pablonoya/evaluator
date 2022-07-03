import { useState, useEffect } from "react"

import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"
import { red, green, grey } from "@mui/material/colors"

import exerciseService from "../../services/exerciseService"
import CodeEditor from "../../components/CodeEditor"
import DataTable from "../../components/DataTable"

const columns = [
  {
    headerName: "Salida correcta",
    field: "output",
    headerAlign: "left",
    type: "actions",
    flex: 0.5,

    renderCell: params => (
      <Typography variant="body1" component="pre" style={{ verticalAlign: "top" }}>
        {params.row.output}
      </Typography>
    ),
  },
  {
    headerName: "Salida enviada",
    field: "submitted",
    headerAlign: "left",
    type: "actions",
    flex: 0.5,
    renderCell: params => (
      <Typography variant="body1" component="pre" style={{ verticalAlign: "top" }}>
        {params.row.submitted}
      </Typography>
    ),
  },
]

export default function SubmissionDetail(props) {
  const { open, handleClose, submission, showNotification } = props

  const [rows, setRows] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  async function getOutputs(id) {
    try {
      const { data } = await exerciseService.getOutputs(id)

      const dataRows = data.map((output, i) => ({
        id: i,
        output: output,
        submitted: submission.outputs[i] || "",
      }))

      setRows(dataRows)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    if (submission.exercise) {
      getOutputs(submission.exercise)
    }
  }, [submission])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="body" fullWidth>
      <DialogTitle>
        <Grid container>
          <Grid item xs={9}>
            Ejercicio {submission.exercise_name} enviado por {submission.student}
          </Grid>
          <Grid item xs={3} justifyContent="end">
            <Typography variant="h6" align="right">
              Calificación: {submission.score}
            </Typography>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Evaluado el {submission.date} a las {submission.time} <br />
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" paragraph>
              Código solución
            </Typography>

            <Card variant="outlined" style={{ maxHeight: "66vh", overflow: "auto" }}>
              <CodeEditor value={submission.source_code || ""} />
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" paragraph>
              Salidas
            </Typography>

            <Card
              variant="outlined"
              sx={{
                "& .error": { bgcolor: red[100], "&:hover": { bgcolor: red[100] } },
                "& .success": { bgcolor: green[100], "&:hover": { bgcolor: green[100] } },
              }}
            >
              <DataTable
                columns={columns}
                rows={rows}
                sx={{ "& .MuiDataGrid-cell": { display: "inline" } }}
                getRowClassName={({ row }) =>
                  row.output.trim() === row.submitted.trim() ? "success" : "error"
                }
                getRowHeight={({ model }) => {
                  const output_lines = model.output.split("\n")?.length
                  const submitted_lines = model.submitted.split("\n")?.length

                  return 26 * Math.max(output_lines, submitted_lines, 2)
                }}
                paginationMode="client"
                components={{ Toolbar: null }}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                disableSelectionOnClick
              />
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Atrás</Button>
      </DialogActions>
    </Dialog>
  )
}
