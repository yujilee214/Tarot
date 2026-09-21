export interface TarotCardData {
  id: string;
  name: string;
  koreanName: string;
  image: string;
  keywords: string[];
  interpretation: string;
}

export const tarotCards: TarotCardData[] = [
  {
    id: "00-fool",
    name: "The Fool",
    koreanName: "바보",
    image: "/cards/00-fool.svg",
    keywords: ["새로운 시작", "순수함", "모험"],
    interpretation:
      "아무것도 정해지지 않은 새하얀 페이지 위에 서 있는 상태예요. 두려움보다 호기심을 따라가 볼 때입니다.",
  },
  {
    id: "01-magician",
    name: "The Magician",
    koreanName: "마법사",
    image: "/cards/01-magician.svg",
    keywords: ["의지", "실행력", "가능성"],
    interpretation:
      "이미 필요한 재료는 손 안에 다 있어요. 이제는 마음먹은 것을 실제로 움직여볼 타이밍입니다.",
  },
  {
    id: "02-high-priestess",
    name: "The High Priestess",
    koreanName: "여사제",
    image: "/cards/02-high-priestess.svg",
    keywords: ["직관", "내면의 목소리", "비밀"],
    interpretation:
      "겉으로 드러난 말보다 마음 깊은 곳의 직감이 더 정확한 답을 알고 있을 가능성이 커요.",
  },
  {
    id: "03-empress",
    name: "The Empress",
    koreanName: "여황제",
    image: "/cards/03-empress.svg",
    keywords: ["풍요", "돌봄", "안정"],
    interpretation:
      "지금은 스스로를 채우고 돌보는 시간이 필요해요. 여유를 가질수록 관계와 결과도 자연스럽게 따라옵니다.",
  },
  {
    id: "04-emperor",
    name: "The Emperor",
    koreanName: "황제",
    image: "/cards/04-emperor.svg",
    keywords: ["안정감", "책임감", "구조"],
    interpretation:
      "감정에 휩쓸리기보다 원칙과 기준을 세워두는 편이 지금 상황을 안정시켜 줄 거예요.",
  },
  {
    id: "05-lovers",
    name: "The Lovers",
    koreanName: "연인",
    image: "/cards/05-lovers.svg",
    keywords: ["선택", "연결", "진심"],
    interpretation:
      "마음이 향하는 방향은 이미 정해져 있는지도 몰라요. 중요한 건 그 선택을 스스로 인정하는 일입니다.",
  },
  {
    id: "06-chariot",
    name: "The Chariot",
    koreanName: "전차",
    image: "/cards/06-chariot.svg",
    keywords: ["추진력", "결단", "속도"],
    interpretation:
      "머뭇거리던 마음을 정리하고 한 방향으로 나아가면 생각보다 빠르게 상황이 풀릴 수 있어요.",
  },
  {
    id: "07-strength",
    name: "Strength",
    koreanName: "힘",
    image: "/cards/07-strength.svg",
    keywords: ["내면의 힘", "인내", "부드러움"],
    interpretation:
      "강하게 밀어붙이기보다 부드럽게 다독이는 태도가 지금은 더 큰 힘을 발휘해요.",
  },
  {
    id: "08-hermit",
    name: "The Hermit",
    koreanName: "은둔자",
    image: "/cards/08-hermit.svg",
    keywords: ["성찰", "혼자만의 시간", "탐색"],
    interpretation:
      "답을 서둘러 찾기보다 잠시 혼자 생각을 정리하는 시간이 지금은 더 필요해 보여요.",
  },
  {
    id: "09-wheel-of-fortune",
    name: "Wheel of Fortune",
    koreanName: "운명의 수레바퀴",
    image: "/cards/09-wheel-of-fortune.svg",
    keywords: ["전환점", "흐름", "타이밍"],
    interpretation:
      "지금까지의 흐름이 바뀌는 변곡점에 서 있어요. 억지로 붙잡기보다 흐름에 몸을 맡겨볼 때입니다.",
  },
  {
    id: "10-justice",
    name: "Justice",
    koreanName: "정의",
    image: "/cards/10-justice.svg",
    keywords: ["균형", "공정함", "결과"],
    interpretation:
      "그동안의 선택과 노력이 결국 정직하게 결과로 돌아오는 시기예요. 감정보다 균형을 우선해보세요.",
  },
  {
    id: "11-death",
    name: "Death",
    koreanName: "죽음",
    image: "/cards/11-death.svg",
    keywords: ["끝과 시작", "전환", "정리"],
    interpretation:
      "무언가를 완전히 놓아야 새로운 흐름이 들어올 자리가 생겨요. 끝이 아니라 전환점에 가깝습니다.",
  },
  {
    id: "12-temperance",
    name: "Temperance",
    koreanName: "절제",
    image: "/cards/12-temperance.svg",
    keywords: ["균형", "조화", "인내"],
    interpretation:
      "극단으로 치닫기보다 양쪽을 천천히 조율해 나갈 때 관계도 상황도 더 편안해질 수 있어요.",
  },
  {
    id: "13-devil",
    name: "The Devil",
    koreanName: "악마",
    image: "/cards/13-devil.svg",
    keywords: ["집착", "속박", "유혹"],
    interpretation:
      "익숙하다는 이유만으로 붙잡고 있는 것은 없는지 돌아볼 필요가 있어요. 스스로를 옭아매는 생각을 점검해보세요.",
  },
  {
    id: "14-star",
    name: "The Star",
    koreanName: "별",
    image: "/cards/14-star.svg",
    keywords: ["희망", "치유", "회복"],
    interpretation:
      "지금은 힘든 시간을 지나 서서히 회복하는 단계예요. 작은 희망의 신호를 믿어도 좋아요.",
  },
  {
    id: "15-moon",
    name: "The Moon",
    koreanName: "달",
    image: "/cards/15-moon.svg",
    keywords: ["불안", "혼란", "무의식"],
    interpretation:
      "아직 명확하지 않은 부분이 많아 불안할 수 있어요. 확신이 서기 전까지는 조금 더 지켜보는 편이 좋겠어요.",
  },
  {
    id: "16-sun",
    name: "The Sun",
    koreanName: "태양",
    image: "/cards/16-sun.svg",
    keywords: ["행복", "성취", "긍정"],
    interpretation:
      "밝고 긍정적인 기운이 상황을 비추고 있어요. 자신감을 가지고 표현해도 좋은 결과로 이어질 가능성이 커요.",
  },
  {
    id: "17-judgement",
    name: "Judgement",
    koreanName: "심판",
    image: "/cards/17-judgement.svg",
    keywords: ["각성", "재평가", "결단"],
    interpretation:
      "그동안의 상황을 되돌아보고 스스로 다시 판단을 내려야 할 시점이에요. 미루던 결정을 마주해보세요.",
  },
  {
    id: "18-world",
    name: "The World",
    koreanName: "세계",
    image: "/cards/18-world.svg",
    keywords: ["완성", "성취", "마무리"],
    interpretation:
      "하나의 흐름이 완결되는 지점에 가까워지고 있어요. 지금까지의 과정을 인정해줘도 괜찮아요.",
  },
];

export function getTarotCardById(id: string): TarotCardData | undefined {
  return tarotCards.find((card) => card.id === id);
}

export const CARD_BACK_IMAGE = "/cards/card-back.svg";
