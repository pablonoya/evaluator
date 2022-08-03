import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router"
import { useNavigate } from "react-router-dom"

import { Editor } from "@tinymce/tinymce-react"
import { Grid, Box, Card, Typography, Button, Container } from "@mui/material"

import exerciseService from "../../services/exerciseService"
import CodeEditor from "../../components/CodeEditor"
import DataTable from "../../components/DataTable"

const columns = [
  {
    field: "input_example",
    headerName: "Ejemplo de entrada",
    sortable: false,
    flex: 0.4,
    renderCell: params => (
      <div>
        <Typography variant="body1" component="pre">
          {params.row.input_example}
        </Typography>
      </div>
    ),
  },
  {
    field: "output_example",
    headerName: "Ejemplo de salida",
    sortable: false,
    flex: 0.6,
    renderCell: params => (
      <Typography variant="body1" component="pre" style={{ verticalAlign: "top" }}>
        {params.row.output_example}
      </Typography>
    ),
  },
]

export default function SubmitExercise(props) {
  const { showNotification } = props

  const editorRef = useRef(null)

  const navigate = useNavigate()
  const { taskId, exerciseId } = useParams()

  const [code, setCode] = useState("")
  const [exercise, setExercise] = useState({})

  async function getExercise(exerciseId) {
    try {
      const { data } = await exerciseService.get(exerciseId)
      setExercise(data)
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
      const { status } = await exerciseService.submit({
        id: exerciseId,
        task_id: taskId,
        code: code,
      })

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
    <Box sx={{ px: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={7}>
          <Typography variant="h5">{exercise.name}</Typography>
        </Grid>
        <Grid item xs={5}>
          <Grid container justifyContent="flex-end">
            <Box sx={{ "& > button": { ml: 1, mr: "auto" } }}>
              <Button onClick={() => navigate(-1)}>Atrás</Button>
              <Button variant="contained" onClick={() => handleSubmit()}>
                Enviar
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Grid item sm={12} md={6}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Descripción
              </Typography>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                onInit={(_, editor) => (editorRef.current = editor)}
                value={exercise.description}
                inline
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <DataTable
                columns={columns}
                rows={exercise.testcases_min}
                sx={{ "& .MuiDataGrid-cell": { display: "inline", overflow: "scroll" } }}
                getRowHeight={({ model }) => {
                  const input_lines = model.input_example.split("\n")?.length
                  const output_lines = model.output_example.split("\n")?.length

                  return 26 * Math.max(input_lines, output_lines, 2)
                }}
                components={{ Toolbar: null, Footer: "null" }}
                disableColumnMenu
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item sm={12} md={6}>
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
    </Box>
  )
}
