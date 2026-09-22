"use client";

import type { TarotSpreadPosition } from "@/data/spreads";
import type { SelectedCard } from "@/context/TarotFlowContext";
import type { TarotCard } from "@/data/cardCatalog";
import styles from "./SelectedCardSlots.module.css";

interface SelectedCardSlotsProps {
  positions: TarotSpreadPosition[];
  selectedCards: SelectedCard[];
  getCard: (id: string) => TarotCard | undefined;
}

/**
 * Read-only "already drawn" summary (product spec: no cancel/undo once a
 * card is drawn — each pick is immediately revealed and final), so unlike
 * the picking deck this only ever displays, never handles clicks.
 */
export default function SelectedCardSlots({
  positions,
  selectedCards,
  getCard,
}: SelectedCardSlotsProps) {
  return (
    <div className={styles.row}>
      {positions.map((position, index) => {
        const selected = selectedCards[index];
        const card = selected ? getCard(selected.cardId) : undefined;
        return (
          <div key={position.order} className={styles.slot}>
            <span className={styles.slotLabel}>
              {position.order}. {position.title}
            </span>
            {card ? (
              <div className={styles.slotCard}>
                <img src={card.image} alt={card.koreanName} draggable={false} />
              </div>
            ) : (
              <div className={styles.slotCard}>
                <span className={styles.slotEmpty}>아직 선택 전</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
