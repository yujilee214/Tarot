import type { TarotCard } from "@/data/cardCatalog";
import type { SelectedCard } from "@/context/TarotFlowContext";

/**
 * Everything a single card contributes to a reading, in context — not just
 * its name. This is the shape a future AI integration would receive per
 * card instead of a bare card name (see product spec section 24): its role
 * in the spread, its category-specific meaning, and its neighbors, so the
 * relationship between cards can be interpreted rather than each card
 * being described in isolation.
 */
export interface CardReadingContext {
  order: number;
  roleTitle: string;
  roleDescription: string;
  card: TarotCard;
  orientation: SelectedCard["orientation"];
  meaning: string;
  categoryMeaning: string;
  previousCard: TarotCard | null;
  nextCard: TarotCard | null;
}

export interface ReadingContext {
  question: string;
  questionCategory: string | null;
  spreadName: string;
  cards: CardReadingContext[];
}

const CATEGORY_MEANING_FIELD: Partial<Record<string, keyof TarotCard>> = {
  love: "loveMeaning",
  reunion: "loveMeaning",
  relationship: "relationshipMeaning",
  work: "careerMeaning",
  money: "moneyMeaning",
};

export function resolveCategoryMeaning(card: TarotCard, questionCategory: string | null): string {
  const field = questionCategory ? CATEGORY_MEANING_FIELD[questionCategory] : undefined;
  const value = field ? card[field] : undefined;
  return typeof value === "string" && value.length > 0 ? value : card.uprightMeaning;
}

export function buildReadingContext(params: {
  question: string;
  questionCategory: string | null;
  spreadName: string;
  selectedCards: SelectedCard[];
  getCard: (id: string) => TarotCard | undefined;
}): ReadingContext {
  const { question, questionCategory, spreadName, selectedCards, getCard } = params;

  const resolved = selectedCards
    .map((selected) => {
      const card = getCard(selected.cardId);
      return card ? { selected, card } : null;
    })
    .filter((entry): entry is { selected: SelectedCard; card: TarotCard } => entry !== null);

  const cards: CardReadingContext[] = resolved.map(({ selected, card }, index) => ({
    order: selected.order,
    roleTitle: selected.position.title,
    roleDescription: selected.position.description,
    card,
    orientation: selected.orientation,
    meaning: selected.orientation === "reversed" ? card.reversedMeaning : card.uprightMeaning,
    categoryMeaning: resolveCategoryMeaning(card, questionCategory),
    previousCard: index > 0 ? resolved[index - 1].card : null,
    nextCard: index < resolved.length - 1 ? resolved[index + 1].card : null,
  }));

  return { question, questionCategory, spreadName, cards };
}
