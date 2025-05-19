export const suits = ["♠", "♥", "♦", "♣"];
export const values = [
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

export const getCardValue = (card) => values.indexOf(card.value);

export const generateDeck = (playersCount) => {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return shuffle(playersCount === 8 ? [...deck, ...deck] : deck);
};

const shuffle = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck, playersCount) => {
  const players = Array.from({ length: playersCount }, () => []);
  const cardsPerPlayer = Math.floor(deck.length / playersCount);
  for (let i = 0; i < cardsPerPlayer * playersCount; i++) {
    players[i % playersCount].push(deck[i]);
  }
  return players;
};
