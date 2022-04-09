import { useState } from "react"

import { Button, Container, Grid, IconButton, InputAdornment, Typography } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"

import { Formik, Form } from "formik"

import TextFieldForm from "../../components/TextFieldForm"

import { useAuth } from "../../contexts/authContext"
import authService from "../../services/authService"
import { useHistory } from "react-router-dom"

export default function Profile(props) {
  const { showNotification } = props

  const history = useHistory()
  const [auth, handleAuth] = useAuth()

  const initialValues = {
    first_name: auth.first_name,
    last_name: auth.last_name,
    username: auth.username,
    cu: auth.cu,
    password: "",
    new_password: "",
  }

  const [showPassword, setShowPassword] = useState(false)
  const [userInfo, setUserInfo] = useState(initialValues)

  async function updateProfile(profileData) {
    try {
      const res = await authService.updateProfile(profileData)

      if (res.status === 200) {
        showNotification("success", "Perfil actualizado")
        history.goBack()
      }
    } catch (err) {
      showNotification("error", err.response.data.toString())
    }
  }

  function handleShow() {
    setShowPassword(!showPassword)
  }
  function handleSubmit(values) {
    updateProfile(values)
  }

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="h5" paragraph>
            Editar perfil
          </Typography>
        </Grid>
      </Grid>

      <Formik initialValues={userInfo} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextFieldForm name="cu" label="Carnet universitario" required />
            </Grid>
            <Grid item xs={6}>
              <TextFieldForm name="username" label="Nombre de usuario" required />
            </Grid>
            <Grid item xs={6}>
              <TextFieldForm name="first_name" label="Nombre(s)" required />
            </Grid>
            <Grid item xs={6}>
              <TextFieldForm name="last_name" label="Apellido(s)" required />
            </Grid>
            <Grid item xs={12}>
              <TextFieldForm
                name="password"
                label="Contraseña actual"
                required
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShow} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldForm
                name="new_password"
                label="Nueva contraseña"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShow} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container justifyContent="end">
                <Button variant="contained" type="submit">
                  Guardar cambios
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Container>
  )
}
