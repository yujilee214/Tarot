"use client";

import { CARD_BACK_IMAGE, type TarotCardData } from "@/data/tarotCards";
import styles from "./TarotCard.module.css";

interface TarotCardProps {
  card: TarotCardData;
  revealed: boolean;
  onReveal: () => void;
}

export default function TarotCard({ card, revealed, onReveal }: TarotCardProps) {
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
          <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
          <span className={styles.tapHint}>눌러서 확인하기</span>
        </div>
        <div className={styles.faceBack}>
          <img src={card.image} alt={card.koreanName} draggable={false} />
        </div>
      </div>
    </button>
  );
}
