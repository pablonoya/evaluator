import { Box } from "@mui/system"
import { CircularProgress, Typography } from "@mui/material"

export default function Loading() {
  return (
    <Box
      sx={{
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="subtitle1" sx={{ mx: "auto" }}>
        Iniciando el evaluador...
      </Typography>
      <CircularProgress />
    </Box>
  )
}
