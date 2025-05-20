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
    if (trickWinner !== null) {
      setShowTrickDialog(true);

      setTimeout(() => {
        setShowTrickDialog(false);
        setPlayedCards([]);
        setCurrentTurn(trickWinner);

        const currentCard = playedCards.find(
          (pc) => pc.playerIndex === trickWinner
        )?.card;

        if (gameRule === "single") {
          const teamIndex = trickWinner % 2;
          const updatedScores = [...scores];
          updatedScores[teamIndex] += 1;
          setScores(updatedScores);
          setPreviousTrickWinner(null);
          setPreviousTrickCard(null);
          setControlPlayer(null);
          setNoScoreTrickCount(0);
        } else if (gameRule === "double" || gameRule === "double-ace") {
          let scoreOccurred = false;

          if (controlPlayer === null) {
            if (previousTrickWinner === trickWinner) {
              if (
                gameRule === "double-ace" &&
                isAce(previousTrickCard) &&
                isAce(currentCard)
              ) {
                console.log("Double Ace trick invalid – control not gained.");
              } else {
                setControlPlayer(trickWinner);
                const teamIndex = trickWinner % 2;
                const updatedScores = [...scores];
                updatedScores[teamIndex] += 2;
                setScores(updatedScores);
                scoreOccurred = true;
              }
            }
          } else {
            if (trickWinner === controlPlayer) {
              const teamIndex = trickWinner % 2;
              const updatedScores = [...scores];
              updatedScores[teamIndex] += 1;
              setScores(updatedScores);
              scoreOccurred = true;
            } else {
              setControlPlayer(null);
            }
          }

          if (scoreOccurred) {
            setNoScoreTrickCount(0);
          } else {
            const updatedCount = noScoreTrickCount + 1;
            setNoScoreTrickCount(updatedCount);

            if (updatedCount >= 6) {
              const teamIndex = trickWinner % 2;
              const updatedScores = [...scores];
              updatedScores[teamIndex] += updatedCount + 1;
              setScores(updatedScores);
              setNoScoreTrickCount(0);
            }
          }

          setPreviousTrickWinner(trickWinner);
          setPreviousTrickCard(currentCard);
        }

        setTrickWinner(null);
      }, 2000);
    }
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
      const filtered = newPlayedCards.filter((pc) => pc.card.suit === leadSuit);
      const winner = filtered.reduce((best, pc) => {
        return getCardValue(pc.card) > getCardValue(best.card) ? pc : best;
      });

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
