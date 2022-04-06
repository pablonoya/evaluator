import { useEffect, useState } from "react"

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Dialog,
  Grid,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material"

import DialogContentText from "@material-ui/core/DialogContentText"

import topicService from "../../services/topicService"
import assignmentService from "../../services/assignmentService"

export default function TopicsDialog(props) {
  const {
    open,
    edit,
    handleClose,
    taskId,
    assignment,
    assignments,
    setAssignments,
    showNotification,
  } = props

  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState()
  const [query, setQuery] = useState()

  const [choosedTopic, setChoosedTopic] = useState()
  const [exercisesNumber, setExercisesNumber] = useState(1)

  async function getAllTopics() {
    setLoading(true)

    try {
      const { data } = await topicService.getAll({ page_size: 20, search: query })

      setTopics([
        ...data.results.filter(
          topic => topic.id == assignment?.topic || !assignments.find(a => a.topic == topic.id)
        ),
      ])
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllTopics()
  }, [, query])

  useEffect(() => {
    if (edit) {
      const topic = { id: assignment.topic, name: assignment.name }

      setChoosedTopic(topic)
      setExercisesNumber(assignment.exercises_number)
    } else {
      setQuery("")
      setChoosedTopic()
      setExercisesNumber(1)
    }
  }, [open, edit])

  async function handleSubmit() {
    if (!choosedTopic.id && exercisesNumber < 1) {
      return
    }

    try {
      const body = {
        task: taskId,
        topic: choosedTopic.id,
        exercises_number: exercisesNumber,
      }

      if (edit) {
        const { data } = await assignmentService.update(assignment.id, body)

        setAssignments(assignments =>
          assignments.map(actual => (actual.id == assignment.id ? data : actual))
        )
      } else {
        const { data } = await assignmentService.create(body)

        setAssignments(assignments => [...assignments, data])
      }

      handleClose()
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{edit ? "Editar" : "Añadir"} Tema</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Elija el tema y el número de ejercicios para esta tarea:
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <Autocomplete
              label="Tema"
              loading={loading}
              options={topics}
              value={choosedTopic}
              onChange={(_e, value) => setChoosedTopic(value)}
              onInputChange={(_e, value) => setQuery(value)}
              getOptionLabel={option => option?.name || ""}
              isOptionEqualToValue={(option, value) => option?.id === value.id}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Tema"
                  placeholder="Seleccione..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              name="exercises_number"
              label="Nro. de ejercicios"
              type="number"
              value={exercisesNumber}
              onChange={e => setExercisesNumber(e.target.value)}
              error={exercisesNumber < 1}
              helperText={exercisesNumber < 1 && "Debe ser mayor a 0"}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {edit ? "Guardar" : "Añadir"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
