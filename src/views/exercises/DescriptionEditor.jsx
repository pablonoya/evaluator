import { Editor } from "@tinymce/tinymce-react"
import { useField } from "formik"
import { useRef } from "react"

export default function DescriptionEditor(props) {
  const { value } = props

  const editorRef = useRef(null)
  const [, , helpers] = useField("description")

  const { setValue } = helpers

  return (
    <Editor
      tinymceScriptSrc={"./tinymce/tinymce.min.js"}
      onInit={(_, editor) => (editorRef.current = editor)}
      textareaName="description"
      onEditorChange={stringifiedHtmlValue => {
        setValue(stringifiedHtmlValue)
      }}
      initialValue={value}
      init={{
        menubar: false,
        language: "es_MX",
        plugins: ["autolink", "lists", "image", "anchor", "code", "table", "preview"],
        toolbar:
          "undo redo | blocks |" +
          "bold italic blockquote forecolor |" +
          "alignleft aligncenter alignright |" +
          "bullist numlist outdent indent |" +
          "table tableprops tabledelete | image ",
        content_style: "body { font-family:Roboto,Helvetica,Arial,sans-serif; font-size:15px }",
      }}
    />
  )
}
