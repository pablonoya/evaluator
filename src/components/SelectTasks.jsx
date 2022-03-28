import { Select, MenuItem, FormControl, InputLabel } from "@mui/material"
import { useState, useEffect } from "react"

import taskService from "../services/taskService"

export default function SelectTasks(props) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    taskService.getAll().then(res => setTasks(res.data))
  }, [])

  return (
    <>
      <FormControl variant="standard" sx={{ m: 0 }}>
        <InputLabel id="task-label">Tarea</InputLabel>
        <Select labelId="task-label" {...props} displayEmpty>
          <MenuItem key={0} value="">
            Todas
          </MenuItem>
          {tasks.map(task => (
            <MenuItem key={task.id} value={task.id}>
              {task.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}
