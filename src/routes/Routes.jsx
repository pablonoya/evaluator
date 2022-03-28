import { Switch, Route } from "react-router-dom"

import Home from "../views/Home"
import Profile from "../views/profile/Profile"

import Tasks from "../views/tasks/Tasks"
import TaskForm from "../views/tasks/TaskForm"

import Exercises from "../views/exercises/Exercises"
import SubmitExercise from "../views/submitExercise/SubmitExercise"

import Submissions from "../views/submissions/Submissions"
import SubmissionQueue from "../views/submissions/SubmissionQueue"

import Students from "../views/students/Students"
import Topics from "../views/topics/Topics"
import Stats from "../views/stats/Stats"

export default function Routes(props) {
  const { showNotification } = props

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/temas">
        <Topics showNotification={showNotification} />
      </Route>
      <Route path="/tareas/crear">
        <TaskForm showNotification={showNotification} />
      </Route>
      <Route path="/tareas/:taskId/editar">
        <TaskForm showNotification={showNotification} />
      </Route>
      <Route path="/tareas">
        <Tasks showNotification={showNotification} />
      </Route>
      <Route path="/ejercicios/:exerciseId/subir">
        <SubmitExercise showNotification={showNotification} />
      </Route>
      <Route path="/ejercicios">
        <Exercises showNotification={showNotification} />
      </Route>
      <Route path="/mis-envios">
        <SubmissionQueue showNotification={showNotification} />
      </Route>
      <Route path="/estudiantes">
        <Students showNotification={showNotification} />
      </Route>
      <Route path="/envios">
        <Submissions showNotification={showNotification} />
      </Route>
      <Route path="/estadisticas">
        <Stats showNotification={showNotification} />
      </Route>
      <Route path="/perfil">
        <Profile showNotification={showNotification} />
      </Route>
    </Switch>
  )
}
