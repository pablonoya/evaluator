import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/authContext"

export default function RouteWithRole(props) {
  const { role, children, redirect } = props
  const [auth] = useAuth()

  if (!auth.groups.includes(role)) {
    return <Navigate to={redirect || "/"} replace />
  }
  return children
}
