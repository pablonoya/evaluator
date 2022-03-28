import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { useHistory } from "react-router-dom"

import { Formik, Form } from "formik"
import { Grid, Box, Card, TextField, Typography, Button, Container } from "@mui/material"

import exerciseService from "../../services/exerciseService"
import CodeEditor from "../../components/CodeEditor"
import TextFieldForm from "../../components/TextFieldForm"

export default function SubmitExercise(props) {
  const { showNotification } = props

  const { exerciseId } = useParams()
  const history = useHistory()

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

  function handleSubmit(values) {
    exerciseService
      .submit({ id: exerciseId, code: code })
      .then(res => {
        if (res.status === 200) {
          showNotification("success", "Ejercicio enviado")
        }
      })
      .catch(err => showNotification("error", err.toString()))
  }

  useEffect(() => {
    getExercise(exerciseId)
  }, [])

  return (
    <Container>
      <Formik onSubmit={handleSubmit}>
        <Form>
          <Grid container spacing={3}>
            <Grid item xs={7}>
              <Typography variant="h5">{exercise.name}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Grid container justifyContent="flex-end">
                <Box sx={{ "& > button": { ml: 1, mr: "auto" } }}>
                  <Button onClick={() => history.goBack()}>Cancelar</Button>
                  <Button variant="contained" type="submit">
                    Subir
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2">Descripción</Typography>
              <Typography variant="body1" paragraph>
                {exercise.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    touched
                    multiline
                    label="Ejemplos de entrada"
                    value={exercise.input_examples_min}
                    fullWidth
                    readOnly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    touched
                    multiline
                    label="Ejemplos de salida"
                    value={exercise.output_examples_min}
                    fullWidth
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="h6" paragraph>
                Código solución *
              </Typography>

              <Card variant="outlined">
                <CodeEditor
                  required
                  error={code == ""}
                  name="code"
                  placeholder={"// Pega el código fuente aquí"}
                  value={code}
                  onValueChange={code => setCode(code)}
                />
              </Card>
            </Grid>
          </Grid>
        </Form>
      </Formik>
    </Container>
  )
}
