"use client";

import type { TarotSpreadPosition } from "@/data/spreads";
import type { SelectedCard } from "@/context/TarotFlowContext";
import { CARD_BACK_IMAGE } from "@/data/cardCatalog";
import styles from "./SelectedCardSlots.module.css";

interface SelectedCardSlotsProps {
  positions: TarotSpreadPosition[];
  selectedCards: SelectedCard[];
  onRemove: (cardId: string) => void;
}

export default function SelectedCardSlots({
  positions,
  selectedCards,
  onRemove,
}: SelectedCardSlotsProps) {
  return (
    <div className={styles.row}>
      {positions.map((position, index) => {
        const selected = selectedCards[index];
        return (
          <div key={position.order} className={styles.slot}>
            {selected ? (
              <button
                type="button"
                className={`${styles.slotCard} ${styles.slotFilled}`}
                onClick={() => onRemove(selected.cardId)}
                aria-label={`${position.title} 카드 선택 취소`}
              >
                <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
              </button>
            ) : (
              <div className={styles.slotCard}>
                <span className={styles.slotNumber}>{position.order}</span>
              </div>
            )}
            <span className={styles.slotLabel}>{position.title}</span>
          </div>
        );
      })}
    </div>
  );
}
