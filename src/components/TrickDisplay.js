import { Paper, Typography, Grid } from "@mui/material";
import Card from "./Card";

const TrickDisplay = ({ playedCards }) => {
  return (
    <Paper sx={{ p: 2, mt: 2 }} elevation={4}>
      <Typography variant="h6">Current Trick:</Typography>
      <Grid container spacing={2}>
        {playedCards.map((pc, i) => (
          <Grid item key={i}>
            <Typography>Player {pc.playerIndex + 1}</Typography>
            <Card card={pc.card} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TrickDisplay;
