import { Suspense, lazy } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"

import Loading from "./components/Loading"
import Login from "./views/login/Login"
const Navigation = lazy(() => import("./components/Navigation.jsx"))

import { useAuth } from "./contexts/authContext"

function App() {
  return (
    <Routes>
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
  const [auth, _] = useAuth(useAuth)
  const location = useLocation()

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default App
