"use client";

import type { Category } from "@/data/categories";
import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  category: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryCard({ category, onSelect }: CategoryCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onSelect(category)}
    >
      <span className={styles.label}>{category.label}</span>
      <span className={styles.englishLabel}>{category.englishLabel}</span>
      <span className={styles.description}>{category.description}</span>
    </button>
  );
}
