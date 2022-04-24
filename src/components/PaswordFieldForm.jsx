import { Visibility, VisibilityOff } from "@mui/icons-material"
import { IconButton, InputAdornment } from "@mui/material"
import { useState } from "react"

import TextFieldForm from "./TextFieldForm"

export default function PasswordFieldForm(props) {
  const { name, label, ...extraProps } = props
  const [show, setShow] = useState(false)

  function handleShow() {
    setShow(!show)
  }

  return (
    <TextFieldForm
      name={name}
      label={label}
      type={show ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={handleShow} edge="end">
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...extraProps}
    />
  )
}
