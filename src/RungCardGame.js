import React, { useState } from "react";

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

const Card = ({ card }) => (
  <div className="w-10 h-14 border rounded bg-white text-center text-sm flex items-center justify-center m-1">
    {card.value}
    {card.suit}
  </div>
);

const PlayerHand = ({ player, index, isActive, onPlayCard, trickLeadSuit }) => (
  <div className="border p-2 m-2">
    <h2 className={isActive ? "font-bold text-blue-600" : ""}>
      Player {index + 1} {isActive ? "(Your Turn)" : ""}
    </h2>
    <div className="flex flex-wrap">
      {player.map((card, i) => {
        const mustFollowSuit =
          trickLeadSuit && player.some((c) => c.suit === trickLeadSuit);
        const canPlay = !isActive
          ? false
          : !mustFollowSuit || card.suit === trickLeadSuit;
        return (
          <button
            key={i}
            className="w-10 h-14 border rounded bg-white text-center text-sm flex items-center justify-center m-1 disabled:opacity-30"
            disabled={!canPlay}
            onClick={() => onPlayCard(index, i)}
          >
            {card.value}
            {card.suit}
          </button>
        );
      })}
    </div>
  </div>
);

const getCardValue = (card) => values.indexOf(card.value);

export default function RungCardGame() {
  const [players, setPlayers] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playedCards, setPlayedCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [trickWinner, setTrickWinner] = useState(null);
  const [teamScores, setTeamScores] = useState(Array(2).fill(0));
  const [trickLeadSuit, setTrickLeadSuit] = useState(null);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [trumpChosen, setTrumpChosen] = useState(false);

  const startGame = () => {
    const deck = generateDeck();
    const dealt = dealCards(deck, 8);
    setPlayers(dealt);
    setCurrentTurn(0);
    setPlayedCards([]);
    setGameStarted(true);
    setTrickWinner(null);
    setTeamScores(Array(2).fill(0));
    setTrickLeadSuit(null);
    setTrumpSuit(null);
    setTrumpChosen(false);
  };

  const chooseTrump = (suit) => {
    setTrumpSuit(suit);
    setTrumpChosen(true);
  };

  const onPlayCard = (playerIndex, cardIndex) => {
    if (playerIndex !== currentTurn || !trumpChosen) return;

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
      const winningCard = validCards.reduce((prev, curr) => {
        return getCardValue(curr.card) > getCardValue(prev.card) ? curr : prev;
      });

      const winnerIndex = winningCard.playerIndex;
      const teamIndex = winnerIndex % 2;
      const updatedTeamScores = [...teamScores];
      updatedTeamScores[teamIndex] += 1;

      setTeamScores(updatedTeamScores);
      setTrickWinner(winnerIndex);

      setTimeout(() => {
        setPlayedCards([]);
        setTrickLeadSuit(null);
        setCurrentTurn(winnerIndex);
        setTrickWinner(null);
      }, 2000);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">8-Player Rung Card Game (2 Teams)</h1>
      {!gameStarted ? (
        <button
          onClick={startGame}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Deal Cards
        </button>
      ) : !trumpChosen ? (
        <div className="mb-4">
          <h2 className="text-lg mb-2">Choose Trump Suit (Player 1):</h2>
          <div className="flex space-x-2">
            {suits.map((suit) => (
              <button
                key={suit}
                onClick={() => chooseTrump(suit)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                {suit}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mb-2">
            Current Turn: Player {currentTurn + 1}
          </h2>
          {trickWinner !== null && (
            <div className="text-green-600 font-semibold mb-2">
              Player {trickWinner + 1} wins the trick!
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {players.map((player, index) => (
              <PlayerHand
                key={index}
                player={player}
                index={index}
                isActive={index === currentTurn && trickWinner === null}
                onPlayCard={onPlayCard}
                trickLeadSuit={trickLeadSuit}
              />
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-lg">Played Cards:</h3>
            <div className="flex flex-wrap">
              {playedCards.map((entry, i) => (
                <div
                  key={i}
                  className="border p-2 m-1 bg-gray-100 rounded text-sm"
                >
                  Player {entry.playerIndex + 1}: {entry.card.value}
                  {entry.card.suit}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg">Team Scores:</h3>
            <ul className="list-disc ml-6">
              <li>Team A (Players 1, 3, 5, 7): {teamScores[0]} trick(s)</li>
              <li>Team B (Players 2, 4, 6, 8): {teamScores[1]} trick(s)</li>
            </ul>
            {trumpSuit && <p className="mt-2">Trump Suit: {trumpSuit}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
