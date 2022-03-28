import DialogContentText from "@material-ui/core/DialogContentText"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"

import { Formik, Form } from "formik"

import exerciseService from "../../services/exerciseService"

import TextFieldForm from "../../components/TextFieldForm"
import TopicsAutocomplete from "../../components/TopicsAutocomplete"

export default function FormDialog(props) {
  const { open, editing, taskId, formValues, handleClose, getAllExercises, showNotification } = props

  async function handleSubmit(values) {
    try {
      if (editing) {
        const res = exerciseService.update(values.id, values)

        if (res.status == 200) {
          showNotification("success", `Ejercicio ${values.name} editado`)
        }
      } else {
        const res = exerciseService.create({ task: taskId, ...values })

        if (res.status == 201) {
          showNotification("success", `Ejercicio ${values.name} creado`)
        }
      }
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      handleClose()
      getAllExercises()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" scroll="body">
      <Formik initialValues={formValues} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <DialogTitle>{editing ? "Editar " + formValues.name : "Nuevo ejercicio"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Describa el ejercicio a resolver. Cada ejemplo de entrada y de salida debe estar en una
              sola línea.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextFieldForm name="name" label="Nombre" />
              </Grid>

              <Grid item xs={12}>
                <TopicsAutocomplete
                  label="Temas"
                  editing={editing}
                  selectedTopics={formValues.topics}
                  showNotification={showNotification}
                />
              </Grid>

              <Grid item xs={12}>
                <TextFieldForm
                  multiline
                  name="description"
                  label="Descripción"
                  minRows={2}
                  maxRows={15}
                />
              </Grid>

              <Grid item xs={6}>
                <TextFieldForm
                  multiline
                  name="input_examples"
                  label="Ejemplos de entrada"
                  minRows={3}
                  maxRows={7}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextFieldForm
                  multiline
                  name="output_examples"
                  label="Ejemplos de salida"
                  minRows={3}
                  maxRows={7}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" type="submit">
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  )
}
