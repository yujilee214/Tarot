/**
 * A spread's card roles are data, not UI copy — positions are never
 * hardcoded into a page component. This also keeps the door open for
 * per-category spreads later (a 연애 reading could use different position
 * titles than a 직장 reading) without touching any screen code.
 */
export interface TarotSpreadPosition {
  order: number;
  title: string;
  description: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  cardCount: number;
  positions: TarotSpreadPosition[];
}

export const threeCardSpread: TarotSpread = {
  id: "three-card",
  name: "세 장 리딩",
  cardCount: 3,
  positions: [
    {
      order: 1,
      title: "현재 상황",
      description: "현재 상황을 보여주는\n카드를 골라주세요.",
    },
    {
      order: 2,
      title: "지금 중요한 흐름",
      description: "지금 중요한 흐름을 보여주는\n카드를 골라주세요.",
    },
    {
      order: 3,
      title: "앞으로 필요한 조언",
      description: "앞으로 필요한 조언을 보여주는\n카드를 골라주세요.",
    },
  ],
};

/**
 * Not used by the prototype flow yet (see product spec section 11) — kept
 * here so `selectSpread` below has something real to grow into once
 * question-complexity analysis decides a reading needs more cards.
 */
export const fiveCardSpread: TarotSpread = {
  id: "five-card",
  name: "다섯 장 리딩",
  cardCount: 5,
  positions: [
    { order: 1, title: "현재 상황", description: "현재 상황을 보여주는\n카드를 골라주세요." },
    { order: 2, title: "내가 알고 있는 부분", description: "내가 이미 알고 있는 부분을 보여주는\n카드를 골라주세요." },
    { order: 3, title: "놓치고 있는 부분", description: "놓치고 있는 부분을 보여주는\n카드를 골라주세요." },
    { order: 4, title: "앞으로의 흐름", description: "앞으로의 흐름을 보여주는\n카드를 골라주세요." },
    { order: 5, title: "조언", description: "지금 필요한 조언을 보여주는\n카드를 골라주세요." },
  ],
};

export const oneCardSpread: TarotSpread = {
  id: "one-card",
  name: "한 장 리딩",
  cardCount: 1,
  positions: [
    { order: 1, title: "오늘의 카드", description: "지금 떠오르는 카드를\n한 장 골라주세요." },
  ],
};

/**
 * Decides which spread a reading uses. The product spec (section 5) wants
 * this to eventually read the question's complexity and category to pick
 * 1 / 3 / 5 cards automatically — the user never chooses a card count
 * themselves. That analysis isn't built yet, so every reading gets the
 * three-card spread today; this function is the single place that will
 * change when it is.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params are the future extension point, unused until question-analysis lands
export function selectSpread(questionCategory: string | null, question: string): TarotSpread {
  return threeCardSpread;
}
