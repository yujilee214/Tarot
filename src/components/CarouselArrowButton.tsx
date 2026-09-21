"use client";

import styles from "./CarouselArrowButton.module.css";

interface CarouselArrowButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}

export default function CarouselArrowButton({
  direction,
  onClick,
  disabled,
}: CarouselArrowButtonProps) {
  return (
    <button
      type="button"
      className={styles.arrow}
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "이전 카드" : "다음 카드"}
    >
      {direction === "prev" ? "←" : "→"}
    </button>
  );
}
