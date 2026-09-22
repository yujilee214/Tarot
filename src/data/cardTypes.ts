export type ArcanaType = "major" | "minor";

export type Suit = "wands" | "cups" | "swords" | "pentacles";

export type Rank =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "page"
  | "knight"
  | "queen"
  | "king";

export type Orientation = "upright" | "reversed";

/**
 * A single tarot card's full meaning data. Kept separate from any screen
 * component — pages only ever read from this shape, never hardcode card
 * text. `reversedMeaning` is stored for every card so the `orientation`
 * feature can be turned on later without touching this data again; the
 * prototype only ever draws cards `upright`.
 */
export interface TarotCard {
  id: string;
  number: number;
  name: string;
  koreanName: string;
  arcanaType: ArcanaType;
  suit: Suit | null;
  rank: Rank | null;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  loveMeaning: string;
  reunionMeaning: string;
  relationshipMeaning: string;
  careerMeaning: string;
  moneyMeaning: string;
  advice: string;
  image: string;
}
