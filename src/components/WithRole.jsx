import { useAuth } from "../contexts/authContext"

export default function WithRole(props) {
  const { role, children } = props
  const [auth] = useAuth()

  return auth.groups.includes(role) ? children : <></>
}
