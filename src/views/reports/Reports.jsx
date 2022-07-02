import { useState, useEffect } from "react"
import { Autocomplete, Button, Container, Grid, TextField, Typography } from "@mui/material"

import reportsService from "../../services/reportsService"
import taskService from "../../services/taskService"
import http from "../../services/http-common"

import DataTable from "../../components/DataTable"
import { FileDownload, Refresh } from "@mui/icons-material"

const reportList = [
  {
    title: "Calificaciones por tarea",
    url: "/score_per_task",
    columns: [
      { field: "first_name", headerName: "Nombres" },
      { field: "last_name", headerName: "Apellidos" },
    ],
  },
  {
    title: "Calificaciones por estudiante",
    url: "/score_per_student",
    columns: [
      { field: "cu", headerName: "Carnet universitario", flex: 0.15 },
      { field: "last_name", headerName: "Apellidos", flex: 0.3 },
      { field: "first_name", headerName: "Nombres", flex: 0.3 },
      {
        field: "score",
        headerName: "Calificación promedio",
        flex: 0.2,
        renderCell: params => <> {parseFloat(params.row.score).toFixed(2)} / 100</>,
      },
    ],
  },
  {
    title: "Envíos por ejercicio",
    url: "/submissions_per_exercise",
    columns: [
      { field: "exercise__name", headerName: "Nombre", flex: 0.4 },
      { field: "accepted", headerName: "Aceptados", flex: 0.1 },
      { field: "tle", headerName: "TLE", flex: 0.1 },
      { field: "wrong", headerName: "Incorrectos", flex: 0.1 },
      { field: "failed", headerName: "Fallidos", flex: 0.1 },
    ],
  },
]

export default function Reports(props) {
  const { showNotification } = props

  const [data, setData] = useState(null)
  const [report, setReport] = useState(reportList[1])

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  async function prepareDynamicColumns() {
    const { data } = await taskService.getAllWithExercises()

    reportList[0].columns = [
      { field: "last_name", headerName: "Apellidos", flex: 0.1 },
      { field: "first_name", headerName: "Nombres", flex: 0.1 },
      ...data.map(name => ({ field: name, flex: 0.1 })),
    ]
  }

  async function getReport() {
    setLoading(true)

    try {
      const { data } = await reportsService.get(report.url, {
        page: page + 1,
        page_size: pageSize,
      })
      setData(data)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  async function excelExport() {
    try {
      const res = await http.get(`/evaluator/api/reports${report.url}/`, {
        params: { excel: true },
        responseType: "arraybuffer",
      })

      if (res.headers["content-type"] == "application/json") {
        return
      }

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      })

      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = `Reporte de ${report.title}.xlsx`
      link.click()
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    prepareDynamicColumns()
  }, [])

  useEffect(() => {
    if (report) {
      getReport()
    }
  }, [report, page, pageSize])

  return (
    <Container component="main">
      <Grid container justifyContent="space-between">
        <Grid item xs={5}>
          <Typography variant="h5">Reportes</Typography>
        </Grid>

        <Grid item xs={4}>
          <Autocomplete
            size="small"
            noOptionsText="No encontrado"
            options={reportList}
            value={report}
            getOptionLabel={val => val.title}
            onChange={(_e, newValue) => {
              setPage(0)
              setReport(newValue)
            }}
            isOptionEqualToValue={(option, value) => option.title === value.title}
            renderInput={params => <TextField margin="dense" placeholder="Seleccione" {...params} />}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
          />
        </Grid>

        <Button
          variant="outlined"
          sx={{ my: 1 }}
          disabled={!report}
          startIcon={<Refresh />}
          onClick={getReport}
        >
          Actualizar
        </Button>

        <Button
          variant="contained"
          color="success"
          sx={{ my: 1 }}
          disabled={!report}
          startIcon={<FileDownload />}
          onClick={excelExport}
        >
          Excel
        </Button>
      </Grid>

      {report && data && (
        <DataTable
          loading={loading}
          columns={report.columns}
          rows={data.results}
          rowCount={data.count}
          page={page}
          pageSize={pageSize}
          onPageChange={page => setPage(page)}
          onPageSizeChange={size => setPageSize(size)}
        />
      )}
    </Container>
  )
}
