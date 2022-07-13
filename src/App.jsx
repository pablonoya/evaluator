import { Suspense, lazy } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"

import { useAuth } from "./contexts/authContext"

import Loading from "./views/base/Loading"
const Navigation = lazy(() => import("./views/base/Navigation.jsx"))

import Login from "./views/login/Login"
import Restore from "./views/login/Restore"
import Recover from "./views/login/Recover"

function App() {
  return (
    <Routes>
      <Route path="/restablecer" element={<Restore />} />
      <Route path="/recuperar" element={<Recover />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <RequireAuth>
            <Suspense fallback={<Loading />}>
              <Navigation />
            </Suspense>
          </RequireAuth>
        }
      />
    </Routes>
  )
}

function RequireAuth({ children }) {
  const [auth] = useAuth()
  const location = useLocation()

  if (!auth) {
    return <Navigate to="/login" state={{ path: location.pathname }} replace />
  }
  return children
}

export default App
