"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import { getDeckById, type TarotCard } from "@/data/decks";
import { shuffle } from "@/lib/shuffle";
import { useCardCarousel } from "@/lib/useCardCarousel";
import { getCategoryById } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const REQUIRED_COUNT = 3;

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, deckId, setSelectedCardIds } =
    useTarotFlow();
  const deck = getDeckById(deckId);
  const [shuffledCards, setShuffledCards] = useState<TarotCard[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const { emblaRef, selectedIndex, scrollTo } = useCardCarousel();

  useEffect(() => {
    if (isHydrated && (!categoryId || !question || !deck)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, deck, router]);

  useEffect(() => {
    if (!deck) return;
    // Shuffle only after mount (client-only randomness) so the SSR markup
    // has no card order to mismatch against during hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffledCards(shuffle(deck.cards));
  }, [deck]);

  if (!isHydrated || !categoryId || !question || !deck || !shuffledCards) {
    return null;
  }

  const category = getCategoryById(categoryId);
  const isComplete = picked.length === REQUIRED_COUNT;

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

  const handleCardTap = (index: number, id: string) => {
    if (index !== selectedIndex) {
      scrollTo(index);
      return;
    }
    toggleCard(id);
  };

  const handleConfirm = () => {
    if (!isComplete) return;
    setSelectedCardIds(picked);
    router.push("/reveal");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={3}
        totalSteps={4}
        categoryLabel={category?.label}
        title="마음이 가는 카드 3장을 골라주세요"
        subtitle="가운데 카드를 눌러 선택해보세요."
        trailing={`${picked.length} / ${REQUIRED_COUNT}`}
      />

      <div className={styles.slots} aria-hidden="true">
        {Array.from({ length: REQUIRED_COUNT }).map((_, slotIndex) => {
          const filled = picked[slotIndex];
          return (
            <div
              key={slotIndex}
              className={`${styles.slot} ${filled ? styles.slotFilled : ""}`}
              style={filled ? { borderColor: deck.theme.accent } : undefined}
            >
              {filled ? (
                <>
                  <img src={deck.cardBackImage} alt="" draggable={false} />
                  <span
                    className={styles.slotBadge}
                    style={{ background: deck.theme.accent }}
                  >
                    {slotIndex + 1}
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={styles.viewport} ref={emblaRef} data-testid="card-carousel">
        <div className={styles.track}>
          {shuffledCards.map((card, index) => {
            const orderIndex = picked.indexOf(card.id);
            const selected = orderIndex !== -1;
            const isCenter = index === selectedIndex;
            const locked = !selected && isComplete;
            return (
              <div className={styles.slide} key={card.id}>
                <button
                  type="button"
                  className={`${styles.card} ${isCenter ? styles.cardCenter : ""} ${
                    selected ? styles.cardSelected : ""
                  } ${locked ? styles.cardLocked : ""}`}
                  style={selected ? { borderColor: deck.theme.accent } : undefined}
                  onClick={() => handleCardTap(index, card.id)}
                  aria-pressed={selected}
                  aria-label={selected ? `선택됨 ${orderIndex + 1}번째` : "타로 카드"}
                >
                  <img src={deck.cardBackImage} alt="" draggable={false} />
                  {selected ? (
                    <span
                      className={styles.orderBadge}
                      style={{ background: deck.theme.accent }}
                    >
                      {orderIndex + 1}
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
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
