import React from "react"

import { Link as RouterLink } from "react-router-dom"

import { Container } from "@material-ui/core"
import { Grid, Typography, Button } from "@mui/material"

import WithRole from "../../components/WithRole"
import { useAuth } from "../../contexts/authContext"

export default function Home() {
  const [auth] = useAuth()

  return (
    <Container component="main">
      <Grid container>
        <Grid item xs={12} sm={7}></Grid>

        <Grid item xs={12} sm={6} pt={12}>
          <Typography variant="h3" gutterBottom>
            ¡Bienvenido, {auth.first_name || auth.username}!
          </Typography>
          <Typography variant="body1" paragraph>
            El evaluador busca apoyar en la calificación de prácticas de programación, siendo capaz
            de revisar código fuente en C++ que busque resolver un ejercicio.
          </Typography>
          <Typography variant="body1" paragraph>
            Los ejercicios se agrupan en tareas y pertenecen a varios temas.
          </Typography>

          <WithRole role="Alumnos">
            <Button variant="contained" to="/tareas" LinkComponent={RouterLink}>
              Ver tareas
            </Button>
          </WithRole>

          <WithRole role="Docente">
            <Button variant="contained" to="/ejercicios" LinkComponent={RouterLink}>
              Ver ejercicios
            </Button>
          </WithRole>
        </Grid>

        <Grid item xs={12} sm={6}>
          <img src="./img/home.webp" />
        </Grid>
      </Grid>
    </Container>
  )
}
