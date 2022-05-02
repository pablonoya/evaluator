import { useState } from "react"

import {
  Alert,
  Avatar,
  Collapse,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Typography,
} from "@mui/material"

import { LoadingButton } from "@mui/lab"

import { Close, Search, Lock } from "@mui/icons-material"
import { makeStyles } from "@material-ui/core/styles"
import { Box } from "@mui/system"
import { Form, Formik } from "formik"

import { Link as RouterLink } from "react-router-dom"

import authService from "../../services/authService"

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
    backgroundColor: theme.palette.primary.dark,
  },
  submit: {
    margin: theme.spacing(2, 0, 2),
  },
}))

export default function Recover() {
  const classes = useStyles()

  const [loading, setLoading] = useState(false)

  const [open, setOpenAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState("")
  const [alertSeverity, setAlertSeverity] = useState("warning")

  const [showEmailInput, setShowEmailInput] = useState(false)

  async function recoverPassword(username, email) {
    setLoading(true)

    try {
      const { status } = await authService.recoverPassword({ username: username, email: email })

      if (status == 200) {
        setOpenAlert(true)
        setAlertSeverity("success")
        setAlertMsg(
          <>
            Correo de recuperación enviado a <strong>{email}</strong>
          </>
        )
      }
    } catch (e) {
      setOpenAlert(true)
      setAlertSeverity("error")
      setAlertMsg(Error + e.toString())
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(values) {
    const { username, email } = values

    if (!!username && !!email) {
      recoverPassword(username, email)
      return
    }

    try {
      setLoading(true)

      const { data, status } = await authService.search(username)

      if (status === 200) {
        setAlertSeverity("success")
        setAlertMsg(
          <>
            Correo de recuperación enviado a <strong>{data.email}</strong>
          </>
        )
        setOpenAlert(true)
        setShowEmailInput(false)

        recoverPassword(username)
      }
    } catch (err) {
      setOpenAlert(true)

      if (err.response.data?.email === null) {
        setAlertSeverity("info")
        setAlertMsg("El usuario no tiene un email asociado")

        setShowEmailInput(true)
      } else {
        setAlertSeverity("warning")
        setAlertMsg("El usuario no existe")

        setShowEmailInput(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "warning.light", width: 56, height: 56 }}>
          <Lock fontSize="large" />
        </Avatar>

        <Typography component="h1" variant="h5" paragraph>
          Recuperar contraseña
        </Typography>
        <Typography component="h2" variant="body1" paragraph>
          Te enviaremos un correo electrónico con las instructiones de recuperación. Si no tienes un
          email asociado puedes utilizar alguno al que tengas acceso.
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Collapse in={open}>
            <Alert
              severity={alertSeverity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setOpenAlert(false)}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {alertMsg}
            </Alert>
          </Collapse>
        </Box>

        <Formik initialValues={{ username: "", email: "" }} onSubmit={handleSubmit}>
          <Form>
            <TextFieldForm
              label="Usuario"
              name="username"
              placeholder="Introduce tu usuario, email o teléfono"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {showEmailInput && (
              <TextFieldForm
                label="Email"
                name="email"
                placeholder="Introduce un email de recuperación"
                margin="normal"
              />
            )}

            <LoadingButton
              sx={{ mt: 1, mb: 2 }}
              type="submit"
              variant="contained"
              className={classes.submit}
              loading={loading}
              fullWidth
            >
              Recuperar contraseña
            </LoadingButton>

            <span>
              ¿Ya tienes una cuenta? &nbsp;
              <Link component={RouterLink} to="/login">
                inicia sesión
              </Link>
              .
            </span>
          </Form>
        </Formik>
      </Box>
    </Container>
  )
}
