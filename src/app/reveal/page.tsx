"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import TarotCard from "@/components/TarotCard";
import { getDeckById, getCardInDeck } from "@/data/decks";
import { cardRoles } from "@/data/cardRoles";
import { getCategoryById } from "@/data/categories";
import { useCardCarousel } from "@/lib/useCardCarousel";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function RevealPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, deckId, selectedCardIds } =
    useTarotFlow();
  const deck = getDeckById(deckId);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const { emblaRef, selectedIndex } = useCardCarousel();

  const isValidSelection = selectedCardIds.length === 3;

  useEffect(() => {
    if (isHydrated && (!categoryId || !question || !deck || !isValidSelection)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, deck, isValidSelection, router]);

  const cards = useMemo(
    () =>
      deck
        ? selectedCardIds
            .map((id) => getCardInDeck(deck, id))
            .filter((card): card is NonNullable<typeof card> => Boolean(card))
        : [],
    [deck, selectedCardIds]
  );

  if (
    !isHydrated ||
    !categoryId ||
    !question ||
    !deck ||
    !isValidSelection ||
    cards.length !== 3
  ) {
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
        step={4}
        totalSteps={4}
        categoryLabel={category?.label}
        title="카드를 눌러 순서대로 확인해보세요"
        subtitle="좌우로 넘기며 한 장씩 천천히 뒤집어보세요."
        trailing={`${revealedCount} / 3`}
      />

      <span className={styles.roleTitle} style={{ color: deck.theme.accent }}>
        {cardRoles[selectedIndex]?.title}
      </span>

      <div className={styles.viewport} ref={emblaRef} data-testid="reveal-carousel">
        <div className={styles.track}>
          {cards.map((card, index) => (
            <div className={styles.slide} key={card.id}>
              <TarotCard
                card={card}
                backImage={deck.cardBackImage}
                revealed={revealed[index]}
                onReveal={() => handleReveal(index)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.dots} aria-hidden="true">
        {cards.map((card, index) => (
          <span
            key={card.id}
            className={`${styles.dot} ${index === selectedIndex ? styles.dotActive : ""}`}
            style={index === selectedIndex ? { background: deck.theme.accent } : undefined}
          />
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
