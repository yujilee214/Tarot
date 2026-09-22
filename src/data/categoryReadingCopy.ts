/**
 * Category-specific copy used only when composing a `ReadingResult` (see
 * src/lib/reading.ts) — never shown as raw UI text on its own. Product spec
 * section 28 fixes the "직접적인 답" heading per category; section 29 fixes
 * what kind of action each category's advice should center on.
 */
export interface CategoryReadingCopy {
  directAnswerTitle: string;
  actionFocus: string;
}

const DEFAULT_COPY: CategoryReadingCopy = {
  directAnswerTitle: "지금 이 흐름은 어떻게 보일까요?",
  actionFocus: "지금 상황에서 참고할 행동",
};

export const categoryReadingCopy: Record<string, CategoryReadingCopy> = {
  love: {
    directAnswerTitle: "그래서 이 관계는 앞으로 어떻게 될까요?",
    actionFocus: "연락과 관계를 대하는 방식",
  },
  reunion: {
    directAnswerTitle: "다시 이어질 흐름은 어떻게 보일까요?",
    actionFocus: "연락 시점과 마음 정리",
  },
  relationship: {
    directAnswerTitle: "이 관계는 앞으로 어떻게 흘러갈까요?",
    actionFocus: "거리 조절과 대화 방식",
  },
  work: {
    directAnswerTitle: "지금의 커리어 흐름은 어떻게 보일까요?",
    actionFocus: "업무와 커리어에서의 행동",
  },
  money: {
    directAnswerTitle: "앞으로의 금전 흐름은 어떻게 보일까요?",
    actionFocus: "지출과 계획",
  },
  daily: {
    directAnswerTitle: "오늘 하루는 어떻게 흘러갈까요?",
    actionFocus: "오늘 하루 동안 참고할 행동",
  },
};

export function getCategoryReadingCopy(categoryId: string | null): CategoryReadingCopy {
  if (!categoryId) return DEFAULT_COPY;
  return categoryReadingCopy[categoryId] ?? DEFAULT_COPY;
}
