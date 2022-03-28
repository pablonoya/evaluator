import { Card, CardContent, Grid, Typography } from "@mui/material"

export default function SubmissionCard(props) {
  const { name, date, time, status } = props
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Grid container justifyContent="space-between">
          <Typography variant="h6">{name}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {date} {time}
          </Typography>
        </Grid>
        {status}
      </CardContent>
    </Card>
  )
}
