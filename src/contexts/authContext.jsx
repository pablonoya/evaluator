import { createContext, useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router"

const AuthContext = createContext(undefined)

const AuthProvider = props => {
  const [auth, setAuth] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === "/restablecer") {
      handleAuth(false)
      return
    }
  }, [])

  function handleAuth(userInfo, navigateTo) {
    if (userInfo) {
      setAuth(userInfo)
      navigate(navigateTo || "/", { replace: true })
    } else {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }

    setAuth(userInfo)
  }

  const data = [auth, handleAuth]
  return <AuthContext.Provider value={data}>{props.children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth can only be used inside AuthProvider")
  }
  return context
}

export { AuthProvider, useAuth }
