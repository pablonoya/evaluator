import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"

import { Grid, Box, Card, TextField, Typography, Button, Container } from "@mui/material"

import exerciseService from "../../services/exerciseService"
import CodeEditor from "../../components/CodeEditor"

export default function SubmitExercise(props) {
  const { showNotification } = props

  const { exerciseId } = useParams()
  const navigate = useNavigate()

  const [code, setCode] = useState("")
  const [exercise, setExercise] = useState({
    input_examples_min: "",
    output_examples_min: "",
  })

  async function getExercise(exerciseId) {
    try {
      const res = await exerciseService.get(exerciseId)
      setExercise(res.data)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  async function handleSubmit() {
    if (!code) {
      showNotification("warning", "Llena el código solución")
      return
    }

    try {
      const { status } = await exerciseService.submit({ id: exerciseId, code: code })

      if (status === 200) {
        showNotification("success", "Ejercicio enviado")
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    getExercise(exerciseId)
  }, [])

  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={7}>
          <Typography variant="h5">{exercise.name}</Typography>
        </Grid>
        <Grid item xs={5}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button": { ml: 1, mr: "auto" } }}>
              <Button onClick={() => navigate(-1)}>Cancelar</Button>
              <Button variant="contained" onClick={() => handleSubmit()}>
                Subir
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {exercise.description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    multiline
                    label="Ejemplos de entrada"
                    value={exercise.input_examples_min}
                    fullWidth
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    multiline
                    label="Ejemplos de salida"
                    value={exercise.output_examples_min}
                    fullWidth
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h6" paragraph>
            Código solución
          </Typography>

          <Card variant="outlined">
            <CodeEditor
              required
              name="code"
              placeholder={"// Pega el código fuente aquí"}
              value={code}
              onValueChange={code => setCode(code)}
              rows="10"
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
