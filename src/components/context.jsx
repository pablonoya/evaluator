import { createContext, useState, useContext, useEffect } from "react"
import { useHistory } from "react-router"

import authService from "../services/authService"

const AuthContext = createContext(undefined)

const AuthProvider = props => {
  const [auth, setAuth] = useState()
  let history = useHistory()

  useEffect(() => {
    if (localStorage.getItem("refreshToken")) {
      authService
        .myself()
        .then(res => handleAuth(res.data))
        .catch(err => handleAuth(false))
    }
  }, [])

  function handleAuth(userInfo) {
    if (userInfo) {
      setAuth(userInfo)
      history.push("/")
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
