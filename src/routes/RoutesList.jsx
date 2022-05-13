import { Routes, Route } from "react-router-dom"

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
import Reports from "../views/reports/Reports"
import ExercisesStudent from "../views/exercises/ExercisesStudent"

export default function RoutesList(props) {
  const { showNotification } = props

  return (
    <Routes>
      <Route index element={<Home />} />

      <Route path="tareas">
        <Route index element={<Tasks showNotification={showNotification} />} />
        <Route path=":taskId/" element={<ExercisesStudent showNotification={showNotification} />} />
        <Route path=":taskId/editar" element={<TaskForm showNotification={showNotification} />} />
      </Route>

      <Route path="temas">
        <Route element={<Topics showNotification={showNotification} />} />
        <Route path="crear" element={<TaskForm showNotification={showNotification} />} />
      </Route>

      <Route path="ejercicios" element={<Exercises showNotification={showNotification} />} />
      <Route
        path="enviar/:taskId/:exerciseId"
        element={<SubmitExercise showNotification={showNotification} />}
      />
      <Route path="mis-envios" element={<Submissions showNotification={showNotification} />} />
      <Route path="estudiantes" element={<Students showNotification={showNotification} />} />
      <Route path="envios" element={<Submissions showNotification={showNotification} />} />
      <Route path="reportes" element={<Reports showNotification={showNotification} />} />
      <Route path="perfil" element={<Profile showNotification={showNotification} />} />
    </Routes>
  )
}
