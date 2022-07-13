import { Routes, Route, Navigate } from "react-router-dom"

import Home from "../views/base/Home"
import Profile from "../views/profile/Profile"

import Tasks from "../views/tasks/Tasks"
import TaskForm from "../views/tasks/TaskForm"

import Exercises from "../views/exercises/Exercises"
import ExerciseForm from "../views/exercises/ExerciseForm"
import SubmitExercise from "../views/exercises/SubmitExercise"

import Submissions from "../views/submissions/Submissions"

import Students from "../views/students/Students"
import Topics from "../views/topics/Topics"
import Reports from "../views/reports/Reports"
import ExercisesStudent from "../views/exercises/ExercisesStudent"

import RouteWithRole from "../components/RouteWithRole"

export default function RoutesList(props) {
  const { showNotification } = props

  const teacherRoutes = [
    {
      path: "temas",
      component: <Topics showNotification={showNotification} />,
    },
    {
      path: "estudiantes",
      component: <Students showNotification={showNotification} />,
    },
    {
      path: "reportes",
      component: <Reports showNotification={showNotification} />,
    },
  ]

  return (
    <Routes>
      <Route index element={<Home />} />

      <Route path="tareas">
        <Route index element={<Tasks showNotification={showNotification} />} />
        <Route path=":taskId/" element={<ExercisesStudent showNotification={showNotification} />} />
        <Route
          path=":taskId/editar"
          element={
            <RouteWithRole role="Docente" redirect="/tareas">
              <TaskForm showNotification={showNotification} />
            </RouteWithRole>
          }
        />
        <Route
          path="crear"
          element={
            <RouteWithRole role="Docente" redirect="/tareas">
              <TaskForm showNotification={showNotification} />
            </RouteWithRole>
          }
        />
      </Route>

      <Route path="ejercicios">
        <Route index element={<Exercises showNotification={showNotification} />} />
        <Route
          path=":exerciseId/editar"
          element={
            <RouteWithRole role="Docente" redirect="/tareas">
              <ExerciseForm showNotification={showNotification} />
            </RouteWithRole>
          }
        />
        <Route
          path="crear"
          element={
            <RouteWithRole role="Docente" redirect="/tareas">
              <ExerciseForm showNotification={showNotification} />
            </RouteWithRole>
          }
        />
      </Route>

      <Route path="envios" element={<Submissions showNotification={showNotification} />} />
      <Route path="perfil" element={<Profile showNotification={showNotification} />} />
      <Route
        path="enviar/:taskId/:exerciseId"
        element={<SubmitExercise showNotification={showNotification} />}
      />

      {teacherRoutes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteWithRole role="Docente">{route.component}</RouteWithRole>}
        />
      ))}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
