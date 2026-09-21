"use client";

import type { TarotCard as TarotCardData } from "@/data/decks";
import styles from "./TarotCard.module.css";

interface TarotCardProps {
  card: TarotCardData;
  backImage: string;
  revealed: boolean;
  onReveal: () => void;
}

export default function TarotCard({
  card,
  backImage,
  revealed,
  onReveal,
}: TarotCardProps) {
  return (
    <button
      type="button"
      className={styles.scene}
      onClick={() => {
        if (!revealed) onReveal();
      }}
      aria-label={revealed ? card.koreanName : "카드를 눌러 확인하기"}
    >
      <div className={`${styles.flipper} ${revealed ? styles.flipped : ""}`}>
        <div className={styles.faceFront}>
          <img src={backImage} alt="" draggable={false} />
          <span className={styles.tapHint}>눌러서 확인하기</span>
        </div>
        <div className={styles.faceBack}>
          <img src={card.image} alt={card.koreanName} draggable={false} />
        </div>
      </div>
    </button>
  );
}
