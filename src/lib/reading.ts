import type { TarotCard } from "@/data/cardCatalog";
import type { ReadingContext } from "./readingContext";

export interface ReadingCardSection {
  order: number;
  roleTitle: string;
  card: TarotCard;
  orientation: "upright" | "reversed";
  body: string;
}

export interface ReadingResult {
  summary: string;
  cardSections: ReadingCardSection[];
  combination: string;
  closingAdvice: string;
}

/**
 * Composes a test reading purely from stored card data (no AI call yet —
 * see product spec section 26). It's built directly on top of
 * `ReadingContext` so swapping this out for a real AI call later only
 * means sending that same context to a model instead of these templates.
 */
export function buildReading(context: ReadingContext): ReadingResult {
  const { question, cards } = context;
  const first = cards[0];
  const last = cards[cards.length - 1];

  const cardSections: ReadingCardSection[] = cards.map((c) => ({
    order: c.order,
    roleTitle: c.roleTitle,
    card: c.card,
    orientation: c.orientation,
    body: c.categoryMeaning,
  }));

  const summary = first && last
    ? `"${question}"라는 물음에 카드들이 조용히 답을 건네요. ${first.card.koreanName} 카드로 시작된 흐름은 ${last.card.koreanName} 카드로 이어지며 하나의 이야기를 완성해요.`
    : `"${question}"라는 물음에 카드가 조용히 답을 건네요.`;

  const majorCount = cards.filter((c) => c.card.arcanaType === "major").length;
  const minorCount = cards.length - majorCount;
  const arcanaLine =
    majorCount === cards.length
      ? "메이저 카드가 연이어 나온 만큼, 지금은 크고 뚜렷한 흐름이 상황 전체를 움직이고 있어요."
      : majorCount === 0
        ? "마이너 카드로만 이루어진 만큼, 지금은 일상 속 구체적인 결정과 태도가 흐름을 만들고 있어요."
        : `메이저 카드 ${majorCount}장과 마이너 카드 ${minorCount}장이 함께 나온 만큼, 큰 흐름과 일상의 구체적인 상황이 동시에 작용하고 있어요.`;

  const keywordPool = Array.from(new Set(cards.flatMap((c) => c.card.keywords))).slice(0, 6);
  const keywordLine =
    keywordPool.length > 0
      ? `이번 카드들이 함께 그리는 키워드는 ${keywordPool.join(", ")}이에요.`
      : "";

  const middleLine =
    cards.length > 2
      ? cards
          .slice(1, -1)
          .map(
            (c) =>
              `${c.card.koreanName} 카드는 ${c.previousCard?.koreanName ?? "앞 카드"}에서 이어진 흐름을 ${
                c.nextCard?.koreanName ?? "다음 카드"
              } 쪽으로 자연스럽게 연결해줘요.`
          )
          .join(" ")
      : "";

  const combination = [arcanaLine, keywordLine, middleLine].filter(Boolean).join(" ");

  const closingAdvice = last
    ? `${last.card.advice} 오늘 카드가 건넨 이야기를 마음에 천천히 담아가 보세요.`
    : "오늘 카드가 건넨 이야기를 마음에 천천히 담아가 보세요.";

  return { summary, cardSections, combination, closingAdvice };
}
