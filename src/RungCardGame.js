import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import GameSetup from "./components/GameSetup";
import PlayerHand from "./components/PlayerHand";
import TrumpSelectionDialog from "./components/TrumpSelectionDialog";
import TrickDisplay from "./components/TrickDisplay";
import { generateDeck, dealCards, getCardValue } from "./helpers/cardUtils";
import TrickResultDialog from "./components/TrickResultDialog";

const RungCardGame = () => {
  const [playersCount, setPlayersCount] = useState(4);
  const [gameRule, setGameRule] = useState("single");
  const [players, setPlayers] = useState([]);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playedCards, setPlayedCards] = useState([]);
  const [trickWinner, setTrickWinner] = useState(null);
  const [showTrickDialog, setShowTrickDialog] = useState(false);
  const [scores, setScores] = useState([0, 0]); // Team 0 and Team 1

  const startGame = () => {
    const deck = generateDeck(playersCount);
    const dealtPlayers = dealCards(deck, playersCount);
    setPlayers(dealtPlayers);
    setTrumpSuit(null);
    setCurrentTurn(0);
    setPlayedCards([]);
    setTrickWinner(null);
  };

  const handlePlayCard = (playerIndex, cardIndex) => {
    if (playerIndex !== currentTurn) return;
    const updatedPlayers = [...players];
    const card = updatedPlayers[playerIndex].splice(cardIndex, 1)[0];
    const newPlayedCards = [...playedCards, { playerIndex, card }];

    setPlayers(updatedPlayers);
    setPlayedCards(newPlayedCards);

    if (newPlayedCards.length === playersCount) {
      const leadSuit = newPlayedCards[0].card.suit;
      const filtered = newPlayedCards.filter((pc) => pc.card.suit === leadSuit);
      const winner = filtered.reduce((best, pc) => {
        return getCardValue(pc.card) > getCardValue(best.card) ? pc : best;
      });

      const winningTeam = winner.playerIndex % 2; // team 0: players 0 & 2, team 1: players 1 & 3
      setScores((prevScores) => {
        const updated = [...prevScores];
        updated[winningTeam]++;
        return updated;
      });

      setTrickWinner(winner.playerIndex);
      setShowTrickDialog(true);
      setTimeout(() => {
        setPlayedCards([]);
        setTrickWinner(null);
        setShowTrickDialog(false);
        setCurrentTurn(winner.playerIndex);
      }, 2000);
    } else {
      setCurrentTurn((currentTurn + 1) % playersCount);
    }
  };

  const handleSelectTrump = (suit) => {
    setTrumpSuit(suit);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Rung Card Game
      </Typography>

      {trumpSuit && (
        <>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
            mb={2}
          >
            <Typography variant="h6">Trump Suit:</Typography>
            <Box
              px={2}
              py={1}
              bgcolor="#eee"
              borderRadius="8px"
              border="1px solid #ccc"
            >
              <Typography variant="h6" color="textSecondary">
                {trumpSuit.toUpperCase()}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" gap={4} mb={2}>
            <Typography variant="h6" color="primary">
              Team 1 (P0 & P2): {scores[0]}
            </Typography>
            <Typography variant="h6" color="secondary">
              Team 2 (P1 & P3): {scores[1]}
            </Typography>
          </Box>
        </>
      )}

      {players.length === 0 ? (
        <GameSetup
          playersCount={playersCount}
          setPlayersCount={setPlayersCount}
          gameRule={gameRule}
          setGameRule={setGameRule}
          onStart={startGame}
        />
      ) : (
        <>
          {!trumpSuit && (
            <TrumpSelectionDialog
              open={true}
              cards={players[0]?.slice(0, 5)}
              onSelectTrump={handleSelectTrump}
            />
          )}

          {trumpSuit && (
            <>
              {players.map((player, index) => (
                <PlayerHand
                  key={index}
                  player={player}
                  index={index}
                  isActive={currentTurn === index}
                  onPlayCard={handlePlayCard}
                  trickLeadSuit={playedCards[0]?.card.suit}
                />
              ))}

              <TrickDisplay
                playedCards={playedCards}
                trickWinner={trickWinner}
              />
              <TrickResultDialog open={showTrickDialog} winner={trickWinner} />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default RungCardGame;

// import React, { useState } from "react";
// import {
//   Button,
//   Paper,
//   Typography,
//   Box,
//   Grid,
//   Dialog,
//   DialogTitle,
//   DialogContent,
// } from "@mui/material";
// import { motion } from "motion/react";

// const suits = ["♠", "♥", "♦", "♣"];
// const values = [
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "10",
//   "J",
//   "Q",
//   "K",
//   "A",
// ];

// const generateDeck = (playersCount) => {
//   const deck = [];
//   for (let suit of suits) {
//     for (let value of values) {
//       deck.push({ suit, value });
//     }
//   }

//   if (playersCount === 8) {
//     return shuffle([...deck, ...deck]);
//   }

//   return shuffle(deck);
// };

// const shuffle = (deck) => {
//   const shuffled = [...deck];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// };

// const dealCards = (deck, playersCount) => {
//   const players = Array.from({ length: playersCount }, () => []);
//   const cardsPerPlayer = Math.floor(deck.length / playersCount);
//   for (let i = 0; i < cardsPerPlayer * playersCount; i++) {
//     players[i % playersCount].push(deck[i]);
//   }
//   return players;
// };

// const getCardValue = (card) => values.indexOf(card.value);

// const Card = ({ card }) => {
//   const isRed = card.suit === "♥" || card.suit === "♦";

//   return (
//     <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
//       <Paper
//         elevation={3}
//         sx={{
//           width: 40,
//           height: 56,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           m: 0.5,
//           fontSize: 14,
//           fontWeight: "bold",
//           bgcolor: "#fffbe6",
//           color: isRed ? "red" : "black",
//         }}
//       >
//         {card.value}
//         {card.suit}
//       </Paper>
//     </motion.div>
//   );
// };

// const PlayerHand = ({ player, index, isActive, onPlayCard, trickLeadSuit }) => (
//   <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
//     <Typography variant="h6" color={isActive ? "primary" : "textSecondary"}>
//       Player {index + 1} {isActive ? "(Your Turn)" : ""}
//     </Typography>
//     <Box display="flex" flexWrap="wrap">
//       {player.map((card, i) => {
//         const mustFollowSuit =
//           trickLeadSuit && player.some((c) => c.suit === trickLeadSuit);
//         const canPlay =
//           isActive && (!mustFollowSuit || card.suit === trickLeadSuit);
//         return (
//           <Box
//             key={i}
//             onClick={() => canPlay && onPlayCard(index, i)}
//             sx={{
//               opacity: canPlay ? 1 : 0.3,
//               cursor: canPlay ? "pointer" : "not-allowed",
//             }}
//           >
//             <Card card={card} />
//           </Box>
//         );
//       })}
//     </Box>
//   </Paper>
// );

// export default function RungCardGame() {
//   const [players, setPlayers] = useState([]);
//   const [currentTurn, setCurrentTurn] = useState(0);
//   const [playedCards, setPlayedCards] = useState([]);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [trickWinner, setTrickWinner] = useState(null);
//   const [teamScores, setTeamScores] = useState([0, 0]);
//   const [trickLeadSuit, setTrickLeadSuit] = useState(null);
//   const [trumpSuit, setTrumpSuit] = useState(null);
//   const [trumpChosen, setTrumpChosen] = useState(false);
//   const [gameOver, setGameOver] = useState(false);
//   const [playersCount, setPlayersCount] = useState(4);
//   const [player1Cards, setPlayer1Cards] = useState([]);
//   const [showPlayer1Cards, setShowPlayer1Cards] = useState(false);
//   const [trickCount, setTrickCount] = useState(0);
//   const [gameRule, setGameRule] = useState("single");
//   const [trickWinners, setTrickWinners] = useState([]);
//   const [gameWinner, setGameWinner] = useState(null);
//   const WINNING_TRICKS = 13;

//   const startGame = () => {
//     const deck = generateDeck(playersCount);
//     const dealt = dealCards(deck, playersCount);
//     setPlayers(dealt);
//     setPlayer1Cards(dealt[0].slice(0, 5));
//     setCurrentTurn(0);
//     setPlayedCards([]);
//     setGameStarted(true);
//     setTrickWinner(null);
//     setTeamScores([0, 0]);
//     setTrickLeadSuit(null);
//     setTrumpSuit(null);
//     setTrumpChosen(false);
//     setGameOver(false);
//     setShowPlayer1Cards(true);
//     setTrickCount(0);
//     setTrickWinners([]);
//     setGameWinner(null);
//   };

//   const chooseTrump = (suit) => {
//     setTrumpSuit(suit);
//     setTrumpChosen(true);
//     setShowPlayer1Cards(false);
//   };

//   const onPlayCard = (playerIndex, cardIndex) => {
//     if (playerIndex !== currentTurn || !trumpChosen || gameOver) return;

//     const newPlayers = [...players];
//     const playedCard = newPlayers[playerIndex].splice(cardIndex, 1)[0];
//     const newPlayedCards = [...playedCards, { playerIndex, card: playedCard }];

//     if (newPlayedCards.length === 1) {
//       setTrickLeadSuit(playedCard.suit);
//     }

//     setPlayers(newPlayers);
//     setPlayedCards(newPlayedCards);

//     if (newPlayedCards.length < playersCount) {
//       setCurrentTurn((prev) => (prev + 1) % playersCount);
//     } else {
//       const trumps = newPlayedCards.filter((pc) => pc.card.suit === trumpSuit);
//       const validCards =
//         trumps.length > 0
//           ? trumps
//           : newPlayedCards.filter((pc) => pc.card.suit === trickLeadSuit);
//       const winningCard = validCards.reduce((prev, curr) =>
//         getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev
//       );

//       const winnerIndex = winningCard.playerIndex;
//       const teamIndex = winnerIndex % 2;
//       const updatedTrickCount = trickCount + 1;
//       const newTrickWinners = [...trickWinners, teamIndex];
//       const updatedTeamScores = [0, 0];

//       if (gameRule === "single") {
//         for (let i = 2; i < newTrickWinners.length; i++) {
//           updatedTeamScores[newTrickWinners[i]] += 1;
//         }
//       } else if (gameRule === "double" || gameRule === "double-ace") {
//         const playerTrickWinners = newPlayedCards.reduce((acc, curr, idx) => {
//           const trickNum = Math.floor(idx / playersCount);
//           if (!acc[trickNum]) acc[trickNum] = [];
//           acc[trickNum].push(curr);
//           return acc;
//         }, {});

//         let lastWinner = null;
//         let consecutiveCount = 0;
//         let lastPlayer = null;

//         Object.entries(playerTrickWinners).forEach(([trickIndexStr, plays]) => {
//           const trickIndex = parseInt(trickIndexStr);
//           if (trickIndex < 2) return;

//           const trumps = plays.filter((pc) => pc.card.suit === trumpSuit);
//           const validCards =
//             trumps.length > 0
//               ? trumps
//               : plays.filter((pc) => pc.card.suit === trickLeadSuit);
//           const winningPlay = validCards.reduce((prev, curr) =>
//             getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev
//           );

//           if (winningPlay.playerIndex === lastPlayer) {
//             consecutiveCount++;
//             const team = winningPlay.playerIndex % 2;

//             let validPoint = true;
//             if (gameRule === "double-ace") {
//               const acePlayed = plays.some((pc) => pc.card.value === "A");
//               validPoint = acePlayed;
//             }

//             if (validPoint && consecutiveCount === 2) {
//               updatedTeamScores[team] += 1;
//             }
//           } else {
//             consecutiveCount = 1;
//           }

//           lastPlayer = winningPlay.playerIndex;
//         });
//       }

//       const isGameOver =
//         updatedTeamScores[0] >= WINNING_TRICKS ||
//         updatedTeamScores[1] >= WINNING_TRICKS;

//       setTeamScores(updatedTeamScores);
//       setTrickWinner(winnerIndex);
//       setGameOver(isGameOver);
//       setTrickCount(updatedTrickCount);
//       setTrickWinners(newTrickWinners);

//       if (isGameOver) {
//         setGameWinner(updatedTeamScores[0] > updatedTeamScores[1] ? 1 : 2);
//       }

//       setTimeout(() => {
//         setPlayedCards([]);
//         setTrickLeadSuit(null);
//         setCurrentTurn(winnerIndex);
//         setTrickWinner(null);
//       }, 2000);
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h3" align="center" gutterBottom fontWeight={600}>
//         Rung Card Game
//       </Typography>

//       {!gameStarted ? (
//         <Box textAlign="center" mt={5}>
//           <Typography variant="h6" gutterBottom>
//             Select Number of Players:
//           </Typography>
//           <Box mb={2}>
//             <Button
//               variant={playersCount === 4 ? "contained" : "outlined"}
//               onClick={() => setPlayersCount(4)}
//               sx={{ mr: 2, minWidth: 120 }}
//             >
//               4 Players
//             </Button>
//             <Button
//               variant={playersCount === 8 ? "contained" : "outlined"}
//               onClick={() => setPlayersCount(8)}
//               sx={{ minWidth: 120 }}
//             >
//               8 Players
//             </Button>
//           </Box>

//           <Typography variant="h6" gutterBottom>
//             Select Game Rule:
//           </Typography>
//           <Box mb={2}>
//             <Button
//               variant={gameRule === "single" ? "contained" : "outlined"}
//               onClick={() => setGameRule("single")}
//               sx={{ mr: 2, minWidth: 180 }}
//             >
//               Single Sir
//             </Button>
//             <Button
//               variant={gameRule === "double" ? "contained" : "outlined"}
//               onClick={() => setGameRule("double")}
//               sx={{ mr: 2, minWidth: 180 }}
//             >
//               Double Sir
//             </Button>
//             <Button
//               variant={gameRule === "double-ace" ? "contained" : "outlined"}
//               onClick={() => setGameRule("double-ace")}
//               sx={{ minWidth: 180 }}
//             >
//               Double Sir with Ace
//             </Button>
//           </Box>

//           <Box mt={2}>
//             <Button variant="contained" size="large" onClick={startGame}>
//               Deal Cards
//             </Button>
//           </Box>
//         </Box>
//       ) : !trumpChosen ? (
//         <Dialog open={!trumpChosen}>
//           <DialogTitle>Player 1: Choose Trump Suit</DialogTitle>
//           <DialogContent>
//             {showPlayer1Cards && (
//               <Box mb={2}>
//                 <Typography variant="h6">Your Cards (Player 1):</Typography>
//                 <Box display="flex" gap={1}>
//                   {player1Cards.map((card, index) => (
//                     <Card key={index} card={card} />
//                   ))}
//                 </Box>
//               </Box>
//             )}
//             <Typography variant="h6">Choose Trump Suit:</Typography>
//             <Box display="flex" gap={2} p={1}>
//               {suits.map((suit) => (
//                 <Button
//                   key={suit}
//                   variant="contained"
//                   color="success"
//                   onClick={() => chooseTrump(suit)}
//                 >
//                   {suit}
//                 </Button>
//               ))}
//             </Box>
//           </DialogContent>
//         </Dialog>
//       ) : (
//         <Box>
//           <Typography variant="h6">Trump Suit: {trumpSuit}</Typography>
//           <Typography variant="h6" color="secondary">
//             Team 1 Score: {teamScores[0]} | Team 2 Score: {teamScores[1]}
//           </Typography>

//           {players.map((player, index) => (
//             <PlayerHand
//               key={index}
//               player={player}
//               index={index}
//               isActive={index === currentTurn}
//               onPlayCard={onPlayCard}
//               trickLeadSuit={trickLeadSuit}
//             />
//           ))}

//           {playedCards.length > 0 && (
//             <Paper sx={{ p: 2, mt: 2 }} elevation={4}>
//               <Typography variant="h6">Current Trick:</Typography>
//               <Grid container spacing={2}>
//                 {playedCards.map((pc, i) => (
//                   <Grid item key={i}>
//                     <Typography>Player {pc.playerIndex + 1}</Typography>
//                     <Card card={pc.card} />
//                   </Grid>
//                 ))}
//               </Grid>
//               {trickWinner !== null && (
//                 <Typography variant="h6" color="primary">
//                   Trick won by Player {trickWinner + 1}
//                 </Typography>
//               )}
//             </Paper>
//           )}

//           {gameOver && gameWinner && (
//             <Typography variant="h4" color="primary" mt={3}>
//               Game Over! Team {gameWinner} Wins!
//             </Typography>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// }
