"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import TarotCard from "@/components/TarotCard";
import { getTarotCardById } from "@/data/tarotCards";
import { cardRoles } from "@/data/cardRoles";
import { getCategoryById } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function RevealPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, selectedCardIds } =
    useTarotFlow();
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);

  const isValidSelection = selectedCardIds.length === 3;

  useEffect(() => {
    if (isHydrated && (!categoryId || !question || !isValidSelection)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, isValidSelection, router]);

  const cards = useMemo(
    () =>
      selectedCardIds
        .map((id) => getTarotCardById(id))
        .filter((card): card is NonNullable<typeof card> => Boolean(card)),
    [selectedCardIds]
  );

  if (!isHydrated || !categoryId || !question || !isValidSelection || cards.length !== 3) {
    return null;
  }

  const category = getCategoryById(categoryId);
  const revealedCount = revealed.filter(Boolean).length;
  const allRevealed = revealedCount === 3;

  const handleReveal = (index: number) => {
    setRevealed((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={3}
        totalSteps={3}
        categoryLabel={category?.label}
        title="카드를 눌러 순서대로 확인해보세요"
        subtitle="한 장씩 천천히 뒤집어보세요."
        trailing={`${revealedCount} / 3`}
      />

      <div className={styles.list}>
        {cards.map((card, index) => (
          <div className={styles.slot} key={card.id}>
            <span className={styles.roleTitle}>{cardRoles[index].title}</span>
            <TarotCard
              card={card}
              revealed={revealed[index]}
              onReveal={() => handleReveal(index)}
            />
          </div>
        ))}
      </div>

      <div className={styles.spacer} />

      <PrimaryButton
        onClick={() => router.push("/result")}
        disabled={!allRevealed}
      >
        결과 보기
      </PrimaryButton>
    </main>
  );
}
