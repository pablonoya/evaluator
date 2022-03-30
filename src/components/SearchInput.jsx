import { IconButton, TextField } from "@mui/material"
import { Clear, Search } from "@mui/icons-material"

export default function SearchInput(props) {
  const { query, setQuery, ...rest } = props

  return (
    <TextField
      value={query}
      variant="outlined"
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
