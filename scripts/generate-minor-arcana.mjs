// Generates src/data/minorArcana.ts — the 56 Minor Arcana cards.
//
// Hand-writing 56 x 7 meaning fields is impractical, and would also hide
// the fact that every Minor Arcana card is really "a suit theme crossed
// with a stage in that suit's journey." So this script composes each
// card's text from a small suit profile (Wands/Cups/Swords/Pentacles —
// what that suit is about, in each life area) crossed with a rank profile
// (what Ace..King means as a stage), and writes out the *resolved*
// literal strings into a plain TarotCard[] — the app itself never does
// any template resolution at runtime; it only ever reads flat data.
//
// Run with: node scripts/generate-minor-arcana.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "..", "src", "data", "minorArcana.ts");
const IMAGE_BASE = "/cards/main";

const SUITS = [
  {
    id: "wands",
    koreanName: "완드",
    englishName: "Wands",
    coreWord: "열정과 추진력",
    loveDomain: "관계를 향한 설렘과 적극적인 마음",
    relationshipDomain: "함께 무언가에 도전하는 에너지",
    careerDomain: "일에 쏟는 열정과 추진력",
    moneyDomain: "새로운 기회를 향해 움직이려는 마음",
    symbolWord: "나뭇가지",
    baseKeywords: ["행동력", "열정", "성장"],
  },
  {
    id: "cups",
    koreanName: "컵",
    englishName: "Cups",
    coreWord: "감정과 마음의 흐름",
    loveDomain: "마음속 감정과 애정의 흐름",
    relationshipDomain: "서로 마음을 나누는 정서적 교감",
    careerDomain: "함께 일하는 사람들과의 관계와 만족감",
    moneyDomain: "마음이 앞서는 소비나 선택",
    symbolWord: "컵",
    baseKeywords: ["감정", "유대", "직관"],
  },
  {
    id: "swords",
    koreanName: "소드",
    englishName: "Swords",
    coreWord: "생각과 판단",
    loveDomain: "관계에서 오가는 솔직한 대화와 생각",
    relationshipDomain: "말과 생각으로 얽힌 관계의 흐름",
    careerDomain: "일에서 마주하는 결정과 논리적인 판단",
    moneyDomain: "현실적인 계산과 판단이 필요한 선택",
    symbolWord: "검",
    baseKeywords: ["생각", "판단", "진실"],
  },
  {
    id: "pentacles",
    koreanName: "펜타클",
    englishName: "Pentacles",
    coreWord: "현실과 결실",
    loveDomain: "현실적인 안정감과 신뢰",
    relationshipDomain: "꾸준함으로 쌓아가는 믿음",
    careerDomain: "차근차근 쌓아온 노력과 결과",
    moneyDomain: "실질적인 수입과 재정 관리",
    symbolWord: "동전",
    baseKeywords: ["현실", "결실", "노력"],
  },
];

