import { Suspense, lazy } from "react"
import { Route, Redirect, Switch } from "react-router-dom"
import { useAuth } from "./components/context"
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
  const [auth, handleAuth] = useAuth(useAuth)
  return (
    <Route
      {...rest}
      render={() => {
        return auth ? (
          <Suspense fallback={<Loading />}>{children}</Suspense>
        ) : (
          <Redirect to="/login" />
        )
      }}
    />
  )
}

export default App
