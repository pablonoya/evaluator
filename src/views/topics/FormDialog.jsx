import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"

import { Formik, Form } from "formik"

import topicService from "../../services/topicService"

import TextFieldForm from "../../components/TextFieldForm"

export default function FormDialog(props) {
  const { open, editing, formValues, handleClose, getTopics, showNotification } = props

  async function handleSubmit(values) {
    try {
      if (editing) {
        const res = await topicService.update(values.id, values)

        if (res.status == 200) {
          showNotification("success", `Tema ${values.name} editado`)
        }
      } else {
        const res = await topicService.create(values)

        if (res.status == 201) {
          showNotification("success", `Tema ${values.name} creado`)
        }
      }
      getTopics()
    } catch (err) {
      showNotification("error", err.toString())
    } finally {
      handleClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" scroll="body">
      <Formik initialValues={formValues} onSubmit={handleSubmit}>
        <Form>
          <DialogTitle>{editing ? "Editar " + formValues.name : "Nuevo Tema"}</DialogTitle>
          <DialogContent>
            <DialogContentText>Ingrese el nombre del tema</DialogContentText>

            <TextFieldForm name="name" label="Nombres" />
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
