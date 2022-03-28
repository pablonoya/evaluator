import { useState, useEffect, useRef } from "react"

import { DialogActions, DialogContent, DialogTitle, Button, Dialog, Grid } from "@mui/material"

import DialogContentText from "@material-ui/core/DialogContentText"

import TopicChips from "../../components/TopicChips"
import DataTable from "../../components/DataTable"

import exerciseService from "../../services/exerciseService"

const columns = [
  {
    field: "name",
    headerName: "Nombre",
    flex: 0.3,
  },
  {
    field: "topics",
    headerName: "Temas",
    flex: 0.6,
    sortable: true,
    renderCell: params => <TopicChips topics={params.row.topics} />,
  },
]

export default function ExercisesDialog(props) {
  const { open, handleClose, topics, taskId, setExercises, showNotification } = props

  const [data, setData] = useState({ results: [], count: 0 })
  const [exerciseIds, setExerciseIds] = useState([])
  const prevExerciseIds = useRef(exerciseIds)

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    if (open) {
      getAllExercisesWithoutTask()
      prevExerciseIds.current = []
      setExerciseIds([])
      setPage(1)
    }
  }, [open, page, pageSize])

  async function getAllExercisesWithoutTask() {
    setLoading(true)
    try {
      setExerciseIds(prevExerciseIds.current)

      const res = await exerciseService.getAllWithoutTask({
        topic_ids: topics.map(t => t.id).toString(),
        page: page + 1,
        page_size: pageSize,
      })

      setData(res.data)
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
      setTimeout(() => {
        setExerciseIds(prevExerciseIds.current)
      })
    }
  }

  async function handleSubmit() {
    try {
      if (taskId) {
        await exerciseService.updateTask({
          ids: exerciseIds,
          taskId: taskId,
        })
      }

      const { data } = await exerciseService.getAll({ ids: exerciseIds.toString() })

      setExercises(exercises => [...exercises, ...data.results])
      handleClose()
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Añadir ejercicios {prevExerciseIds.current}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se pueden añadir los siguientes ejercicios que no están asociados a ninguna tarea y
            pertenecen a los siguientes temas:
          </DialogContentText>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TopicChips topics={topics} />
            </Grid>
            <Grid item xs={12}>
              <DataTable
                loading={loading}
                columns={columns}
                rows={data.results}
                rowCount={data.count}
                page={page}
                pageSize={pageSize}
                onPageSizeChange={size => setPageSize(size)}
                onPageChange={page => {
                  prevExerciseIds.current = exerciseIds
                  setPage(page)
                }}
                selectionModel={exerciseIds}
                onSelectionModelChange={ids => setExerciseIds(ids)}
                checkboxSelection
                pagination
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Añadir
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
