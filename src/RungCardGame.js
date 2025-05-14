import React, { useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Box,
  Grid,
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

const generateDeck = (playersCount) => {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }

  if (playersCount === 8) {
    return shuffle([...deck, ...deck]); // Double deck for 8 players
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

const Card = ({ card }) => {
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
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
          color: isRed ? "red" : "black",
        }}
      >
        {card.value}
        {card.suit}
      </Paper>
    </motion.div>
  );
};

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
  const [playersCount, setPlayersCount] = useState(4);
  const [player1Cards, setPlayer1Cards] = useState([]);
  const [showPlayer1Cards, setShowPlayer1Cards] = useState(false);
  const [trickCount, setTrickCount] = useState(0);
  const WINNING_TRICKS = 13;

  const startGame = () => {
    const deck = generateDeck(playersCount);
    const dealt = dealCards(deck, playersCount);
    setPlayers(dealt);
    setPlayer1Cards(dealt[0].slice(0, 5));
    setCurrentTurn(0);
    setPlayedCards([]);
    setGameStarted(true);
    setTrickWinner(null);
    setTeamScores([0, 0]);
    setTrickLeadSuit(null);
    setTrumpSuit(null);
    setTrumpChosen(false);
    setGameOver(false);
    setShowPlayer1Cards(true);
    setTrickCount(0);
  };

  const chooseTrump = (suit) => {
    setTrumpSuit(suit);
    setTrumpChosen(true);
    setShowPlayer1Cards(false);
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

    if (newPlayedCards.length < playersCount) {
      setCurrentTurn((prev) => (prev + 1) % playersCount);
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
      const updatedTrickCount = trickCount + 1;

      if (updatedTrickCount >= 3) {
        updatedTeamScores[teamIndex] += 1;
      }

      const isGameOver =
        updatedTeamScores[0] >= WINNING_TRICKS ||
        updatedTeamScores[1] >= WINNING_TRICKS;

      setTeamScores(updatedTeamScores);
      setTrickWinner(winnerIndex);
      setGameOver(isGameOver);
      setTrickCount(updatedTrickCount);

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
      <Typography variant="h3" align="center" gutterBottom fontWeight={600}>
        Rung Card Game
      </Typography>

      {!gameStarted ? (
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
          <Button variant="contained" size="large" onClick={startGame}>
            Deal Cards
          </Button>
        </Box>
      ) : !trumpChosen ? (
        <Dialog open={!trumpChosen}>
          <DialogTitle>Player 1: Choose Trump Suit</DialogTitle>
          <DialogContent>
            {showPlayer1Cards && (
              <Box mb={2}>
                <Typography variant="h6">Your Cards (Player 1):</Typography>
                <Box display="flex" gap={1}>
                  {player1Cards.map((card, index) => (
                    <Card key={index} card={card} />
                  ))}
                </Box>
              </Box>
            )}
            <Typography variant="h6">Choose Trump Suit:</Typography>
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
          <Typography variant="h6">Trump Suit: {trumpSuit}</Typography>
          <Typography variant="h6" color="secondary">
            Team 1 Score: {teamScores[0]} | Team 2 Score: {teamScores[1]}
          </Typography>

          {players.map((player, index) => (
            <PlayerHand
              key={index}
              player={player}
              index={index}
              isActive={index === currentTurn}
              onPlayCard={onPlayCard}
              trickLeadSuit={trickLeadSuit}
            />
          ))}

          {playedCards.length > 0 && (
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
              {trickWinner !== null && (
                <Typography variant="h6" color="primary">
                  Trick won by Player {trickWinner + 1}
                </Typography>
              )}
            </Paper>
          )}

          {gameOver && (
            <Typography variant="h4" color="primary" mt={3}>
              Game Over! Team {teamScores[0] > teamScores[1] ? 1 : 2} Wins!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
