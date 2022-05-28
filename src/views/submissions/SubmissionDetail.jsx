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
  const { open, handleClose, submission, showNotification } = props

  const [outputExamples, setOutputExamples] = useState()

  async function getOutputs(id) {
    try {
      const { data } = await exerciseService.getOutputs(id)
      setOutputExamples(data)
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  function styledOutput(example, output) {
    const correct = example.split("\n")
    const submitted = output.split("\n")

    return correct.map((correctOutput, i) => (
      <span
        key={i}
        style={{
          backgroundColor: correctOutput.trim() === submitted[i]?.trim() ? green[100] : red[100],
        }}
      >
        {submitted[i]}
      </span>
    ))
  }

  useEffect(() => {
    if (submission.exercise) {
      getOutputs(submission.exercise)
    }
  }, [submission.exercise])

  const styles = css`
    font-family: "Roboto Mono";
    margin-top: -1px;
    border-top: 1px solid ${grey[400]};

    span {
      display: inline-block;
      width: 100%;
      padding-inline: 1rem;
      padding-block: 0.1rem;
      border-bottom: 1px solid ${grey[400]};
    }
    span:empty:before {
      content: "\\200b";
    }
  `

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="body" keepMounted>
      <DialogTitle>{`${submission.exercise_name} por ${submission.student}`}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enviado el {submission.date} a las {submission.time}
        </DialogContentText>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" paragraph>
              Código solución
            </Typography>

            <Card variant="outlined" style={{ maxHeight: "66vh", overflow: "auto" }}>
              <CodeEditor value={submission.source_code || ""} />
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
                    {outputExamples?.map(example => (
                      <p css={styles}>
                        {example.split("\n").map((output, i) => (
                          <span key={i}>{output}</span>
                        ))}
                      </p>
                    ))}
                  </Grid>
                  <Grid item xs={6}>
                    {submission.outputs &&
                      outputExamples?.map((example, i) => (
                        <p id="output" css={styles}>
                          {styledOutput(example, submission.outputs[i])}
                        </p>
                      ))}
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
