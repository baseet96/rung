import { Typography, Box, Button } from "@mui/material";

const GameSetup = ({
  playersCount,
  setPlayersCount,
  gameRule,
  setGameRule,
  onStart,
}) => {
  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h6" gutterBottom>
        Select Number of Players:
      </Typography>
      <Box mb={2}>
        <Button
          variant={playersCount === 4 ? "contained" : "outlined"}
          onClick={() => setPlayersCount(4)}
          sx={{ mr: 2, minWidth: 120 }}
        >
          4 Players
        </Button>
        <Button
          variant={playersCount === 8 ? "contained" : "outlined"}
          onClick={() => setPlayersCount(8)}
          sx={{ minWidth: 120 }}
        >
          8 Players
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Select Game Rule:
      </Typography>
      <Box mb={2}>
        <Button
          variant={gameRule === "single" ? "contained" : "outlined"}
          onClick={() => setGameRule("single")}
          sx={{ mr: 2, minWidth: 180 }}
        >
          Single Sir
        </Button>
        <Button
          variant={gameRule === "double" ? "contained" : "outlined"}
          onClick={() => setGameRule("double")}
          sx={{ mr: 2, minWidth: 180 }}
        >
          Double Sir
        </Button>
        <Button
          variant={gameRule === "double-ace" ? "contained" : "outlined"}
          onClick={() => setGameRule("double-ace")}
          sx={{ minWidth: 180 }}
        >
          Double Sir with Ace
        </Button>
      </Box>

      <Box mt={2}>
        <Button variant="contained" size="large" onClick={onStart}>
          Deal Cards
        </Button>
      </Box>
    </Box>
  );
};

export default GameSetup;
