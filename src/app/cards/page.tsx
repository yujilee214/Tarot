"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import CarouselArrowButton from "@/components/CarouselArrowButton";
import { tarotCards, CARD_BACK_IMAGE, type TarotCard } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
import { buildShuffledPool, excludeCards } from "@/lib/cardSelection";
import { useCardCarousel } from "@/lib/useCardCarousel";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const SELECT_ANIMATION_MS = 550;

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards, pickCard } =
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

  const remainingPool = useMemo(() => {
    if (!shuffledPool) return [];
    return excludeCards(shuffledPool, selectedCards.map((c) => c.cardId));
  }, [shuffledPool, selectedCards]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    const center = Math.max(0, Math.floor((remainingPool.length - 1) / 2));
    emblaApi.scrollTo(center, true);
  }, [emblaApi, remainingPool.length]);

  if (!isHydrated || !questionCategory || !question || !spread || !shuffledPool) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const isComplete = selectedCards.length === spread.cardCount;
  const currentPosition = spread.positions[selectedCards.length];

  const handleCardTap = (index: number, cardId: string) => {
    if (isTransitioningRef.current || isComplete) return;
    if (index !== selectedIndex) {
      scrollTo(index);
      return;
    }
    isTransitioningRef.current = true;
    setJustSelectedId(cardId);
    window.setTimeout(() => {
      pickCard(cardId);
      setJustSelectedId(null);
      isTransitioningRef.current = false;
    }, SELECT_ANIMATION_MS);
  };

  if (isComplete) {
    return (
      <main className="screen">
        <ProgressHeader
          step={3}
          totalSteps={4}
          categoryLabel={category?.label}
          title="카드를 모두 골랐어요."
          trailing={`${spread.cardCount} / ${spread.cardCount}`}
        />

        <div className={styles.doneStage}>
          <div className={styles.doneRow}>
            {selectedCards.map((selected) => (
              <img
                key={selected.cardId}
                src={CARD_BACK_IMAGE}
                alt=""
                draggable={false}
                className={styles.doneCard}
              />
            ))}
          </div>
        </div>

        <div className={styles.spacer} />

        <PrimaryButton onClick={() => router.push("/reveal")}>카드 확인하기</PrimaryButton>
      </main>
    );
  }

  return (
    <main className="screen">
      <ProgressHeader
        step={3}
        totalSteps={4}
        categoryLabel={category?.label}
        title={currentPosition.description.replace(/\n/g, " ")}
        trailing={`${selectedCards.length + 1} / ${spread.cardCount}`}
      />

      <div className={styles.carouselRow}>
        <CarouselArrowButton direction="prev" onClick={scrollPrev} disabled={!canScrollPrev} />

        <div className={styles.viewport} ref={emblaRef} data-testid="card-carousel">
          <div className={styles.track}>
            {remainingPool.map((card, index) => {
              const isCenter = index === selectedIndex;
              const isJustSelected = justSelectedId === card.id;
              return (
                <div className={styles.slide} key={card.id}>
                  <button
                    type="button"
                    className={`${styles.card} ${isCenter ? styles.cardCenter : ""} ${
                      isJustSelected ? styles.cardPicked : ""
                    }`}
                    onClick={() => handleCardTap(index, card.id)}
                    aria-label="타로 카드"
                  >
                    <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <CarouselArrowButton direction="next" onClick={scrollNext} disabled={!canScrollNext} />
      </div>
    </main>
  );
}
