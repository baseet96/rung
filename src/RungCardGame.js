import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import GameSetup from "./components/GameSetup";
import PlayerHand from "./components/PlayerHand";
import TrumpSelectionDialog from "./components/TrumpSelectionDialog";
import TrickDisplay from "./components/TrickDisplay";
import {
  generateDeck,
  dealCards,
  getCardValue,
  isAce,
} from "./helpers/cardUtils";
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
  const [scores, setScores] = useState([0, 0]);
  const [previousTrickWinner, setPreviousTrickWinner] = useState(null);
  const [previousTrickCard, setPreviousTrickCard] = useState(null);
  const [controlPlayer, setControlPlayer] = useState(null);
  const [noScoreTrickCount, setNoScoreTrickCount] = useState(0);

  const startGame = () => {
    const deck = generateDeck(playersCount);
    const dealtPlayers = dealCards(deck, playersCount);
    setPlayers(dealtPlayers);
    setTrumpSuit(null);
    setCurrentTurn(0);
    setPlayedCards([]);
    setTrickWinner(null);
    setShowTrickDialog(false);
    setScores([0, 0]);
    setPreviousTrickWinner(null);
    setPreviousTrickCard(null);
    setControlPlayer(null);
    setNoScoreTrickCount(0);
  };

  useEffect(() => {
    if (trickWinner === null) return;

    setShowTrickDialog(true);

    const currentCard = playedCards.find(
      (pc) => pc.playerIndex === trickWinner
    )?.card;

    setTimeout(() => {
      setShowTrickDialog(false);
      setPlayedCards([]);
      setCurrentTurn(trickWinner);

      if (gameRule === "single") {
        // Simple: add 1 point to the winning player's team
        const teamIndex = trickWinner % 2;
        setScores((prevScores) => {
          const newScores = [...prevScores];
          newScores[teamIndex] += 1;
          return newScores;
        });

        // Reset control states
        setPreviousTrickWinner(null);
        setPreviousTrickCard(null);
        setControlPlayer(null);
        setNoScoreTrickCount(0);
      } else if (gameRule === "double" || gameRule === "double-ace") {
        // Complex scoring logic:
        setScores((prevScores) => {
          let newScores = [...prevScores];
          let newControlPlayer = controlPlayer;
          let newPreviousTrickWinner = previousTrickWinner;
          let newPreviousTrickCard = previousTrickCard;
          let newNoScoreTrickCount = noScoreTrickCount;

          let scoreOccurred = false;

          if (newControlPlayer === null) {
            if (newPreviousTrickWinner === trickWinner) {
              // Same player/team won last and current trick

              if (
                gameRule === "double-ace" &&
                isAce(newPreviousTrickCard) &&
                isAce(currentCard)
              ) {
                // Double Ace invalid control
                // No score changes, just reset control states
                scoreOccurred = false;
              } else {
                // Control gained: add noScoreTrickCount + 2 points
                newControlPlayer = trickWinner;
                const teamIndex = trickWinner % 2;
                newScores[teamIndex] += newNoScoreTrickCount + 2;
                newNoScoreTrickCount = 0;
                scoreOccurred = true;
              }
            } else {
              // Different winner from last trick - no control gained yet
              newPreviousTrickWinner = trickWinner;
              newPreviousTrickCard = currentCard;

              // Increase noScoreTrickCount only if previous winner was set and different
              if (
                previousTrickWinner !== null &&
                previousTrickWinner !== trickWinner
              ) {
                newNoScoreTrickCount += 1;
              }
            }
          } else {
            // controlPlayer !== null

            if (trickWinner === newControlPlayer) {
              // Control player won again, +1 point
              const teamIndex = trickWinner % 2;
              newScores[teamIndex] += 1;
              newNoScoreTrickCount = 0;
              scoreOccurred = true;
            } else {
              // Control lost, reset control player and increase noScoreTrickCount
              newControlPlayer = null;
              newNoScoreTrickCount += 1;
            }

            newPreviousTrickWinner = trickWinner;
            newPreviousTrickCard = currentCard;
          }

          if (!scoreOccurred) {
            // If no score happened this trick, check if noScoreTrickCount hits 6 or more
            if (newNoScoreTrickCount >= 6) {
              // Award points and reset states
              const teamIndex = trickWinner % 2;
              newScores[teamIndex] += newNoScoreTrickCount + 1;
              newNoScoreTrickCount = 0;
              newPreviousTrickWinner = null;
              newPreviousTrickCard = null;
              newControlPlayer = null;
            }
          } else {
            // If score occurred, reset previous trick info and noScoreTrickCount
            newPreviousTrickWinner = null;
            newPreviousTrickCard = null;
            newControlPlayer = null;
            newNoScoreTrickCount = 0;
          }

          // Apply all updated states
          setControlPlayer(newControlPlayer);
          setPreviousTrickWinner(newPreviousTrickWinner);
          setPreviousTrickCard(newPreviousTrickCard);
          setNoScoreTrickCount(newNoScoreTrickCount);

          return newScores;
        });
      }

      setTrickWinner(null);
    }, 2000);
  }, [trickWinner]);

  const handlePlayCard = (playerIndex, cardIndex) => {
    if (playerIndex !== currentTurn) return;
    const updatedPlayers = [...players];
    const card = updatedPlayers[playerIndex].splice(cardIndex, 1)[0];
    const newPlayedCards = [...playedCards, { playerIndex, card }];

    setPlayers(updatedPlayers);
    setPlayedCards(newPlayedCards);

    if (newPlayedCards.length === playersCount) {
      const leadSuit = newPlayedCards[0].card.suit;
      let trumpCards = newPlayedCards.filter(
        (pc) => pc.card.suit === trumpSuit
      );
      let winner;

      if (trumpCards.length > 0) {
        winner = trumpCards.reduce((best, pc) =>
          getCardValue(pc.card) > getCardValue(best.card) ? pc : best
        );
      } else {
        const sameSuitCards = newPlayedCards.filter(
          (pc) => pc.card.suit === leadSuit
        );
        winner = sameSuitCards.reduce((best, pc) =>
          getCardValue(pc.card) > getCardValue(best.card) ? pc : best
        );
      }

      setTrickWinner(winner.playerIndex);
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
        <Box mb={2}>
          <Typography variant="h6">Trump Suit: {trumpSuit}</Typography>
          <Typography variant="h6">
            Scores - Team 1: {scores[0]} | Team 2: {scores[1]}
          </Typography>
        </Box>
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
