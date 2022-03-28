import { TextField } from "@mui/material"
import { useField } from "formik"

export default function TextFieldForm(props) {
  const { name, ...otherProps } = props
  const [field] = useField(name)

  return <TextField {...field} {...otherProps} fullWidth />
}
