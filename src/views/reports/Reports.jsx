import { useState, useEffect } from "react"
import { Autocomplete, Container, Grid, TextField, Typography } from "@mui/material"

import reportsService from "../../services/reportsService"
import taskService from "../../services/taskService"

import DataTable from "../../components/DataTable"

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
      { field: "first_name", headerName: "Nombres", flex: 0.3 },
      { field: "last_name", headerName: "Apellidos", flex: 0.3 },
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
  const [stat, setStat] = useState(null)

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
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
      const { data } = await reportsService.get(stat.url, {
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

  useEffect(() => {
    prepareDynamicColumns()
  }, [])

  useEffect(() => {
    if (stat) {
      getReport()
    }
  }, [stat, page, pageSize])

  return (
    <Container component="main">
      <Grid container>
        <Grid item xs={8}>
          <Typography variant="h5">Reportes</Typography>
        </Grid>

        <Grid item xs={4}>
          <Autocomplete
            size="small"
            noOptionsText="No encontrado"
            options={reportList}
            value={stat}
            getOptionLabel={val => val.title}
            onChange={(_e, newValue) => setStat(newValue)}
            isOptionEqualToValue={(option, value) => option.title === value.title}
            renderInput={params => <TextField margin="dense" placeholder="Seleccione" {...params} />}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
          />
        </Grid>
      </Grid>

      {stat && data && (
        <DataTable
          loading={loading}
          columns={stat.columns}
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
