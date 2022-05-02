import { useState } from "react"
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom"

import { Alert, Avatar, Box, Collapse, Container, IconButton, Link, Typography } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import { Close, LockReset } from "@mui/icons-material"
import LockResetIcon from "@mui/icons-material/LockReset"

import { Form, Formik } from "formik"

import http from "../../services/http-common"
import authService from "../../services/authService"

import PasswordFieldForm from "../../components/PaswordFieldForm"
import TextFieldForm from "../../components/TextFieldForm"

export default function Restore() {
  const navigate = useNavigate()
  const [searchParams, _] = useSearchParams()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [alertMsg, setAlertMsg] = useState("")
  const [alertSeverity, setAlertSeverity] = useState("warning")

  const userToken = searchParams.get("user")

  async function handleSubmit(values) {
    setOpen(false)

    if (values.password !== values.password_confirm) {
      setAlertSeverity("warning")
      setAlertMsg("Las contraseñas no coinciden")
      setOpen(true)
      return
    }

    if (!userToken) {
      setAlertSeverity("error")
      setAlertMsg("El token no es válido o ha expirado")
      setOpen(true)
      return
    }

    setLoading(true)
    try {
      localStorage.setItem("accessToken", userToken)
      http.defaults.headers["Authorization"] = "Bearer " + userToken

      const { status } = await authService.changePassword(values.password)

      if (status === 200) {
        setAlertSeverity("success")
        setAlertMsg("Contraseña cambiada")
        setOpen(true)

        setTimeout(() => navigate("/login"), 5000)
      } else {
        setAlertSeverity("error")
        setAlertMsg("El token no es válido o ha expirado")
        setOpen(true)
      }
    } catch (err) {
      setAlertSeverity("error")
      setAlertMsg("El token no es válido o ha expirado")
      setOpen(true)
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
        <Avatar sx={{ m: 1, bgcolor: "info.light", width: 56, height: 56 }}>
          <LockResetIcon fontSize="large" />
        </Avatar>

        <Typography component="h1" variant="h5" paragraph>
          Restablecer contraseña
        </Typography>
        <Typography component="h2" variant="body1" paragraph>
          Escribe tu nueva contraseña.
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
                  onClick={() => setOpen(false)}
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

        <Formik initialValues={{ password: "" }} onSubmit={handleSubmit}>
          <Form>
            <PasswordFieldForm label="Contraseña" name="password" margin="normal" required />
            <TextFieldForm
              type="password"
              label="Confirmar contraseña"
              name="password_confirm"
              margin="normal"
              required
            />
            <LoadingButton
              sx={{ mt: 2, mb: 3 }}
              type="submit"
              variant="contained"
              loading={loading}
              fullWidth
            >
              Cambiar contraseña
            </LoadingButton>
            <span>
              ¿No puedes continuar? &nbsp;
              <Link component={RouterLink} to="/recuperar">
                solicita un nuevo token
              </Link>
              &nbsp;o&nbsp;
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
