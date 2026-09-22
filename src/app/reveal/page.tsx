"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import TarotCard from "@/components/TarotCard";
import CarouselArrowButton from "@/components/CarouselArrowButton";
import { getCardById, type TarotCard as TarotCardData } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
import { useCardCarousel } from "@/lib/useCardCarousel";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function RevealPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards } = useTarotFlow();
  const isValidSelection = Boolean(spread) && selectedCards.length === spread?.cardCount;
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const { emblaRef, selectedIndex, scrollNext, scrollPrev, canScrollPrev, canScrollNext } =
    useCardCarousel();

  useEffect(() => {
    if (isHydrated && (!questionCategory || !question || !spread || !isValidSelection)) {
      router.replace("/");
    }
  }, [isHydrated, questionCategory, question, spread, isValidSelection, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealed(selectedCards.map(() => false));
  }, [selectedCards]);

  const cards = useMemo(
    () =>
      selectedCards
        .map((selected) => {
          const card = getCardById(selected.cardId);
          return card ? { selected, card } : null;
        })
        .filter(
          (entry): entry is { selected: (typeof selectedCards)[number]; card: TarotCardData } =>
            entry !== null
        ),
    [selectedCards]
  );

  if (
    !isHydrated ||
    !questionCategory ||
    !question ||
    !spread ||
    !isValidSelection ||
    cards.length !== spread.cardCount ||
    revealed.length !== cards.length
  ) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const revealedCount = revealed.filter(Boolean).length;
  const allRevealed = revealedCount === cards.length;
  const current = cards[selectedIndex];
  const isCurrentRevealed = revealed[selectedIndex] ?? false;
  const hasNext = selectedIndex < cards.length - 1;

  const handleReveal = (index: number) => {
    setRevealed((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const headerTitle = allRevealed
    ? "카드가 모두 열렸어요."
    : revealedCount === 0
      ? "선택한 카드를 확인해볼까요?"
      : (current?.selected.position.title ?? "");

  return (
    <main className="screen">
      <ProgressHeader
        step={4}
        totalSteps={4}
        categoryLabel={category?.label}
        title={headerTitle}
        trailing={`${selectedIndex + 1} / ${cards.length}`}
      />

      <div className={styles.carouselRow}>
        <CarouselArrowButton direction="prev" onClick={scrollPrev} disabled={!canScrollPrev} />

        <div className={styles.viewport} ref={emblaRef} data-testid="reveal-carousel">
          <div className={styles.track}>
            {cards.map(({ card }, index) => (
              <div className={styles.slide} key={card.id}>
                <TarotCard
                  card={card}
                  revealed={revealed[index]}
                  onReveal={() => handleReveal(index)}
                />
              </div>
            ))}
          </div>
        </div>

        <CarouselArrowButton direction="next" onClick={scrollNext} disabled={!canScrollNext} />
      </div>

      <div className={styles.dots} aria-hidden="true">
        {cards.map(({ card }, index) => (
          <span
            key={card.id}
            className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ""}`}
          />
        ))}
      </div>

      <div className={styles.belowCard}>
        {!isCurrentRevealed ? (
          <p className={styles.hint}>카드를 눌러 확인해보세요.</p>
        ) : !allRevealed ? (
          <>
            <div className={styles.revealedInfo}>
              <span className={styles.cardNameKo}>{current?.card.koreanName}</span>
              <span className={styles.cardNameEn}>{current?.card.name.toUpperCase()}</span>
            </div>
            {hasNext ? (
              <PrimaryButton variant="outline" onClick={scrollNext}>
                다음 카드
              </PrimaryButton>
            ) : null}
          </>
        ) : (
          <>
            <div className={styles.previewRow}>
              {cards.map(({ card }) => (
                <img key={card.id} src={card.image} alt={card.koreanName} draggable={false} />
              ))}
            </div>
            <PrimaryButton onClick={() => router.push("/result")}>결과 확인하기</PrimaryButton>
          </>
        )}
      </div>

      <div className={styles.spacer} />
    </main>
  );
}