const RANKS = [
  {
    id: "ace",
    badge: "A",
    koreanName: "에이스",
    englishName: "Ace",
    stageKeyword: "새로운 시작",
    build: (s) => ({
      upright: `${s.symbolWord} 하나가 막 놓인 순간이에요. ${s.coreWord}${i(s.coreWord)} 새롭게 싹트기 시작해요.`,
      reversed: `${s.coreWord}${i(s.coreWord)} 아직 자리를 잡지 못해 머뭇거리는 시기일 수 있어요.`,
      love: `${s.loveDomain}${i(s.loveDomain)} 새롭게 시작되는 기운이 느껴지는 시기예요.`,
      relationship: `${s.relationshipDomain}${i(s.relationshipDomain)} 이제 막 싹트기 시작하는 때예요.`,
      career: `${s.careerDomain}에 새로운 기운이 더해지는 시기예요.`,
      money: `${s.moneyDomain}${i(s.moneyDomain)} 새롭게 시작될 수 있는 흐름이에요.`,
      advice: "새로 시작된 기운을 조심스럽게 키워가 보세요.",
    }),
  },
  {
    id: "two",
    badge: "2",
    koreanName: "2",
    englishName: "Two",
    stageKeyword: "균형",
    build: (s) => ({
      upright: "두 가지 선택이나 두 사람 사이에서 균형을 찾아야 하는 시기예요.",
      reversed: "선택을 미루거나 균형이 한쪽으로 기울어 있을 수 있어요.",
      love: `${s.loveDomain} 속에서 두 마음 사이의 균형을 맞춰가는 시기예요.`,
      relationship: `${s.relationshipDomain}에서 서로 다른 생각을 조율해야 하는 때예요.`,
      career: `${s.careerDomain}${gwa(s.careerDomain)} 관련해 두 가지 선택지를 고민하게 되는 시기예요.`,
      money: `${s.moneyDomain}에서 신중한 비교와 선택이 필요한 때예요.`,
      advice: "양쪽을 충분히 비교한 뒤 천천히 선택해도 늦지 않아요.",
    }),
  },
  {
    id: "three",
    badge: "3",
    koreanName: "3",
    englishName: "Three",
    stageKeyword: "협력",
    build: (s) => ({
      upright: "작은 결실이 보이기 시작하고, 함께하는 이들과의 협력이 중요한 시기예요.",
      reversed: "협력이 어긋나거나 기대만큼의 결과가 보이지 않을 수 있어요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 다른 사람과의 관계 속에서 확인되는 시기예요.`,
      relationship: `함께하는 사람들과 ${s.relationshipDomain}${i(s.relationshipDomain)} 커지는 때예요.`,
      career: `${s.careerDomain}${i(s.careerDomain)} 협업을 통해 결실을 맺기 시작하는 시기예요.`,
      money: `함께하는 계획이나 협업이 ${s.moneyDomain}에 도움이 되는 때예요.`,
      advice: "혼자보다 함께할 때 더 좋은 결과를 만들 수 있는 시기예요.",
    }),
  },
  {
    id: "four",
    badge: "4",
    koreanName: "4",
    englishName: "Four",
    stageKeyword: "안정",
    build: (s) => ({
      upright: "잠시 멈춰 지금까지의 흐름을 안정시키는 시간이에요.",
      reversed: "쉬어야 할 때 쉬지 못해 지쳐 있을 수 있는 시기예요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 편안하게 안정되는 시기예요.`,
      relationship: "무리하지 않고 관계를 편안하게 유지하고 싶어지는 때예요.",
      career: `${s.careerDomain}에 잠시 쉼표를 찍고 정비하는 시기예요.`,
      money: "무리한 확장보다 지금의 안정을 지키는 편이 좋은 때예요.",
      advice: "잠깐의 휴식이 다음 단계를 위한 힘이 되어줄 거예요.",
    }),
  },
  {
    id: "five",
    badge: "5",
    koreanName: "5",
    englishName: "Five",
    stageKeyword: "갈등",
    build: (s) => ({
      upright: "크고 작은 갈등이나 어려움을 마주하게 되는 시기예요.",
      reversed: "갈등이 서서히 잦아들거나 화해의 실마리가 보이는 시기예요.",
      love: `${s.loveDomain}에서 작은 다툼이나 엇갈림이 생길 수 있는 시기예요.`,
      relationship: `의견 차이로 ${s.relationshipDomain}${i(s.relationshipDomain)} 흔들릴 수 있는 때예요.`,
      career: `${s.careerDomain} 안에서 경쟁이나 갈등을 마주하는 시기예요.`,
      money: `예상치 못한 어려움으로 ${s.moneyDomain}에 부담이 생길 수 있어요.`,
      advice: "갈등을 피하기보다 솔직하게 마주하는 편이 도움이 돼요.",
    }),
  },
  {
    id: "six",
    badge: "6",
    koreanName: "6",
    englishName: "Six",
    stageKeyword: "조화",
    build: (s) => ({
      upright: "조화와 도움을 주고받으며 흐름이 한결 편안해지는 시기예요.",
      reversed: "주고받음의 균형이 어긋나 한쪽만 애쓰고 있을 수 있어요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 서로의 배려 속에서 편안해지는 시기예요.`,
      relationship: `주고받는 마음이 균형을 이루며 ${s.relationshipDomain}${i(s.relationshipDomain)} 깊어져요.`,
      career: `주변의 도움으로 ${s.careerDomain}${i(s.careerDomain)} 한결 수월해지는 시기예요.`,
      money: `도움을 주고받으며 ${s.moneyDomain}${i(s.moneyDomain)} 안정을 찾는 때예요.`,
      advice: "받은 만큼 돌려주려는 마음이 관계를 오래 지켜줘요.",
    }),
  },
  {
    id: "seven",
    badge: "7",
    koreanName: "7",
    englishName: "Seven",
    stageKeyword: "인내",
    build: (s) => ({
      upright: "인내심을 갖고 한 걸음 물러나 상황을 지켜봐야 하는 시기예요.",
      reversed: "조급한 마음에 성급하게 움직이고 있을 수 있는 때예요.",
      love: `${s.loveDomain}${eul(s.loveDomain)} 서두르지 않고 지켜봐야 하는 시기예요.`,
      relationship: `당장 답을 내기보다 ${s.relationshipDomain}${eul(s.relationshipDomain)} 천천히 지켜보는 때예요.`,
      career: `${s.careerDomain}의 결과를 인내심 있게 기다려야 하는 시기예요.`,
      money: `성급한 결정보다 ${s.moneyDomain}${eul(s.moneyDomain)} 신중히 지켜보는 편이 좋아요.`,
      advice: "지금은 속도보다 방향을 지키는 인내가 필요한 때예요.",
    }),
  },
  {
    id: "eight",
    badge: "8",
    koreanName: "8",
    englishName: "Eight",
    stageKeyword: "몰입",
    build: (s) => ({
      upright: "속도를 내며 몰입하게 되는 흐름이 빠르게 이어지는 시기예요.",
      reversed: "속도 조절에 실패해 지치거나 흐름이 자꾸 막힐 수 있어요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 빠르게 진전되는 시기예요.`,
      relationship: `${s.relationshipDomain}${i(s.relationshipDomain)} 속도감 있게 가까워지는 때예요.`,
      career: `${s.careerDomain}에 속도가 붙으며 몰입하게 되는 시기예요.`,
      money: `${s.moneyDomain}${i(s.moneyDomain)} 빠르게 움직이는 흐름이니 페이스 조절이 필요해요.`,
      advice: "속도를 즐기되 가끔은 숨 고르기를 잊지 마세요.",
    }),
  },
  {
    id: "nine",
    badge: "9",
    koreanName: "9",
    englishName: "Nine",
    stageKeyword: "막바지",
    build: (s) => ({
      upright: "거의 다 왔다는 감각과 함께 마지막 힘을 내야 하는 시기예요.",
      reversed: "지쳐서 마지막 한 걸음이 유독 무겁게 느껴질 수 있는 때예요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 결실을 눈앞에 두고 있는 시기예요.`,
      relationship: `${s.relationshipDomain}${i(s.relationshipDomain)} 꾸준함 덕분에 단단해지는 때예요.`,
      career: `${s.careerDomain}${i(s.careerDomain)} 마무리를 앞두고 있는 시기예요.`,
      money: `${s.moneyDomain}${i(s.moneyDomain)} 목표에 가까워지고 있는 때예요.`,
      advice: "조금만 더 힘을 내면 원하는 결과에 닿을 수 있어요.",
    }),
  },
  {
    id: "ten",
    badge: "10",
    koreanName: "10",
    englishName: "Ten",
    stageKeyword: "완성",
    build: (s) => ({
      upright: "하나의 흐름이 완성되거나 마무리되는 지점이에요.",
      reversed: "마무리가 예상보다 무겁게 느껴지거나 다음 단계로 넘어가기 버거울 수 있어요.",
      love: `${s.loveDomain}${i(s.loveDomain)} 하나의 매듭을 짓는 시기예요.`,
      relationship: `${s.relationshipDomain}${i(s.relationshipDomain)} 하나의 결론에 도달하는 때예요.`,
      career: `${s.careerDomain}${i(s.careerDomain)} 완결되며 다음 단계를 준비하는 시기예요.`,
      money: `${s.moneyDomain}${i(s.moneyDomain)} 마무리되며 정리가 필요한 때예요.`,
      advice: "끝맺음을 잘 정리해야 다음 흐름도 가벼워져요.",
    }),
  },
  {
    id: "page",
    badge: "P",
    koreanName: "페이지",
    englishName: "Page",
    stageKeyword: "호기심",
    build: (s) => ({
      upright: `호기심 많은 초심자의 마음으로 ${s.coreWord}${eul(s.coreWord)} 배워가기 시작하는 시기예요.`,
      reversed: "준비 없이 서두르거나 산만하게 흩어져 있는 마음일 수 있어요.",
      love: `${s.loveDomain}${eul(s.loveDomain)} 설레는 마음으로 새롭게 배워가는 시기예요.`,
      relationship: `${s.relationshipDomain}${eul(s.relationshipDomain)} 조심스럽게 알아가기 시작하는 때예요.`,
      career: `${s.careerDomain}${eul(s.careerDomain)} 배우는 자세로 새롭게 시작하는 시기예요.`,
      money: `${s.moneyDomain}에 대해 조금씩 배워가는 단계예요.`,
      advice: "서툴러도 괜찮으니 호기심을 가지고 천천히 배워가 보세요.",
    }),
  },
  {
    id: "knight",
    badge: "N",
    koreanName: "기사",
    englishName: "Knight",
    stageKeyword: "추진력",
    build: (s) => ({
      upright: "목표를 향해 적극적으로 움직이는 추진력의 시기예요.",
      reversed: "너무 서두르다 방향을 놓치거나 성급해질 수 있는 때예요.",
      love: `${s.loveDomain}${eul(s.loveDomain)} 향해 적극적으로 다가가고 싶어지는 시기예요.`,
      relationship: `${s.relationshipDomain}${eul(s.relationshipDomain)} 향해 먼저 움직이게 되는 때예요.`,
      career: `${s.careerDomain}${eul(s.careerDomain)} 향해 속도감 있게 나아가는 시기예요.`,
      money: `${s.moneyDomain}${eul(s.moneyDomain)} 위해 적극적으로 움직이는 때예요.`,
      advice: "추진력은 좋지만 방향을 자주 점검하며 나아가세요.",
    }),
  },
  {
    id: "queen",
    badge: "Q",
    koreanName: "퀸",
    englishName: "Queen",
    stageKeyword: "성숙함",
    build: (s) => ({
      upright: "따뜻하면서도 능숙하게 상황을 다루는 성숙한 에너지의 시기예요.",
      reversed: "스스로를 돌보지 못하고 다른 사람만 챙기느라 지쳐 있을 수 있어요.",
      love: `${s.loveDomain}${eul(s.loveDomain)} 편안하고 성숙하게 다룰 수 있는 시기예요.`,
      relationship: `${s.relationshipDomain}${eul(s.relationshipDomain)} 따뜻하게 품어주는 때예요.`,
      career: `${s.careerDomain}${eul(s.careerDomain)} 능숙하게 이끌어가는 시기예요.`,
      money: `${s.moneyDomain}${eul(s.moneyDomain)} 안정적으로 관리할 수 있는 때예요.`,
      advice: "다른 사람을 돌보는 만큼 스스로도 잊지 말고 챙기세요.",
    }),
  },
  {
    id: "king",
    badge: "K",
    koreanName: "킹",
    englishName: "King",
    stageKeyword: "책임감",
    build: (s) => ({
      upright: "자신감과 책임감으로 상황을 이끌어가는 시기예요.",
      reversed: "지나치게 통제하려 하거나 책임의 무게에 눌려 있을 수 있어요.",
      love: `${s.loveDomain}${eul(s.loveDomain)} 주도적으로 이끌어가는 시기예요.`,
      relationship: `${s.relationshipDomain}에 든든한 중심이 되어주는 때예요.`,
      career: `${s.careerDomain}${eul(s.careerDomain)} 자신감 있게 책임지고 이끄는 시기예요.`,
      money: `${s.moneyDomain}${eul(s.moneyDomain)} 안정적으로 책임지고 관리하는 때예요.`,
      advice: "자신감을 가지되 주변의 의견에도 귀를 기울여보세요.",
    }),
  },
];

