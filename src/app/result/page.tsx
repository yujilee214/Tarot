"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import TarotResultCard from "@/components/TarotResultCard";
import { getCardById } from "@/data/cardCatalog";
import { buildReadingContext } from "@/lib/readingContext";
import { buildReading } from "@/lib/reading";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function ResultPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards, reset } =
    useTarotFlow();

  const isValidSelection = Boolean(spread) && selectedCards.length === spread?.cardCount;

  useEffect(() => {
    if (isHydrated && (!question || !spread || !isValidSelection)) {
      router.replace("/");
    }
  }, [isHydrated, question, spread, isValidSelection, router]);

  const readingContext = useMemo(() => {
    if (!spread || !isValidSelection) return null;
    return buildReadingContext({
      question,
      questionCategory,
      spreadName: spread.name,
      selectedCards,
      getCard: getCardById,
    });
  }, [question, questionCategory, spread, selectedCards, isValidSelection]);

  const reading = useMemo(() => {
    if (!readingContext || readingContext.cards.length === 0) return null;
    return buildReading(readingContext);
  }, [readingContext]);

  if (!isHydrated || !question || !spread || !isValidSelection || !readingContext || !reading) {
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

      <div className={styles.previewRow}>
        {readingContext.cards.map((c) => (
          <img key={c.card.id} src={c.card.image} alt={c.card.koreanName} draggable={false} />
        ))}
      </div>

      <div className={styles.reading}>
        <div className={styles.readingSection}>
          <h2 className={styles.readingHeading}>전체 리딩 요약</h2>
          <p className={styles.readingBody}>{reading.summary}</p>
        </div>
      </div>

      <div className={styles.cardsList}>
        {reading.cardSections.map((section) => (
          <TarotResultCard
            key={section.card.id}
            card={section.card}
            roleTitle={section.roleTitle}
            body={section.body}
          />
        ))}
      </div>

      <div className={styles.reading}>
        <div className={styles.readingSection}>
          <h2 className={styles.readingHeading}>전체 카드 조합 해석</h2>
          <p className={styles.readingBody}>{reading.combination}</p>
        </div>
        <div className={styles.readingSection}>
          <h2 className={styles.readingHeading}>마무리 조언</h2>
          <p className={styles.readingBody}>{reading.closingAdvice}</p>
        </div>
      </div>

      <div className={styles.spacer} />

      <PrimaryButton variant="outline" onClick={handleRestart}>
        다시 타로 보기
      </PrimaryButton>
    </main>
  );
}
