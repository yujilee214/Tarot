/**
 * Per-category recommended questions (product spec sections 7–12). The user
 * never picks a tarot spread or card type — this is the only "menu" they
 * see before typing their own words, and tapping one just fills the
 * question input (still freely editable afterward), it never submits by
 * itself.
 */
export interface RecommendedQuestion {
  id: string;
  /** Short chip label shown on screen. */
  label: string;
  /** Full sentence written into the question input when tapped. */
  question: string;
}

export const recommendedQuestionsByCategory: Record<string, RecommendedQuestion[]> = {
  love: [
    {
      id: "their-feelings",
      label: "상대방 마음",
      question: "상대방은 지금 저를 어떻게 생각하고 있을까요?",
    },
    {
      id: "future-relationship",
      label: "앞으로의 관계",
      question: "지금 이 사람과의 관계는 앞으로 어떻게 흘러갈까요?",
    },
    {
      id: "reach-out-first",
      label: "먼저 다가가도 될까?",
      question: "지금 제가 먼저 다가가거나 연락해도 괜찮을까요?",
    },
    {
      id: "some-to-love",
      label: "썸이 연애로 이어질까?",
      question: "지금의 썸 관계가 연애로 이어질 가능성은 어떤 흐름인가요?",
    },
    {
      id: "watch-out-for",
      label: "관계에서 주의할 점",
      question: "지금 이 관계에서 제가 놓치고 있는 부분은 무엇일까요?",
    },
  ],
  reunion: [
    {
      id: "contact-again",
      label: "다시 연락이 올까?",
      question: "상대방에게 다시 연락이 올 가능성은 어떤 흐름인가요?",
    },
    {
      id: "reunion-chance",
      label: "재회 가능성",
      question: "이 관계가 다시 이어질 가능성은 어떤 흐름인가요?",
    },
    {
      id: "should-i-reach-out",
      label: "내가 먼저 연락할까?",
      question: "지금 제가 먼저 연락하는 것이 관계에 어떤 영향을 줄까요?",
    },
    {
      id: "their-current-feelings",
      label: "상대방의 현재 마음",
      question: "헤어진 상대는 현재 이 관계를 어떻게 바라보고 있을까요?",
    },
    {
      id: "what-it-takes",
      label: "재회를 위해 필요한 것",
      question: "다시 관계를 이어가려면 제가 먼저 살펴봐야 할 부분은 무엇일까요?",
    },
  ],
  relationship: [
    {
      id: "their-feelings",
      label: "이 사람의 마음",
      question: "이 사람은 현재 저와의 관계를 어떻게 느끼고 있을까요?",
    },
    {
      id: "why-uncomfortable",
      label: "관계가 왜 불편할까?",
      question: "지금 이 관계에서 불편함이 생기는 이유는 무엇일까요?",
    },
    {
      id: "resolve-misunderstanding",
      label: "오해를 풀 수 있을까?",
      question: "지금 생긴 오해나 갈등은 앞으로 어떻게 흘러갈까요?",
    },
    {
      id: "keep-distance",
      label: "거리를 두는 게 좋을까?",
      question: "지금 이 사람과 거리를 두는 것이 제게 도움이 될까요?",
    },
    {
      id: "future-relationship",
      label: "앞으로의 관계",
      question: "앞으로 이 사람과의 관계는 어떤 방향으로 흘러갈까요?",
    },
  ],
  work: [
    {
      id: "current-flow",
      label: "지금 회사에서의 흐름",
      question: "현재 회사에서 제 업무 흐름은 어떻게 흘러가고 있나요?",
    },
    {
      id: "should-i-leave",
      label: "이직해도 될까?",
      question: "지금 이직을 준비하는 것이 제 상황에 어떤 영향을 줄까요?",
    },
    {
      id: "good-opportunity",
      label: "좋은 기회가 올까?",
      question: "앞으로 제 일에서 새로운 기회가 들어올 흐름이 있을까요?",
    },
    {
      id: "watch-out-for",
      label: "회사에서 주의할 점",
      question: "현재 직장에서 제가 특히 주의해서 봐야 할 부분은 무엇일까요?",
    },
    {
      id: "right-direction",
      label: "지금 방향이 맞을까?",
      question: "지금 제가 선택한 커리어 방향을 계속 이어가는 것이 좋을까요?",
    },
  ],
  money: [
    {
      id: "current-flow",
      label: "요즘 금전 흐름",
      question: "당분간 제 금전 흐름은 어떻게 흘러갈까요?",
    },
    {
      id: "why-spending",
      label: "돈이 나가는 이유",
      question: "현재 제 금전 흐름에서 가장 주의해야 할 부분은 무엇일까요?",
    },
    {
      id: "new-income",
      label: "새로운 수입 기회",
      question: "새로운 수입이나 금전적인 기회가 들어올 흐름이 있을까요?",
    },
    {
      id: "big-purchase",
      label: "큰 지출을 해도 될까?",
      question: "지금 생각하고 있는 큰 지출이 제 상황에 어떤 영향을 줄까요?",
    },
    {
      id: "financial-direction",
      label: "재정 방향",
      question: "앞으로 재정을 안정시키기 위해 어떤 부분에 집중하는 것이 좋을까요?",
    },
  ],
  daily: [
    {
      id: "overall-flow",
      label: "오늘의 전체 흐름",
      question: "오늘 하루는 어떤 흐름으로 흘러갈까요?",
    },
    {
      id: "be-careful",
      label: "오늘 조심할 점",
      question: "오늘 제가 특히 조심해서 봐야 할 부분은 무엇일까요?",
    },
    {
      id: "good-flow",
      label: "오늘의 좋은 흐름",
      question: "오늘 제가 잘 활용하면 좋은 흐름은 무엇일까요?",
    },
    {
      id: "relationships",
      label: "오늘의 인간관계",
      question: "오늘 사람들과의 관계에서 어떤 점을 기억하면 좋을까요?",
    },
    {
      id: "message",
      label: "오늘의 메시지",
      question: "오늘 저에게 가장 필요한 메시지는 무엇일까요?",
    },
  ],
};

export function getRecommendedQuestions(categoryId: string | null): RecommendedQuestion[] {
  if (!categoryId) return [];
  return recommendedQuestionsByCategory[categoryId] ?? [];
}
