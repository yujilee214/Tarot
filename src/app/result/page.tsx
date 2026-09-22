"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import TarotResultCard from "@/components/TarotResultCard";
import ReadingSummary from "@/components/ReadingSummary";
import CombinedReading from "@/components/CombinedReading";
import DirectAnswer from "@/components/DirectAnswer";
import ActionAdvice from "@/components/ActionAdvice";
import ClosingMessage from "@/components/ClosingMessage";
import { getCardById } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
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

  const category = getCategoryById(questionCategory ?? "");

  const handleRestart = () => {
    reset();
    router.push("/");
  };

  return (
    <main className="screen">
      <div className={styles.questionBlock}>
        {category ? <span className={styles.categoryBadge}>{category.label}</span> : null}
        <span className={styles.questionLabel}>내가 물어본 질문</span>
        <p className={styles.questionText}>“{question}”</p>
      </div>

      <div className={styles.previewRow}>
        {readingContext.cards.map((c) => (
          <div key={c.card.id} className={styles.previewCard}>
            <img src={c.card.image} alt={c.card.koreanName} draggable={false} />
            <span className={styles.previewRole}>{c.roleTitle}</span>
            <span className={styles.previewName}>{c.card.koreanName}</span>
            <span className={styles.previewNameEn}>{c.card.name.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className={styles.reading}>
        <ReadingSummary summary={reading.summary} />
      </div>

      <div className={styles.cardsList}>
        {reading.cards.map((section) => (
          <TarotResultCard
            key={section.card.id}
            card={section.card}
            roleTitle={section.roleTitle}
            body={section.body}
          />
        ))}
      </div>

      <div className={styles.reading}>
        <CombinedReading combinedReading={reading.combinedReading} />
      </div>

      <div className={styles.reading}>
        <DirectAnswer directAnswer={reading.directAnswer} />
      </div>

      <div className={styles.reading}>
        <ActionAdvice items={reading.actionAdvice} />
      </div>

      <div className={styles.closingWrap}>
        <ClosingMessage message={reading.closingMessage} />
      </div>

      <div className={styles.spacer} />

      <PrimaryButton variant="outline" onClick={handleRestart}>
        다시 타로 보기
      </PrimaryButton>
    </main>
  );
}
