export interface CardRole {
  title: string;
  shortTitle: string;
  description: string;
}

export const cardRoles: CardRole[] = [
  {
    title: "현재 상황",
    shortTitle: "상황",
    description: "지금 당신이 서 있는 자리를 보여줘요",
  },
  {
    title: "현재 상황에서 중요한 흐름",
    shortTitle: "흐름",
    description: "지금 흘러가고 있는 중요한 기운이에요",
  },
  {
    title: "앞으로의 조언",
    shortTitle: "조언",
    description: "앞으로 나아가기 위한 힌트를 담고 있어요",
  },
];
