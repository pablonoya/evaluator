import { DialogActions, DialogContent, DialogTitle, Button, Dialog, Grid } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"

import { Form, Formik } from "formik"

import TextFieldForm from "../../components/TextFieldForm"
import testcaseService from "../../services/testcaseService"

export default function TestCaseDialog(props) {
  const { handleClose, open, editing, exerciseId, testcaseData, getExercise, setExerciseData } =
    props

  async function handleSubmit(values) {
    const data = { ...values, exercise_id: exerciseId }

    const res = await (editing
      ? testcaseService.update(testcaseData.id, data)
      : testcaseService.create(data))

    if (res.status < 300) {
      if (!exerciseId) {
        setExerciseData(exercise => {
          exercise.testcases = [...exercise.testcases, res.data]
          return exercise
        })
      } else {
        getExercise(exerciseId)
      }
      handleClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? "Editar" : "Añadir"} Caso de prueba</DialogTitle>

      <Formik initialValues={testcaseData} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <DialogContent>
            <DialogContentText>
              Introduzca un ejemplo de entrada y su respectivo ejemplo de salida.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextFieldForm
                  multiline
                  name="input_example"
                  label="Ejemplo de entrada"
                  minRows={3}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextFieldForm
                  multiline
                  name="output_example"
                  label="Ejemplo de salida"
                  minRows={3}
                  required
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
