import { useState } from "react"
import { Alert, Avatar, Button, Collapse, Container, IconButton, Typography } from "@mui/material"
import { AccountCircle, Close } from "@mui/icons-material"
import { makeStyles } from "@material-ui/core/styles"
import { Box } from "@mui/system"
import { Form, Formik } from "formik"
import { useAuth } from "../../contexts/authContext"

import http from "../../services/http-common"
import authService from "../../services/authService"

import PasswordFieldForm from "../../components/PaswordFieldForm"
import TextFieldForm from "../../components/TextFieldForm"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.light,
  },
  submit: {
    margin: theme.spacing(2, 0, 2),
  },
}))

export default function Login(props) {
  const classes = useStyles()
  const [auth, handleAuth] = useAuth()

  const [open, setOpen] = useState(false)

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
      setOpen(true)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Container>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <AccountCircle />
          </Avatar>
          <Typography component="h1" variant="h5" paragraph>
            ¡Bienvenido al Evaluador!
          </Typography>

          <Box sx={{ width: "100%" }}>
            <Collapse in={open}>
              <Alert
                severity="warning"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setOpen(false)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                Usuario o contraseña incorrectos
              </Alert>
            </Collapse>
          </Box>

          <Formik initialValues={{ username: "", password: "" }} onSubmit={handleSubmit}>
            <Form>
              <TextFieldForm
                label="Usuario, email o celular"
                name="username"
                margin="normal"
                autoFocus
                required
              />
              <PasswordFieldForm label="Contraseña" name="password" margin="normal" required />
              <Button variant="contained" type="submit" className={classes.submit} fullWidth>
                Ingresar
              </Button>
            </Form>
          </Formik>
        </div>
      </Container>
    </Container>
  )
}
