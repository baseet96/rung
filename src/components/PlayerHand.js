import { Paper, Typography, Box } from "@mui/material";
import Card from "./Card";

const PlayerHand = ({ player, index, isActive, onPlayCard, trickLeadSuit }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
      <Typography variant="h6" color={isActive ? "primary" : "textSecondary"}>
        Player {index + 1} {isActive ? "(Your Turn)" : ""}
      </Typography>
      <Box display="flex" flexWrap="wrap">
        {player.map((card, i) => {
          const mustFollowSuit =
            trickLeadSuit && player.some((c) => c.suit === trickLeadSuit);
          const canPlay =
            isActive && (!mustFollowSuit || card.suit === trickLeadSuit);
          return (
            <Box
              key={i}
              onClick={() => canPlay && onPlayCard(index, i)}
              sx={{
                opacity: canPlay ? 1 : 0.3,
                cursor: canPlay ? "pointer" : "not-allowed",
              }}
            >
              <Card card={card} />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default PlayerHand;
