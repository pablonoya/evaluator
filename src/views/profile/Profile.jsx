import { Button, Container, Grid, Typography } from "@mui/material"
import { Formik, Form } from "formik"
import { useAuth } from "../../contexts/authContext"

import authService from "../../services/authService"

import TextFieldForm from "../../components/TextFieldForm"
import PasswordFieldForm from "../../components/PaswordFieldForm"
import WithRole from "../../components/WithRole"

export default function Profile(props) {
  const { showNotification } = props

  const [auth, handleAuth] = useAuth()

  const initialValues = {
    ...auth,
    password: "",
    new_password: "",
  }

  async function updateProfile(profileData) {
    try {
      const res = await authService.updateProfile(profileData)

      if (res.status === 200) {
        showNotification("success", "Perfil actualizado")

        const { data } = await authService.myself()
        handleAuth(data)
      }
    } catch (err) {
      showNotification("error", err.response.data.toString())
    }
  }

  function handleSubmit(values) {
    updateProfile(values)
  }

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h5" paragraph>
            Editar perfil
          </Typography>
        </Grid>
      </Grid>

      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <TextFieldForm name="last_name" label="Apellido(s)" margin="dense" required />
          <TextFieldForm name="first_name" label="Nombre(s)" margin="dense" required />
          <WithRole role="Alumnos">
            <TextFieldForm name="cu" label="Carnet universitario" margin="dense" required />
          </WithRole>
          <TextFieldForm name="username" label="Nombre de usuario" margin="dense" required />
          <TextFieldForm name="email" label="Email" margin="dense" />
          <WithRole role="Alumnos">
            <TextFieldForm name="phone" label="Celular" margin="dense" />
          </WithRole>

          <PasswordFieldForm
            name="password"
            label="Contraseña actual"
            margin="dense"
            sx={{ marginTop: 3 }}
            required
          />
          <PasswordFieldForm name="new_password" label="Nueva contraseña" margin="dense" />

          <Button variant="contained" type="submit" sx={{ marginTop: 2 }} fullWidth>
            Guardar cambios
          </Button>
        </Form>
      </Formik>
    </Container>
  )
}
