import { Suspense, lazy } from "react"
import { Route, Redirect, Switch } from "react-router-dom"

import { useAuth } from "./contexts/authContext"
import Loading from "./components/Loading"

const Login = lazy(() => import("./views/login/Login.jsx"))
const Navigation = lazy(() => import("./components/Navigation.jsx"))

function App() {
  return (
    <Switch>
      <Route path="/login">
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
      </Route>
      <PrivateRoute path="/">
        <Navigation />
      </PrivateRoute>
    </Switch>
  )
}

function PrivateRoute({ children, ...rest }) {
  const [auth] = useAuth(useAuth)

  return (
    <Route
      render={() => {
        return auth ? (
          <Suspense fallback={<Loading />}>{children}</Suspense>
        ) : (
          <Redirect push to="/login" />
        )
      }}
      {...rest}
    />
  )
}

export default App
