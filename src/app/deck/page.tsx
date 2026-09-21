"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import DeckCard from "@/components/DeckCard";
import { tarotDecks } from "@/data/decks";
import { getCategoryById } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function DeckSelectPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, deckId, setDeckId } =
    useTarotFlow();
  const [draftDeckId, setDraftDeckId] = useState<string | null>(deckId);

  useEffect(() => {
    if (isHydrated && (!categoryId || !question)) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, question, router]);

  if (!isHydrated || !categoryId || !question) {
    return null;
  }

  const category = getCategoryById(categoryId);

  const handleConfirm = () => {
    if (!draftDeckId) return;
    setDeckId(draftDeckId);
    router.push("/shuffle");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={2}
        totalSteps={4}
        categoryLabel={category?.label}
        title="오늘 어떤 카드와 이야기해볼까요?"
        subtitle="마음에 드는 덱을 골라주세요."
      />

      <div className={styles.deckScroll}>
        {tarotDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            selected={draftDeckId === deck.id}
            onSelect={(selected) => setDraftDeckId(selected.id)}
          />
        ))}
      </div>

      <div className={styles.spacer} />

      <PrimaryButton onClick={handleConfirm} disabled={!draftDeckId}>
        이 덱으로 시작하기
      </PrimaryButton>
    </main>
  );
}
