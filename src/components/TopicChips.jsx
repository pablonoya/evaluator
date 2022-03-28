import { Chip, Stack } from "@mui/material"

export default function TopicChips(props) {
  const { topics } = props

  return (
    <Stack direction="row" spacing={1}>
      {topics?.map(({ id, name }) => (
        <Chip key={id} label={name} size="small" variant="outlined" color="primary" />
      ))}
    </Stack>
  )
}
