// import "vite/modulepreload-polyfill"

import React from "react"
import ReactDOM from "react-dom"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import { AuthProvider } from "./components/context"
import { BrowserRouter } from "react-router-dom"

import App from "./App"
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
)
