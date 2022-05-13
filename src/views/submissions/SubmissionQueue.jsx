import { useState, useEffect, useRef } from "react"
import { List, ListItem, Typography } from "@mui/material"

import SubmissionCard from "./SubmissionCard"

let connectTimeout
let millis = 250

export default function SubmissionQueue(props) {
  const { showNotification } = props

  const ws = useRef(null)

  const [messages, setMessages] = useState([])

  function handleOnMessage(event) {
    const messageReceived = JSON.parse(event.data)

    setMessages(messages => {
      const messageOld = messages.find(
        msg =>
          msg.exercise == messageReceived.exercise &&
          msg.task == messageReceived.task &&
          msg.user == messageReceived.user
      )

      if (messageOld) {
        return messages.map(msg => {
          if (msg === messageOld) {
            return {
              ...msg,
              status_name: messageReceived.status_name,
              datetime: messageReceived.datetime,
            }
          }
          return msg
        })
      }

      return [messageReceived, ...messages]
    })
  }

  function connectWebSocket() {
    console.log(ws.current?.url)
    ws.current = new WebSocket("ws://localhost:8000/ws/submissions/")

    ws.current.onmessage = handleOnMessage

    ws.current.onopen = () => {
      clearTimeout(connectTimeout)
      millis = 250
      console.info("websocket connected")
    }

    ws.current.onclose = () => {
      console.warn(`Socket closed. Reconnect will be attempted in ${Math.min(10, millis / 1000)}s.`)

      //increment retry interval
      millis *= 2
      clearTimeout(connectTimeout)
      connectTimeout = setTimeout(connectWebSocket, Math.min(10000, millis))
    }

    ws.current.onerror = event => {
      console.error("Socket error", event)
      showNotification("error", "WebSocket error")
    }
  }

  useEffect(() => {
    if (ws.current) {
      return
    }

    connectWebSocket()
  })

  return (
    <div>
      {messages.length > 0 && (
        <>
          <Typography variant="h5">Envíos en revisión</Typography>
          <List>
            {messages.map((msg, i) => (
              <ListItem key={i}>
                <SubmissionCard
                  name={msg.exercise_name}
                  datetime={msg.datetime}
                  status={msg.status_name}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  )
}
