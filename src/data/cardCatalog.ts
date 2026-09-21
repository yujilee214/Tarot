import type { TarotCard } from "./cardTypes";
import { majorArcana } from "./majorArcana";
import { minorArcana } from "./minorArcana";

export type { TarotCard } from "./cardTypes";
export type { ArcanaType, Suit, Rank, Orientation } from "./cardTypes";

/**
 * The single, unified 78-card deck. There is no deck picker in this app —
 * every reading draws from this one pool, shuffled as a whole (see
 * section 7 of the product spec: a reading can surprise you with three
 * Major cards in a row, or one of each suit — nothing is forced).
 */
export const tarotCards: TarotCard[] = [...majorArcana, ...minorArcana];

export const CARD_BACK_IMAGE = "/cards/main/back.svg";

export function getCardById(id: string): TarotCard | undefined {
  return tarotCards.find((card) => card.id === id);
}
