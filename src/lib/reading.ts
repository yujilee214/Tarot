import type { TarotCard } from "@/data/cardCatalog";
import { getCategoryReadingCopy } from "@/data/categoryReadingCopy";
import type { ReadingContext } from "./readingContext";

export interface ReadingCardSection {
  order: number;
  roleTitle: string;
  card: TarotCard;
  orientation: "upright" | "reversed";
  body: string;
}

export interface DirectAnswer {
  title: string;
  body: string;
}

/**
 * Mirrors product spec section 35's `ReadingResult` shape exactly, so this
 * stays the single seam a future AI call would replace — everything below
 * this type is template text built from `ReadingContext` (see product spec
 * section 36 for what a real model call would receive instead).
 */
export interface ReadingResult {
  summary: string;
  cards: ReadingCardSection[];
  combinedReading: string;
  directAnswer: DirectAnswer;
  actionAdvice: string[];
  closingMessage: string;
}

export function buildReading(context: ReadingContext): ReadingResult {
  const { question, questionCategory, cards } = context;
  const first = cards[0];
  const last = cards[cards.length - 1];
  const copy = getCategoryReadingCopy(questionCategory);

  const cardSections: ReadingCardSection[] = cards.map((c) => ({
    order: c.order,
    roleTitle: c.roleTitle,
    card: c.card,
    orientation: c.orientation,
    body: c.categoryMeaning,
  }));

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

  const summary = [
    `"${question}"라는 물음에 카드들이 조용히 답을 건네요.`,
    arcanaLine,
    keywordLine,
    first && last
      ? `${first.card.koreanName} 카드로 시작된 흐름은 ${last.card.koreanName} 카드로 이어지며 하나의 방향을 그려가고 있어요.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const combinedReading = buildCombinedReading(cards);

  const directAnswer: DirectAnswer = {
    title: copy.directAnswerTitle,
    body: buildDirectAnswerBody({ first, last, cards, question }),
  };

  const actionAdvice = buildActionAdvice({ last, copy });

  const closingMessage = last
    ? `${last.card.koreanName} 카드가 건넨 "${last.card.keywords[0] ?? last.card.advice}"라는 이야기를 오늘 하루 마음에 천천히 담아가 보세요.`
    : "오늘 카드가 건넨 이야기를 마음에 천천히 담아가 보세요.";

  return {
    summary,
    cards: cardSections,
    combinedReading,
    directAnswer,
    actionAdvice,
    closingMessage,
  };
}

/**
 * Product spec section 27: connect card 1 → card 2 → card 3 as one story
 * (where the situation starts, what it moves through, what it resolves
 * into) rather than restating each card's standalone meaning.
 */
function buildCombinedReading(cards: ReadingContext["cards"]): string {
  if (cards.length === 0) return "";
  if (cards.length === 1) {
    return `${cards[0].card.koreanName} 카드 한 장이 지금 상황 전체를 압축해서 보여주고 있어요.`;
  }

  const first = cards[0];
  const last = cards[cards.length - 1];
  const middleCards = cards.slice(1, -1);

  const openingLine = `지금 상황은 ${first.card.koreanName} 카드에서 출발해요.`;

  const middleLine = middleCards
    .map(
      (c) =>
        `그 흐름은 ${c.card.koreanName} 카드를 지나며 ${c.categoryMeaning}`
    )
    .join(" ");

  const closingLine = `그리고 ${last.card.koreanName} 카드에 다다르며, 지금 상황이 어떤 조언으로 이어지는지를 보여줘요.`;

  return [openingLine, middleLine, closingLine].filter(Boolean).join(" ");
}

function buildDirectAnswerBody(params: {
  first: ReadingContext["cards"][number] | undefined;
  last: ReadingContext["cards"][number] | undefined;
  cards: ReadingContext["cards"];
  question: string;
}): string {
  const { first, last, cards } = params;
  if (!first || !last) {
    return "지금은 뚜렷한 카드가 없어 흐름을 읽기 어려워요. 질문을 조금 더 구체적으로 적어보면 도움이 될 수 있어요.";
  }

  const middle = cards.length > 2 ? cards[1] : undefined;

  const sentences = [
    `지금 상황은 ${first.card.koreanName} 카드가 보여주듯 ${first.categoryMeaning}`,
    middle
      ? `그 흐름은 ${middle.card.koreanName} 카드처럼 ${middle.categoryMeaning}`
      : "",
    `${last.card.koreanName} 카드는 ${last.categoryMeaning}`,
    "다만 이건 지금 카드에서 읽히는 흐름과 가능성일 뿐, 실제 결과를 미리 확정하는 것은 아니에요.",
    "이 흐름을 참고 삼아 스스로 다음 걸음을 천천히 정해가 보세요.",
  ].filter(Boolean);

  return sentences.join(" ");
}

function buildActionAdvice(params: {
  last: ReadingContext["cards"][number] | undefined;
  copy: ReturnType<typeof getCategoryReadingCopy>;
}): string[] {
  const { last, copy } = params;
  if (!last) return [];

  return [
    `${copy.actionFocus} 면에서는, ${last.card.advice}`,
    `${last.card.koreanName} 카드가 건넨 "${last.card.keywords[0] ?? ""}"라는 키워드를 오늘 하루 한 번쯤 떠올려보세요.`,
    "결과를 서두르기보다, 지금 할 수 있는 작은 행동부터 하나씩 시작해보는 편이 좋아요.",
  ];
}
