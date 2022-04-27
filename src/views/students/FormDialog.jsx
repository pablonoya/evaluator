import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"

import { Formik, Form } from "formik"

import studentService from "../../services/studentService"

import TextFieldForm from "../../components/TextFieldForm"

export default function FormDialog(props) {
  const {
    open,
    editing,
    formValues,
    handleClose,
    getStudents,
    showNotification,
    setUserId,
    setOpenPasswordDialog,
  } = props

  async function handleSubmit(values) {
    try {
      if (editing) {
        const res = await studentService.update(values.id, values)

        if (res.status == 200) {
          showNotification("success", `Estudiante ${values.first_name} editado`)
          getStudents()
        }
      } else {
        const res = await studentService.create({ group: "Alumnos", ...values })

        if (res.status == 201) {
          showNotification("success", `Estudiante ${values.first_name} creado`)
          getStudents()

          console.log(res.data)
          setUserId(res.data.id)
          setOpenPasswordDialog(true)
        }
      }
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
          <DialogTitle>
            {editing ? "Editar " + formValues.first_name : "Nuevo estudiante"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Ingrese los datos del estudiante.</DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextFieldForm name="last_name" label="Apellidos" required />
              </Grid>
              <Grid item xs={12}>
                <TextFieldForm name="first_name" label="Nombres" required />
              </Grid>

              <Grid item xs={6}>
                <TextFieldForm
                  name="cu"
                  label="Carnet universitario"
                  inputProps={{ maxLength: 10 }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextFieldForm name="phone" label="Celular" inputProps={{ maxLength: 10 }} />
              </Grid>

              <Grid item xs={6}>
                <TextFieldForm name="username" label="Nombre de usuario" required />
              </Grid>
              <Grid item xs={6}>
                <TextFieldForm name="email" label="Email" />
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
