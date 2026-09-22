import type { TarotCard } from "@/data/cardCatalog";
import { shuffle } from "./shuffle";

/**
 * Card *selection* logic lives here, separate from card *interpretation*
 * logic (see src/lib/reading.ts) — the product spec calls these out as
 * two different concerns that shouldn't mix.
 */

export function buildShuffledPool(allCards: TarotCard[]): TarotCard[] {
  return shuffle(allCards);
}
