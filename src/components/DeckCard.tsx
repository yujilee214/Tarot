"use client";

import type { TarotDeck } from "@/data/decks";
import styles from "./DeckCard.module.css";

interface DeckCardProps {
  deck: TarotDeck;
  selected: boolean;
  onSelect: (deck: TarotDeck) => void;
}

export default function DeckCard({ deck, selected, onSelect }: DeckCardProps) {
  const previewCards = deck.cards.slice(0, 3);

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      style={{ borderColor: selected ? deck.theme.accent : undefined }}
      onClick={() => onSelect(deck)}
      aria-pressed={selected}
    >
      <div className={styles.previewRow}>
        {previewCards.map((card, index) => (
          <img
            key={card.id}
            src={card.image}
            alt=""
            draggable={false}
            className={styles.previewImage}
            style={{
              zIndex: index,
              transform: `rotate(${(index - 1) * 6}deg) translateX(${(index - 1) * -10}px)`,
            }}
          />
        ))}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{deck.name}</h3>
        <span className={styles.englishName}>{deck.englishName}</span>
        <p className={styles.description}>{deck.description}</p>
        <div className={styles.moodRow}>
          {deck.mood.map((word) => (
            <span
              key={word}
              className={styles.moodTag}
              style={{ color: deck.theme.accent, borderColor: deck.theme.accent }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
      {selected ? (
        <span
          className={styles.selectedBadge}
          style={{ background: deck.theme.accent }}
        >
          선택됨
        </span>
      ) : null}
    </button>
  );
}
