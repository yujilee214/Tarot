"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import TarotResultCard from "@/components/TarotResultCard";
import { getDeckById, getCardInDeck, type TarotCard } from "@/data/decks";
import { cardRoles } from "@/data/cardRoles";
import { buildReading } from "@/lib/reading";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function ResultPage() {
  const router = useRouter();
  const { isHydrated, question, deckId, selectedCardIds, reset } =
    useTarotFlow();
  const deck = getDeckById(deckId);

  const isValidSelection = selectedCardIds.length === 3;

  useEffect(() => {
    if (isHydrated && (!question || !deck || !isValidSelection)) {
      router.replace("/");
    }
  }, [isHydrated, question, deck, isValidSelection, router]);

  const cards = useMemo(
    () =>
      deck
        ? selectedCardIds
            .map((id) => getCardInDeck(deck, id))
            .filter((card): card is TarotCard => Boolean(card))
        : [],
    [deck, selectedCardIds]
  );

  const reading = useMemo(() => {
    if (cards.length !== 3) return null;
    return buildReading(question, [cards[0], cards[1], cards[2]]);
  }, [cards, question]);

  if (
    !isHydrated ||
    !question ||
    !deck ||
    !isValidSelection ||
    cards.length !== 3 ||
    !reading
  ) {
    return null;
  }

  const handleRestart = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="screen">
      <div className={styles.questionBlock}>
        <span className={styles.questionLabel}>당신의 질문</span>
        <p className={styles.questionText}>“{question}”</p>
      </div>

      <div className={styles.cardsList}>
        {cards.map((card, index) => (
          <TarotResultCard
            key={card.id}
            card={card}
            roleTitle={cardRoles[index].title}
          />
        ))}
      </div>

      <div className={styles.reading}>
        {reading.map((section) => (
          <div className={styles.readingSection} key={section.heading}>
            <h2 className={styles.readingHeading}>{section.heading}</h2>
            <p className={styles.readingBody}>{section.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.spacer} />

      <PrimaryButton variant="outline" onClick={handleRestart}>
        다시 타로 보기
      </PrimaryButton>
    </main>
  );
}
