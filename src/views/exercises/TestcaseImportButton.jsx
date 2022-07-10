import { useRef, useState } from "react"
import {
  Button,
  ButtonGroup,
  Popper,
  Paper,
  MenuItem,
  MenuList,
  Grow,
  ClickAwayListener,
} from "@mui/material"
import { ArrowDropDown, UploadFile } from "@mui/icons-material"

import testcaseService from "../../services/testcaseService"

export default function TestcaseImportButton(props) {
  const { exerciseId, getExercise, setExerciseData, showNotification } = props

  const anchorRef = useRef(null)

  const [open, setOpen] = useState(false)

  async function uploadTestcases(formData) {
    try {
      const { status, data } = await testcaseService.upload(formData)

      if (status === 201) {
        getExercise(exerciseId)
      } else if (status === 200) {
        console.log(data)
        setExerciseData(e => ({ ...e, testcases: data.testcases }))
      }
    } catch (err) {
      showNotification("error", err.toString())
    }
  }

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <input
        id="file-button"
        type="file"
        accept="*.xlsx"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files[0]

          let formData = new FormData()
          formData.append("file", file)
          formData.append("exercise_id", exerciseId)

          uploadTestcases(formData)
        }}
      />

      <ButtonGroup variant="outlined" ref={anchorRef} color="success">
        <Button startIcon={<UploadFile />}>
          <label htmlFor="file-button">Importar</label>
        </Button>
        <Button size="small" onClick={() => setOpen(!open)}>
          <ArrowDropDown />
        </Button>
      </ButtonGroup>

      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem component="a" href="/excel/Casos_de_prueba.xlsx" download>
                    Descargar archivo de ejemplo
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}
