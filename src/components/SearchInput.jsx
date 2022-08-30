import { useState, useEffect } from "react"

import { IconButton, TextField } from "@mui/material"
import { Clear, Search } from "@mui/icons-material"

let timer

export default function SearchInput(props) {
  const { callback, ...rest } = props
  const [query, setQuery] = useState()

  useEffect(() => {
    clearTimeout(timer)
    timer = setTimeout(() => callback(query), 250)
  }, [query])

  return (
    <TextField
      value={query}
      size="small"
      onChange={e => setQuery(e.target.value)}
      InputProps={{
        startAdornment: <Search size="small" />,
        endAdornment: (
          <IconButton
            size="small"
            style={{ visibility: query ? "visible" : "hidden" }}
            onClick={() => setQuery("")}
          >
            <Clear fontSize="small" />
          </IconButton>
        ),
      }}
      {...rest}
    />
  )
}
