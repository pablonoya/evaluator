import { useState, useEffect } from "react"
import { Button, Container, Grid, List, ListItem, Typography } from "@mui/material"

import SubmissionCard from "./SubmissionCard"

import submissionService from "../../services/submissionService"

export default function SubmissionQueue(props) {
  const { showNotification } = props

  const [messages, setMessages] = useState([])
  const [submissions, setSubmissions] = useState([])

  function connectWebsocket() {
    const ws = new WebSocket("ws://localhost:8000/ws/submissions/")
    let timeout = 250
    let connectInterval

    ws.onmessage = event => {
      const messageReceived = JSON.parse(event.data)

      setMessages(messages => {
        const messageOld = messages.find(
          msg => msg.exercise == messageReceived.exercise && msg.user == messageReceived.user
        )

        if (messageOld) {
          return messages.map(msg => {
            if (msg === messageOld) {
              return {
                ...msg,
                status_name: messageReceived.status_name,
                date: messageReceived.date,
                time: messageReceived.time,
              }
            }
            return msg
          })
        }

        return [messageReceived, ...messages]
      })
    }

    ws.onopen = () => {
      console.info("websocket connected")
      timeout = 250

      clearTimeout(connectInterval)
    }

    ws.onclose = () => {
      console.log(
        `Socket closed. Reconnect will be attempted in ${Math.min(1, (2 * timeout) / 1000)}s.`
      )

      //increment retry interval
      timeout *= 2
      connectInterval = setTimeout(connectWebsocket, Math.min(10000, timeout))
    }

    ws.onerror = event => {
      console.error("Socket error", event)
      showNotification("error", "WebSocket error")
    }

    return ws
  }

  async function getSubmissions() {
    try {
      const res = await submissionService.getAll()
      if (res.status === 200) {
        setMessages([])
        setSubmissions(res.data)
        connectWebsocket()
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  useEffect(() => {
    getSubmissions()
  }, [])

  return (
    <Container>
      {messages.length > 0 && (
        <>
          <Typography variant="h5">Ejercicios en cola</Typography>
          <List>
            {messages.map((msg, i) => (
              <ListItem key={i}>
                <SubmissionCard
                  name={msg.exercise_name}
                  date={msg.date}
                  time={msg.time}
                  status={msg.status_name}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Grid container justifyContent="space-between">
        <Typography variant="h5">Ejercicios enviados</Typography>
        <Button onClick={() => getSubmissions()} variant="contained">
          Actualizar
        </Button>
      </Grid>

      <List>
        {submissions.map((sub, i) => (
          <ListItem key={i}>
            <SubmissionCard
              name={sub.exercise_name}
              date={sub.date}
              time={sub.time}
              status={sub.status_name}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  )
}
