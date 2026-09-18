import type { TarotCardData } from "@/data/tarotCards";

export interface ReadingSection {
  heading: string;
  body: string;
}

export function buildReading(
  question: string,
  cards: [TarotCardData, TarotCardData, TarotCardData]
): ReadingSection[] {
  const [situation, flow, advice] = cards;

  return [
    {
      heading: "현재 상황",
      body: `"${question}"라는 물음 앞에서, ${situation.koreanName}(${situation.name}) 카드는 지금 당신이 놓여 있는 자리를 비춰줘요. ${situation.interpretation}`,
    },
    {
      heading: "관계 또는 상황의 흐름",
      body: `${flow.koreanName}(${flow.name}) 카드는 지금 이 상황에서 조용히 움직이고 있는 중요한 흐름을 말해줘요. ${flow.interpretation}`,
    },
    {
      heading: "지금 필요한 조언",
      body: `${advice.koreanName}(${advice.name}) 카드는 앞으로 나아가기 위해 필요한 조언을 전해요. ${advice.interpretation}`,
    },
  ];
}
