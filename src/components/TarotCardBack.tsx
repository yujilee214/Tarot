"use client";

import { CARD_BACK_IMAGE } from "@/data/tarotCards";
import styles from "./TarotCardBack.module.css";

interface TarotCardBackProps {
  selected?: boolean;
  order?: number;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}

export default function TarotCardBack({
  selected = false,
  order,
  disabled = false,
  onClick,
  label,
}: TarotCardBackProps) {
  const classNames = [
    styles.card,
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled && !selected}
      aria-pressed={selected}
      aria-label={label ?? "타로 카드"}
    >
      <img src={CARD_BACK_IMAGE} alt="" draggable={false} />
      {selected && order ? (
        <span className={styles.orderBadge}>{order}</span>
      ) : null}
    </button>
  );
}
