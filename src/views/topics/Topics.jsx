import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Button, Container, Grid, IconButton, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Add, Create, Delete, Refresh } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"

import DataTable from "../../components/DataTable"

import topicService from "../../services/topicService"
import FormDialog from "./FormDialog"
import SearchInput from "../../components/SearchInput"

export default function Topics(props) {
  const { showNotification } = props

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formValues, setFormValues] = useState({ name: "" })

  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const columns = [
    { field: "name", headerName: "Nombre", flex: 0.8 },
    {
      field: "action",
      headerName: "Acciones",
      flex: 0.1,
      sortable: false,
      renderCell: actionsCell,
    },
  ]

  async function getTopics(query) {
    try {
      setLoading(true)

      const res = await topicService.getAll({
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

  async function deleteTopic(id) {
    try {
      const res = await topicService.delete(id)
      if (res.status === 204) {
        showNotification("success", `Tema eliminado`)
        getTopics()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function actionsCell(params) {
    const onClickEdit = () => {
      setEditing(true)
      setFormValues(params.row)
      setOpen(true)
    }

    const onClickDelete = () => {
      deleteTopic(params.row.id)
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
    getTopics()
  }, [page, pageSize])

  return (
    <Container component="main">
      <Grid container>
        <Grid item xs={5}>
          <Typography variant="h5">Temas</Typography>
        </Grid>
        <Grid item xs={7}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button, a": { ml: 1, mb: 1 } }}>
              <SearchInput callback={getTopics} placeholder="Buscar por nombre..." />
              <LoadingButton
                variant="outlined"
                startIcon={<Refresh />}
                loading={loading}
                loadingPosition="start"
                onClick={getTopics}
              >
                Actualizar
              </LoadingButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setFormValues({ name: "" })
                  setEditing(false)
                  setOpen(true)
                }}
                disableElevation
              >
                Nuevo
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={data.results}
        rowCount={data.count}
        pageSize={pageSize}
        onPageChange={page => setPage(page + 1)}
        onPageSizeChange={size => setPageSize(size)}
        loading={loading}
      />

      <FormDialog
        open={open}
        editing={editing}
        formValues={formValues}
        handleClose={() => setOpen(false)}
        getTopics={getTopics}
        showNotification={showNotification}
      />
    </Container>
  )
}
