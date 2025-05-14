import React, { useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { motion } from "motion/react";

const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

const generateDeck = () => {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
};

const shuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const dealCards = (deck, playersCount) => {
  const players = Array.from({ length: playersCount }, () => []);
  const cardsPerPlayer = Math.floor(deck.length / playersCount);
  for (let i = 0; i < cardsPerPlayer * playersCount; i++) {
    players[i % playersCount].push(deck[i]);
  }
  return players;
};

const getCardValue = (card) => values.indexOf(card.value);

const Card = ({ card }) => (
  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
    <Paper
      elevation={3}
      sx={{
        width: 40,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        m: 0.5,
        fontSize: 14,
        fontWeight: "bold",
        bgcolor: "#fffbe6",
      }}
    >
      {card.value}
      {card.suit}
    </Paper>
  </motion.div>
);

const PlayerHand = ({ player, index, isActive, onPlayCard, trickLeadSuit }) => (
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

export default function RungCardGame() {
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playedCards, setPlayedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [trickWinner, setTrickWinner] = useState(null);
  const [teamScores, setTeamScores] = useState([0, 0]);
  const [trickLeadSuit, setTrickLeadSuit] = useState(null);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [trumpChosen, setTrumpChosen] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const WINNING_TRICKS = 13;

  const startGame = () => {
    const deck = generateDeck();
    const dealt = dealCards(deck, 8);
    setPlayers(dealt);
    setCurrentTurn(0);
    setPlayedCards([]);
    setGameStarted(true);
    setTrickWinner(null);
    setTeamScores([0, 0]);
    setTrickLeadSuit(null);
    setTrumpSuit(null);
    setTrumpChosen(false);
    setGameOver(false);
  };

  const chooseTrump = (suit) => {
    setTrumpSuit(suit);
    setTrumpChosen(true);
  };

  const onPlayCard = (playerIndex, cardIndex) => {
    if (playerIndex !== currentTurn || !trumpChosen || gameOver) return;

    const newPlayers = [...players];
    const playedCard = newPlayers[playerIndex].splice(cardIndex, 1)[0];
    const newPlayedCards = [...playedCards, { playerIndex, card: playedCard }];

    if (newPlayedCards.length === 1) {
      setTrickLeadSuit(playedCard.suit);
    }

    setPlayers(newPlayers);
    setPlayedCards(newPlayedCards);

    if (newPlayedCards.length < 8) {
      setCurrentTurn((prev) => (prev + 1) % 8);
    } else {
      const trumps = newPlayedCards.filter((pc) => pc.card.suit === trumpSuit);
      const validCards =
        trumps.length > 0
          ? trumps
          : newPlayedCards.filter((pc) => pc.card.suit === trickLeadSuit);
      const winningCard = validCards.reduce((prev, curr) =>
        getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev
      );

      const winnerIndex = winningCard.playerIndex;
      const teamIndex = winnerIndex % 2;
      const updatedTeamScores = [...teamScores];
      updatedTeamScores[teamIndex] += 1;

      const isGameOver =
        updatedTeamScores[0] >= WINNING_TRICKS ||
        updatedTeamScores[1] >= WINNING_TRICKS;

      setTeamScores(updatedTeamScores);
      setTrickWinner(winnerIndex);
      setGameOver(isGameOver);

      setTimeout(() => {
        setPlayedCards([]);
        setTrickLeadSuit(null);
        setCurrentTurn(winnerIndex);
        setTrickWinner(null);
      }, 2000);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        8-Player Rung Card Game (2 Teams)
      </Typography>

      {!gameStarted ? (
        <Button variant="contained" onClick={startGame}>
          Deal Cards
        </Button>
      ) : !trumpChosen ? (
        <Dialog open={!trumpChosen}>
          <DialogTitle>Choose Trump Suit (Player 1)</DialogTitle>
          <DialogContent>
            <Box display="flex" gap={2} p={1}>
              {suits.map((suit) => (
                <Button
                  key={suit}
                  variant="contained"
                  color="success"
                  onClick={() => chooseTrump(suit)}
                >
                  {suit}
                </Button>
              ))}
            </Box>
          </DialogContent>
        </Dialog>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            Current Turn: Player {currentTurn + 1}
          </Typography>

          {trickWinner !== null && (
            <Typography color="success.main" sx={{ fontWeight: "bold", mb: 1 }}>
              Player {trickWinner + 1} wins the trick!
            </Typography>
          )}

          {gameOver && (
            <Typography
              color="error.main"
              sx={{ fontWeight: "bold", fontSize: 20, mb: 2 }}
            >
              Game Over! {teamScores[0] > teamScores[1] ? "Team A" : "Team B"}{" "}
              wins!
            </Typography>
          )}

          <Grid container spacing={2}>
            {players.map((player, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <PlayerHand
                  player={player}
                  index={index}
                  isActive={
                    index === currentTurn && trickWinner === null && !gameOver
                  }
                  onPlayCard={onPlayCard}
                  trickLeadSuit={trickLeadSuit}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={4}>
            <Typography variant="h6">Played Cards:</Typography>
            <Box display="flex" flexWrap="wrap" mt={1}>
              {playedCards.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 1, m: 1 }}>
                    Player {entry.playerIndex + 1}: {entry.card.value}
                    {entry.card.suit}
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>

          <Box mt={4}>
            <Typography variant="h6">Team Scores:</Typography>
            <ul>
              <li>Team A (Players 1, 3, 5, 7): {teamScores[0]} trick(s)</li>
              <li>Team B (Players 2, 4, 6, 8): {teamScores[1]} trick(s)</li>
            </ul>
            {trumpSuit && (
              <Typography mt={1}>Trump Suit: {trumpSuit}</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
