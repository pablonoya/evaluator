import { useState } from "react"
import { Autocomplete, Container, Grid, TextField, Typography } from "@mui/material"
import { useEffect } from "react"

import reportsService from "../../services/reportsService"
import DataTable from "../../components/DataTable"

const reportsList = [
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
    title: "Envíos por ejercicios",
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

  async function getReport() {
    setLoading(true)

    try {
      const { data } = await reportsService.get(stat.url, {
        page: page,
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
    if (stat) {
      getReport()
    }
  }, [stat, page, page, pageSize])

  return (
    <Container>
      <Grid container>
        <Grid item xs={8}>
          <Typography variant="h5">Reportes</Typography>
        </Grid>

        <Grid item xs={4}>
          <Autocomplete
            size="small"
            noOptionsText="No encontrado"
            options={reportsList}
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
          pageSize={pageSize}
          onPageChange={page => setPage(page + 1)}
          onPageSizeChange={size => setPageSize(size)}
        />
      )}
    </Container>
  )
}
