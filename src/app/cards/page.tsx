"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import TarotCardBack from "@/components/TarotCardBack";
import { tarotCards, type TarotCardData } from "@/data/tarotCards";
import { shuffle } from "@/lib/shuffle";
import { getCategoryById } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const REQUIRED_COUNT = 3;

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, setSelectedCardIds } =
    useTarotFlow();
  const [deck, setDeck] = useState<TarotCardData[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (isHydrated && (!categoryId || !question)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, router]);

  useEffect(() => {
    // Shuffle only after mount (client-only randomness) so the SSR markup
    // has no card order to mismatch against during hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(shuffle(tarotCards));
  }, []);

  if (!isHydrated || !categoryId || !question || !deck) {
    return null;
  }

  const category = getCategoryById(categoryId);

  const toggleCard = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) {
        return prev.filter((cardId) => cardId !== id);
      }
      if (prev.length >= REQUIRED_COUNT) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const isComplete = picked.length === REQUIRED_COUNT;

  const handleConfirm = () => {
    if (!isComplete) return;
    setSelectedCardIds(picked);
    router.push("/reveal");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={2}
        totalSteps={3}
        categoryLabel={category?.label}
        title="마음이 가는 카드 3장을 골라주세요"
        subtitle="직관적으로 끌리는 카드를 순서대로 선택해보세요."
        trailing={`${picked.length} / ${REQUIRED_COUNT}`}
      />

      <div className={styles.grid} data-testid="card-grid">
        {deck.map((card) => {
          const selectedIndex = picked.indexOf(card.id);
          const selected = selectedIndex !== -1;
          return (
            <TarotCardBack
              key={card.id}
              selected={selected}
              order={selected ? selectedIndex + 1 : undefined}
              disabled={!selected && isComplete}
              onClick={() => toggleCard(card.id)}
            />
          );
        })}
      </div>

      <div className={styles.spacer} />

      <div className={styles.footer}>
        <PrimaryButton onClick={handleConfirm} disabled={!isComplete}>
          카드 확인하기
        </PrimaryButton>
      </div>
    </main>
  );
}
