"use client";

import type { TarotSpreadPosition } from "@/data/spreads";
import { CARD_BACK_IMAGE } from "@/data/cardCatalog";
import styles from "./SelectedCardSlots.module.css";

interface SelectedCardSlotsProps {
  positions: TarotSpreadPosition[];
  filledCount: number;
}

export default function SelectedCardSlots({ positions, filledCount }: SelectedCardSlotsProps) {
  return (
    <div className={styles.row}>
      {positions.map((position, index) => {
        const isFilled = index < filledCount;
        return (
          <div key={position.order} className={styles.slot}>
            <div className={`${styles.slotCard} ${isFilled ? styles.slotFilled : ""}`}>
              {isFilled ? (
                <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
              ) : (
                <span className={styles.slotNumber}>{position.order}</span>
              )}
            </div>
            <span className={styles.slotLabel}>{position.title}</span>
          </div>
        );
      })}
    </div>
  );
}
