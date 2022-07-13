import React from "react"

import { Container } from "@material-ui/core"
import { Typography } from "@mui/material"

import { useAuth } from "../../contexts/authContext"

export default function Home(props) {
  const [auth] = useAuth()

  return (
    <Container component="main">
      <Typography variant="h2">¡Bienvenido, {auth.username}!</Typography>
    </Container>
  )
}
