export interface Category {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "love",
    label: "연애",
    englishLabel: "Love",
    description: "지금 만나고 있는 사람과의 감정",
  },
  {
    id: "reunion",
    label: "재회",
    englishLabel: "Reunion",
    description: "다시 이어지고 싶은 인연",
  },
  {
    id: "relationship",
    label: "인간관계",
    englishLabel: "Relationship",
    description: "가족, 친구와의 관계 고민",
  },
  {
    id: "work",
    label: "직장",
    englishLabel: "Work",
    description: "일과 커리어에 대한 고민",
  },
  {
    id: "money",
    label: "금전",
    englishLabel: "Money",
    description: "돈과 관련된 선택",
  },
  {
    id: "daily",
    label: "오늘의 운세",
    englishLabel: "Daily",
    description: "오늘 하루의 흐름",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
