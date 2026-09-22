"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import CarouselArrowButton from "@/components/CarouselArrowButton";
import SelectedCardSlots from "@/components/SelectedCardSlots";
import { tarotCards, getCardById, CARD_BACK_IMAGE, type TarotCard } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
import { buildShuffledPool } from "@/lib/cardSelection";
import { useScrollDeck } from "@/lib/useScrollDeck";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const ORDINALS = ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째"];
const NEXT_CTA = ["다음 카드 고르기", "마지막 카드 고르기"];

type Phase = "picking" | "revealed";

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards, pickCard } =
    useTarotFlow();
  const [shuffledPool, setShuffledPool] = useState<TarotCard[] | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const { containerRef, centerOnce, consumeWasDragged, scrollByAmount, canScrollPrev, canScrollNext } =
    useScrollDeck();

  useEffect(() => {
    if (isHydrated && (!questionCategory || !question || !spread)) {
      router.replace("/");
    }
  }, [isHydrated, questionCategory, question, spread, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffledPool(buildShuffledPool(tarotCards));
  }, []);

  useEffect(() => {
    // Resuming mid-reading (reload, or browser back from /result) must land
    // on wherever the session actually is — never restart card 1 — so the
    // already-picked cards can't be re-rolled by navigating around.
    if (isHydrated && phase === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase(selectedCards.length > 0 ? "revealed" : "picking");
    }
  }, [isHydrated, phase, selectedCards.length]);

  useEffect(() => {
    if (!shuffledPool || phase !== "picking") return;
    const raf = requestAnimationFrame(centerOnce);
    return () => cancelAnimationFrame(raf);
  }, [shuffledPool, phase, centerOnce]);

  if (!isHydrated || !questionCategory || !question || !spread || !shuffledPool || !phase) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const selectedIds = new Set(selectedCards.map((c) => c.cardId));
  const pickIndex = selectedCards.length; // which position we're filling next
  const isDone = selectedCards.length === spread.cardCount;
  const lastPicked = selectedCards[selectedCards.length - 1];
  const lastPickedCard = lastPicked ? getCardById(lastPicked.cardId) : undefined;

  const handleCardClick = (cardId: string) => {
    if (consumeWasDragged()) return;
    pickCard(cardId);
    setPhase("revealed");
  };

  const availableCards = shuffledPool.filter((card) => !selectedIds.has(card.id));
  const currentPosition = spread.positions[pickIndex];

  return (
    <main className="screen">
      <ProgressHeader
        step={3}
        totalSteps={4}
        categoryLabel={category?.label}
        title={
          phase === "picking"
            ? `${currentPosition.order}번째 카드 · ${currentPosition.title}`
            : `${ORDINALS[selectedCards.length - 1] ?? ""} 카드를 골랐어요.`
        }
        subtitle={phase === "picking" ? currentPosition.description : undefined}
        trailing={`${phase === "picking" ? currentPosition.order : selectedCards.length} / ${spread.cardCount}`}
      />

      <SelectedCardSlots positions={spread.positions} selectedCards={selectedCards} getCard={getCardById} />

      {phase === "picking" ? (
        <div className={styles.carouselRow}>
          <CarouselArrowButton
            direction="prev"
            onClick={() => scrollByAmount("prev")}
            disabled={!canScrollPrev}
          />

          <div className={styles.deckViewport} ref={containerRef} data-testid="card-deck">
            <div className={styles.deckTrack}>
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={styles.card}
                  onClick={() => handleCardClick(card.id)}
                  aria-label="타로 카드"
                >
                  <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
                </button>
              ))}
            </div>
          </div>

          <CarouselArrowButton
            direction="next"
            onClick={() => scrollByAmount("next")}
            disabled={!canScrollNext}
          />
        </div>
      ) : isDone ? (
        <div className={styles.summaryStage}>
          <div className={styles.summaryList}>
            {selectedCards.map((selected) => {
              const card = getCardById(selected.cardId);
              return (
                <div key={selected.cardId} className={styles.summaryRow}>
                  <span className={styles.summaryRole}>{selected.position.title}</span>
                  <span className={styles.summaryName}>{card?.koreanName}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.spacer} />

          <PrimaryButton onClick={() => router.push("/result")}>결과 확인하기</PrimaryButton>
        </div>
      ) : (
        <div className={styles.revealStage}>
          {lastPickedCard ? (
            <img
              className={styles.revealImage}
              src={lastPickedCard.image}
              alt={lastPickedCard.koreanName}
              draggable={false}
            />
          ) : null}

          <div className={styles.revealInfo}>
            <span className={styles.revealNameKo}>{lastPickedCard?.koreanName}</span>
            <span className={styles.revealNameEn}>{lastPickedCard?.name.toUpperCase()}</span>
            <span className={styles.revealRole}>{lastPicked?.position.title}</span>
          </div>

          <div className={styles.spacer} />

          <PrimaryButton onClick={() => setPhase("picking")}>
            {NEXT_CTA[selectedCards.length - 1] ?? "다음 카드 고르기"}
          </PrimaryButton>
        </div>
      )}
    </main>
  );
}
