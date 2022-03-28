import Editor from "react-simple-code-editor"

import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/themes/prism.css"

import { useFormikContext } from "formik"
import { useEffect } from "react"

export default function CodeEditor(props) {
  if (props.editable) {
    const { setFieldValue } = useFormikContext()

    useEffect(() => {
      setFieldValue(props.value)
    }, [])
  }

  return (
    <Editor
      highlight={code => highlight(code, languages.cpp)}
      style={{
        fontFamily: '"Roboto Mono", monospace',
        fontSize: 16,
      }}
      padding={8}
      {...props}
      onValueChange={code => {
        props.onValueChange(code)
        setFieldValue("code", code)
      }}
    />
  )
}
