/** @jsxImportSource @emotion/react */
import { useState, useEffect } from "react"

import { css } from "@emotion/react"

import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material"
import DialogContentText from "@material-ui/core/DialogContentText"
import { red, green, grey } from "@mui/material/colors"

import exerciseService from "../../services/exerciseService"
import CodeEditor from "../../components/CodeEditor"

export default function SubmissionDetail(props) {
  const { open, handleClose, details, showNotification } = props

  const [outputExamples, setOutputExamples] = useState()
  const [submittedOutputs, setSubmittedOutputs] = useState([])

  async function getOutputs(id) {
    try {
      const { data } = await exerciseService.getOutputs(id)
      setOutputExamples(data)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function formatOutput(output) {
    const correctOutputs = outputExamples.split("\n")
    const submissionOutputs = output.split("\n")

    let formattedOutput = correctOutputs.map((correctOutput, i) => {
      const valid = correctOutput.trim() === submissionOutputs[i]?.trim()

      return (
        <span key={i} style={{ backgroundColor: valid ? green[100] : red[100] }}>
          {submissionOutputs[i]}
        </span>
      )
    })

    setSubmittedOutputs(formattedOutput)
  }

  useEffect(() => {
    if (open && details.output && outputExamples) {
      formatOutput(details.output)
    }
  }, [outputExamples, details.output, outputExamples])

  useEffect(() => {
    if (details.exercise) {
      getOutputs(details.exercise)
    }
  }, [details.exercise])

  const styles = css`
    font-family: "Roboto Mono";
    margin: 0;
    span {
      display: inline-block;
      width: 100%;
      padding-inline: 1rem;
      padding-block: 0.1rem;
      border-bottom: 1px solid ${grey[500]};
    }
    span:empty:before {
      content: "\\200b";
    }
  `

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="body" keepMounted>
      <DialogTitle>{`${details.exercise_name} por ${details.student}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enviado el {details.date} a las {details.time}
        </DialogContentText>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" paragraph>
              Código solución
            </Typography>

            <Card variant="outlined" style={{ maxHeight: "66vh", overflow: "auto" }}>
              <CodeEditor value={details.source_code || ""} />
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1" paragraph>
              Salidas
            </Typography>

            <Card variant="outlined">
              <Grid container sx={{ borderBottom: 1, borderColor: "grey.300" }}>
                <Grid item xs={6} sx={{ py: 1, px: 2 }}>
                  Correctas
                </Grid>
                <Grid item xs={6} sx={{ py: 1, px: 2 }}>
                  Enviadas
                </Grid>
              </Grid>
              <CardContent style={{ maxHeight: "60vh", overflow: "auto" }} sx={{ p: 0 }}>
                <Grid container>
                  <Grid item xs={6}>
                    {outputExamples && (
                      <p css={styles}>
                        {outputExamples.split("\n").map((output, i) => (
                          <span key={i}>{output}</span>
                        ))}
                      </p>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <p id="output" css={styles}>
                      {submittedOutputs}
                    </p>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Atrás</Button>
      </DialogActions>
    </Dialog>
  )
}
