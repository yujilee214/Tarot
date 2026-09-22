"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import SelectedCardSlots from "@/components/SelectedCardSlots";
import { tarotCards, CARD_BACK_IMAGE, type TarotCard } from "@/data/cardCatalog";
import { getCategoryById } from "@/data/categories";
import { buildShuffledPool } from "@/lib/cardSelection";
import { useFanDeck } from "@/lib/useFanDeck";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

// A smooth, continuously-repeating wave (no seams at the cycle boundary) so
// the fan/arc look is visible no matter where the deck is scrolled to —
// center-of-cycle cards sit upright and raised, edge-of-cycle cards tilt
// and dip, like a hand of cards spread on a table.
const CYCLE = 8;
const MAX_DEG = 14;
const MAX_DROP = 20;

function cardFanStyle(index: number): CSSProperties {
  const phase = (index / CYCLE) * Math.PI * 2;
  const deg = Math.sin(phase) * MAX_DEG;
  const arcY = Math.abs(Math.sin(phase)) * MAX_DROP;
  return { "--rot": `${deg}deg`, "--arc-y": `${arcY}px` } as CSSProperties;
}

const TOAST_MS = 1800;

export default function CardsPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, spread, selectedCards, pickCard, unpickCard } =
    useTarotFlow();
  const [shuffledPool, setShuffledPool] = useState<TarotCard[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const { containerRef, centerOnce, consumeWasDragged } = useFanDeck();

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
    if (!shuffledPool) return;
    const raf = requestAnimationFrame(centerOnce);
    return () => cancelAnimationFrame(raf);
  }, [shuffledPool, centerOnce]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!isHydrated || !questionCategory || !question || !spread || !shuffledPool) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const isComplete = selectedCards.length === spread.cardCount;
  const selectedIds = new Set(selectedCards.map((c) => c.cardId));

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), TOAST_MS);
  };

  const handleCardClick = (cardId: string) => {
    if (consumeWasDragged()) return;
    if (selectedIds.has(cardId)) {
      unpickCard(cardId);
      return;
    }
    if (isComplete) {
      showToast("카드는 3장까지 고를 수 있어요.");
      return;
    }
    pickCard(cardId);
  };

  return (
    <main className="screen">
      <div className={styles.topRow}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <ProgressHeader
          step={3}
          totalSteps={4}
          categoryLabel={category?.label}
          title={`${spread.cardCount}장 리딩`}
          trailing={`${selectedCards.length} / ${spread.cardCount}`}
        />
      </div>

      <p className={styles.hint}>마음이 가는 카드 3장을 골라주세요.</p>

      <div className={styles.deckViewport} ref={containerRef} data-testid="fan-deck">
        <div className={styles.deckTrack}>
          {shuffledPool.map((card, index) => {
            const isSelected = selectedIds.has(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                style={cardFanStyle(index)}
                onClick={() => handleCardClick(card.id)}
                aria-pressed={isSelected}
                aria-label={isSelected ? "선택된 타로 카드, 다시 눌러 선택 취소" : "타로 카드"}
              >
                <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
              </button>
            );
          })}
        </div>
      </div>

      <SelectedCardSlots
        positions={spread.positions}
        selectedCards={selectedCards}
        onRemove={unpickCard}
      />

      <p className={styles.orderHint}>
        먼저 고른 카드부터 {spread.positions.map((p) => p.title).join(" · ")}로 읽어요.
      </p>

      {toast ? (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      ) : null}

      <div className={styles.spacer} />

      <PrimaryButton onClick={() => router.push("/reveal")} disabled={!isComplete}>
        카드 확인하기
      </PrimaryButton>
    </main>
  );
}
