import { Box } from "@mui/system"
import { CircularProgress, Typography } from "@mui/material"

export default function Loading() {
  return (
    <Box>
      <Typography align="center" variant="h5" my={4}>
        Iniciando el evaluador...
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    </Box>
  )
}
