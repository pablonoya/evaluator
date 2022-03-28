import { useState } from "react"

import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Dialog,
  Grid,
} from "@mui/material"

import exerciseService from "../../services/exerciseService"
import TopicChips from "../../components/TopicChips"

export default function SortingDialog(props) {
  const { open, handleClose, topics, taskId, setExercises, showNotification } = props

  const [quantity, setQuantity] = useState(5)

  async function handleSubmit() {
    try {
      const { data } = await exerciseService.lottery({
        quantity: quantity,
        topic_ids: topics.map(t => t.id),
      })
      setExercises(excercises => [...excercises, ...data])

      if (taskId) {
        await exerciseService.updateTask({
          ids: data.map(e => e.id),
          taskId: taskId,
        })
      }

      handleClose()
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Sortear ejercicios</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción seleccionará ejercicios al azar de los siguientes temas:
          </DialogContentText>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TopicChips topics={topics} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cantidad de ejercicios"
                name="quantity"
                variant="outlined"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                type="number"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
