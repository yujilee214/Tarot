"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import CarouselArrowButton from "@/components/CarouselArrowButton";
import SelectedCardSlots from "@/components/SelectedCardSlots";
import { tarotCards, CARD_BACK_IMAGE, type TarotCard } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
import { buildShuffledPool } from "@/lib/cardSelection";
import { useCardCarousel } from "@/lib/useCardCarousel";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const SELECT_ANIMATION_MS = 550;

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards, pickCard, unpickCard } =
    useTarotFlow();
  const [shuffledPool, setShuffledPool] = useState<TarotCard[] | null>(null);
  const [justSelectedId, setJustSelectedId] = useState<string | null>(null);
  const isTransitioningRef = useRef(false);
  const { emblaRef, emblaApi, selectedIndex, scrollTo, scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCardCarousel();

  useEffect(() => {
    if (isHydrated && (!questionCategory || !question || !spread)) {
      router.replace("/");
    }
  }, [isHydrated, questionCategory, question, spread, router]);

  useEffect(() => {
    // Shuffle only after mount (client-only randomness) so the SSR markup
    // has no card order to mismatch against during hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffledPool(buildShuffledPool(tarotCards));
  }, []);

  useEffect(() => {
    if (!emblaApi || !shuffledPool) return;
    const center = Math.max(0, Math.floor((shuffledPool.length - 1) / 2));
    emblaApi.scrollTo(center, true);
    // Only re-center once, right after the pool is shuffled — picking/
    // unpicking cards afterward must never jump the carousel around.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi, shuffledPool !== null]);

  if (!isHydrated || !questionCategory || !question || !spread || !shuffledPool) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const isComplete = selectedCards.length === spread.cardCount;
  const selectedIds = new Set(selectedCards.map((c) => c.cardId));

  const handleCardTap = (index: number, cardId: string) => {
    if (isTransitioningRef.current) return;
    if (index !== selectedIndex) {
      scrollTo(index);
      return;
    }
    if (selectedIds.has(cardId)) {
      unpickCard(cardId);
      return;
    }
    if (isComplete) return;
    isTransitioningRef.current = true;
    setJustSelectedId(cardId);
    window.setTimeout(() => {
      pickCard(cardId);
      setJustSelectedId(null);
      isTransitioningRef.current = false;
    }, SELECT_ANIMATION_MS);
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={3}
        totalSteps={4}
        categoryLabel={category?.label}
        title={`${spread.cardCount}장 리딩`}
        trailing={`${selectedCards.length} / ${spread.cardCount} 선택됨`}
      />

      <SelectedCardSlots positions={spread.positions} filledCount={selectedCards.length} />

      <p className={styles.hint}>
        {isComplete
          ? "마음에 드는 카드 3장을 모두 골랐어요."
          : "마음이 가는 카드를 눌러 골라보세요. 다시 누르면 선택을 취소할 수 있어요."}
      </p>

      <div className={styles.carouselRow}>
        <CarouselArrowButton direction="prev" onClick={scrollPrev} disabled={!canScrollPrev} />

        <div className={styles.viewport} ref={emblaRef} data-testid="card-carousel">
          <div className={styles.track}>
            {shuffledPool.map((card, index) => {
              const isCenter = index === selectedIndex;
              const isJustSelected = justSelectedId === card.id;
              const isSelected = selectedIds.has(card.id);
              return (
                <div className={styles.slide} key={card.id}>
                  <button
                    type="button"
                    className={`${styles.card} ${isCenter ? styles.cardCenter : ""} ${
                      isJustSelected ? styles.cardPicked : ""
                    } ${isSelected ? styles.cardSelected : ""}`}
                    onClick={() => handleCardTap(index, card.id)}
                    aria-pressed={isSelected}
                    aria-label={isSelected ? "선택된 타로 카드, 다시 눌러 선택 취소" : "타로 카드"}
                  >
                    <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
                    {isSelected ? <span className={styles.checkBadge}>✓</span> : null}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <CarouselArrowButton direction="next" onClick={scrollNext} disabled={!canScrollNext} />
      </div>

      <div className={styles.spacer} />

      <PrimaryButton onClick={() => router.push("/reveal")} disabled={!isComplete}>
        카드 확인하기
      </PrimaryButton>
    </main>
  );
}
