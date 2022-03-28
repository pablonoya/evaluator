import { Box } from "@mui/system"
import { CircularProgress } from "@mui/material"

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
      <CircularProgress />
    </Box>
  )
}
