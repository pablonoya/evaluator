import { useEffect, useState } from "react"

import { Alert, Avatar, Box, Collapse, Container, Link, IconButton, Typography } from "@mui/material"
import { AccountCircle, Close } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"

import { Form, Formik } from "formik"
import { Link as RouterLink, useLocation } from "react-router-dom"

import { useAuth } from "../../contexts/authContext"

import http from "../../services/http-common"
import authService from "../../services/authService"

import PasswordFieldForm from "../../components/PaswordFieldForm"
import TextFieldForm from "../../components/TextFieldForm"

export default function Login() {
  const [_, handleAuth] = useAuth()
  const { state } = useLocation()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function login() {
    try {
      const { data } = await authService.myself()
      handleAuth(data, state?.path)
    } catch (err) {
      console.error(err)
      handleAuth(false)
    }
  }

  async function handleSubmit(values) {
    setLoading(true)
    try {
      const res = await authService.login({
        username: values.username,
        password: values.password,
      })

      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.access)
        localStorage.setItem("refreshToken", res.data.refresh)

        http.defaults.headers["Authorization"] = "Bearer " + res.data.access

        login()
      }
    } catch (err) {
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem("refreshToken")) {
      setLoading(true)
      login()
    }
  }, [])

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
        <Avatar sx={{ m: 1, bgcolor: "primary.light", width: 56, height: 56 }}>
          <AccountCircle fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h5" paragraph>
          ¡Bienvenido al Evaluador!
        </Typography>

        <Box sx={{ width: "100%" }}>
          <Collapse in={open}>
            <Alert
              sx={{ mb: 2 }}
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
            <LoadingButton
              sx={{ mt: 2, mb: 3 }}
              variant="contained"
              type="submit"
              loading={loading}
              fullWidth
            >
              Ingresar
            </LoadingButton>
            <Link component={RouterLink} to="/recuperar">
              ¿Olvidaste tu contraseña?
            </Link>
          </Form>
        </Formik>
      </Box>
    </Container>
  )
}