function esc(str) {
  return str.replace(/`/g, "\\`");
}

// Korean particles change form depending on whether the preceding syllable
// ends in a consonant (batchim) — e.g. "에너지" (no batchim) takes "가",
// while "결실" (batchim) takes "이". The suit/rank phrases below are
// interpolated into many templates, so particles must be picked per-word
// rather than hardcoded.
function hasBatchim(word) {
  const ch = word[word.length - 1];
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return true;
  return (code - 0xac00) % 28 !== 0;
}
function i(word) {
  return hasBatchim(word) ? "이" : "가";
}
function eul(word) {
  return hasBatchim(word) ? "을" : "를";
}
function gwa(word) {
  return hasBatchim(word) ? "과" : "와";
}

const entries = [];
SUITS.forEach((suit) => {
  RANKS.forEach((rank, index) => {
    const id = `${suit.id}-${rank.id}`;
    const fields = rank.build(suit);
    const koreanName = `${suit.koreanName}의 ${rank.koreanName}`;
    const englishName = `${rank.englishName} of ${suit.englishName}`;
    const keywords = [rank.stageKeyword, ...suit.baseKeywords];
    entries.push(`  {
    id: "${id}",
    number: ${index + 1},
    name: "${englishName}",
    koreanName: "${koreanName}",
    arcanaType: "minor",
    suit: "${suit.id}",
    rank: "${rank.id}",
    keywords: [${keywords.map((k) => `"${k}"`).join(", ")}],
    uprightMeaning: \`${esc(fields.upright)}\`,
    reversedMeaning: \`${esc(fields.reversed)}\`,
    loveMeaning: \`${esc(fields.love)}\`,
    relationshipMeaning: \`${esc(fields.relationship)}\`,
    careerMeaning: \`${esc(fields.career)}\`,
    moneyMeaning: \`${esc(fields.money)}\`,
    advice: \`${esc(fields.advice)}\`,
    image: "${IMAGE_BASE}/${id}.svg",
  },`);
  });
});

const output = `// GENERATED FILE — do not hand-edit.
// Regenerate with: node scripts/generate-minor-arcana.mjs
//
// Every Minor Arcana card's meaning is composed from a suit profile
// (Wands/Cups/Swords/Pentacles) crossed with a rank profile (Ace..King).
// See scripts/generate-minor-arcana.mjs for the source templates — this
// file only holds the resolved, literal result.

import type { TarotCard } from "./cardTypes";

export const minorArcana: TarotCard[] = [
${entries.join("\n")}
];
`;

writeFileSync(OUT_FILE, output, "utf8");
console.log(`Wrote ${entries.length} minor arcana cards to ${OUT_FILE}`);
