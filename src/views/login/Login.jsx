import { Button, Container, Grid } from "@mui/material"
import { Form, Formik } from "formik"
import { useAuth } from "../../components/context"

import TextFieldForm from "../../components/TextFieldForm"
import authService from "../../services/authService"
import http from "../../services/http-common"

export default function Login(props) {
  const [auth, handleAuth] = useAuth()

  async function handleSubmit(values) {
    try {
      const res = await authService.login({
        username: values.username,
        password: values.password,
      })

      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.access)
        localStorage.setItem("refreshToken", res.data.refresh)

        http.defaults.headers["Authorization"] = "Bearer " + res.data.access

        const { data } = await authService.myself()
        handleAuth(data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Container sx={{ mt: 5 }}>
      <Formik initialValues={{ username: "", password: "" }} onSubmit={handleSubmit}>
        <Form>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextFieldForm label="usuario" name="username" />
              </Grid>
              <Grid item xs={7}>
                <TextFieldForm label="contraseña" name="password" type="password" />
              </Grid>
              <Grid item xs={7}>
                <Button variant="contained" type="submit">
                  Ingresar
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Form>
      </Formik>
    </Container>
  )
}
