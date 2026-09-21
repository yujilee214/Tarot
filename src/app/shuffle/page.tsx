"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDeckById } from "@/data/decks";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const SHUFFLE_DURATION_MS = 1600;

export default function ShufflePage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, deckId } = useTarotFlow();
  const deck = getDeckById(deckId);

  useEffect(() => {
    if (isHydrated && (!categoryId || !question || !deck)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, deck, router]);

  useEffect(() => {
    if (!isHydrated || !deck) return;
    const timer = window.setTimeout(() => {
      router.replace("/cards");
    }, SHUFFLE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isHydrated, deck, router]);

  if (!isHydrated || !categoryId || !question || !deck) {
    return null;
  }

  return (
    <main className={`screen ${styles.screen}`}>
      <div className={styles.stage}>
        {Array.from({ length: 5 }).map((_, index) => (
          <img
            key={index}
            src={deck.cardBackImage}
            alt=""
            draggable={false}
            className={styles.card}
            style={{ animationDelay: `${index * 60}ms` }}
            data-index={index}
          />
        ))}
      </div>
      <p className={styles.message}>질문을 떠올리며 카드를 섞어볼게요.</p>
    </main>
  );
}
