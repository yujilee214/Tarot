"use client";

import styles from "./TarotCardBack.module.css";

interface TarotCardBackProps {
  backImage: string;
  selected?: boolean;
  order?: number;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
}

export default function TarotCardBack({
  backImage,
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
      <img src={backImage} alt="" draggable={false} />
      {selected && order ? (
        <span className={styles.orderBadge}>{order}</span>
      ) : null}
    </button>
  );
}
