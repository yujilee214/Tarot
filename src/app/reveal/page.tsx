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
  const { emblaRef, selectedIndex, scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
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
        step={4}
        totalSteps={4}
        categoryLabel={category?.label}
        title="카드를 눌러 순서대로 확인해보세요"
        subtitle="좌우로 넘기며 한 장씩 천천히 뒤집어보세요."
        trailing={`${revealedCount} / ${cards.length}`}
      />

      <span className={styles.roleTitle}>{cards[selectedIndex]?.selected.position.title}</span>

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

      <div className={styles.spacer} />

      <PrimaryButton onClick={() => router.push("/result")} disabled={!allRevealed}>
        결과 보기
      </PrimaryButton>
    </main>
  );
}
