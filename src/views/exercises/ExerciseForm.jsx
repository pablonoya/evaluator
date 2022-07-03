import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Formik, Form, useField } from "formik"

import { Container, Grid, Button, Typography, IconButton } from "@mui/material"
import { Add, Clear, Create } from "@mui/icons-material"

import exerciseService from "../../services/exerciseService"
import testcaseService from "../../services/testcaseService"

import TextFieldForm from "../../components/TextFieldForm"
import TopicsAutocomplete from "../../components/TopicsAutocomplete"
import DataTable from "../../components/DataTable"

import TestCaseDialog from "./TestCaseDialog"
import DescriptionEditor from "./DescriptionEditor"

function ActionsCell(props) {
  return (
    <>
      <IconButton onClick={() => props.edit()}>
        <Create />
      </IconButton>
      <IconButton onClick={() => props.delete()}>
        <Clear />
      </IconButton>
    </>
  )
}

export default function ExerciseForm(props) {
  const { showNotification } = props

  const columns = [
    {
      field: "input_example",
      headerName: "Ejemplo de entrada",
      flex: 0.44,
      headerAlign: "left",
      type: "actions",
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
      flex: 0.44,
      headerAlign: "left",
      type: "actions",
      renderCell: params => (
        <Typography variant="body1" component="pre" style={{ verticalAlign: "top" }}>
          {params.row.output_example}
        </Typography>
      ),
    },
    {
      headerName: "Acciones",
      type: "actions",
      flex: 0.12,
      renderCell: ({ row }) => (
        <ActionsCell edit={() => editTestcase(row)} delete={() => deleteTestcase(row)} />
      ),
    },
  ]
  const navigate = useNavigate()

  const [exerciseData, setExerciseData] = useState({
    name: "",
    description: "",
    topics: [],
    testcases: [],
  })

  const [openDialog, setOpenDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [testcaseData, setTestcaseData] = useState({})

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { exerciseId } = useParams()
  const editing = exerciseId != null

  async function getExercise(exerciseId) {
    const { data } = await exerciseService.get(exerciseId)
    setExerciseData(data)
  }

  function createTestCase() {
    setOpenDialog(true)
    setEditDialog(false)
    setTestcaseData({})
  }

  function editTestcase(row) {
    setOpenDialog(true)
    setEditDialog(true)
    setTestcaseData(row)
  }

  async function deleteTestcase(row) {
    try {
      const { status } = testcaseService.delete(row.id)
      if (status < 300) {
        showNotification("info", "Caso de prueba eliminado")
      }
      getExercise(exerciseId)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  async function handleSubmit(values) {
    try {
      if (editing) {
        const res = exerciseService.update(values.id, values)

        if (res.status == 200) {
          showNotification("success", `Ejercicio ${values.name} editado`)
        }
      } else {
        const res = exerciseService.create({
          ...values,
          testcases: exerciseData.testcases,
        })

        if (res.status == 201) {
          showNotification("success", `Ejercicio ${values.name} creado`)
        }
      }
      navigate(-1)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    if (editing) {
      getExercise(exerciseId)
    }
  }, [exerciseId])

  return (
    <Container component="main">
      <Typography variant="h5" paragraph>
        {editing ? "Editar" : "Nuevo"} ejercicio
      </Typography>
      <Formik initialValues={exerciseData} onSubmit={handleSubmit} enableReinitialize>
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextFieldForm name="name" label="Nombre" required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TopicsAutocomplete
                label="Temas"
                editing={editing}
                selectedTopics={exerciseData.topics}
                showNotification={showNotification}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Descripción
              </Typography>

              <DescriptionEditor value={exerciseData.description} />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2} justifyContent="space-between" sx={{ py: 1 }}>
                <Grid item xs={7}>
                  <Typography variant="h6">Casos de prueba</Typography>
                </Grid>
                <Grid item>
                  <Button variant="outlined" startIcon={<Add />} onClick={createTestCase}>
                    Añadir
                  </Button>
                </Grid>
              </Grid>

              <DataTable
                columns={columns}
                rows={exerciseData.testcases}
                sx={{ "& .MuiDataGrid-cell": { display: "inline" } }}
                getRowHeight={({ model }) => {
                  const input_lines = model.input_example.split("\n")?.length
                  const output_lines = model.output_example.split("\n")?.length

                  return 26 * Math.max(input_lines, output_lines, 2)
                }}
                paginationMode="client"
                components={{ Toolbar: null }}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </Grid>
          </Grid>

          <Grid container justifyContent="end" sx={{ mt: 2, "& > button": { ml: 1 } }}>
            <Button onClick={() => navigate(-1)}>Atrás</Button>
            <Button variant="contained" type="submit">
              {editing ? "Guardar" : "Crear"}
            </Button>
          </Grid>
        </Form>
      </Formik>

      <TestCaseDialog
        handleClose={() => setOpenDialog(false)}
        open={openDialog}
        editing={editDialog}
        exerciseId={exerciseId}
        testcaseData={testcaseData}
        getExercise={getExercise}
        setExerciseData={setExerciseData}
      />
    </Container>
  )
}
