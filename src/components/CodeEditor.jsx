import Editor from "react-simple-code-editor"

import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/themes/prism.css"

export default function CodeEditor(props) {
  return (
    <Editor
      highlight={code => highlight(code, languages.cpp)}
      autoFocus
      style={{
        fontFamily: '"Roboto Mono", monospace',
        fontSize: 16,
        minHeight: "15em",
      }}
      padding={12}
      {...props}
      onValueChange={code => {
        props.onValueChange(code)
      }}
    />
  )
}
