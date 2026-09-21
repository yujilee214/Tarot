import { cardMeanings, type CardMeaning } from "./cardMeanings";

export interface DeckTheme {
  /** accent used for borders, badges, progress highlights */
  accent: string;
  /** soft background wash behind deck-related UI chrome */
  soft: string;
}

export interface TarotCard extends CardMeaning {
  /** deck-specific illustration for this card's meaning */
  image: string;
}

export interface TarotDeck {
  id: string;
  name: string;
  englishName: string;
  description: string;
  mood: string[];
  thumbnail: string;
  cardBackImage: string;
  theme: DeckTheme;
  cards: TarotCard[];
}

function buildDeckCards(deckId: string): TarotCard[] {
  return cardMeanings.map((meaning) => ({
    ...meaning,
    image: `/cards/${deckId}/${meaning.id}.svg`,
  }));
}

export const tarotDecks: TarotDeck[] = [
  {
    id: "garden",
    name: "포근한 정원",
    englishName: "Cozy Garden",
    description: "작은 마법사와 식물들이 등장하는 따뜻한 세계",
    mood: ["따뜻함", "귀여움", "편안함"],
    thumbnail: "/cards/garden/00-fool.svg",
    cardBackImage: "/cards/garden/back.svg",
    theme: { accent: "#F1A0BE", soft: "#2A2027" },
    cards: buildDeckCards("garden"),
  },
  {
    id: "night",
    name: "한밤의 별",
    englishName: "Midnight Stars",
    description: "달, 별, 구름, 작은 동물들이 등장하는 밤의 세계",
    mood: ["몽환적", "조용함", "신비로움"],
    thumbnail: "/cards/night/15-moon.svg",
    cardBackImage: "/cards/night/back.svg",
    theme: { accent: "#8C8CD9", soft: "#211F33" },
    cards: buildDeckCards("night"),
  },
  {
    id: "shop",
    name: "작은 마법 상점",
    englishName: "Little Magic Shop",
    description: "포션, 열쇠, 촛불, 책, 수정구가 등장하는 아기자기한 세계",
    mood: ["아기자기함", "마법", "호기심"],
    thumbnail: "/cards/shop/01-magician.svg",
    cardBackImage: "/cards/shop/back.svg",
    theme: { accent: "#B78CE0", soft: "#251E2C" },
    cards: buildDeckCards("shop"),
  },
];

export function getDeckById(id: string | null | undefined): TarotDeck | undefined {
  return tarotDecks.find((deck) => deck.id === id);
}

export function getCardInDeck(deck: TarotDeck, cardId: string): TarotCard | undefined {
  return deck.cards.find((card) => card.id === cardId);
}
