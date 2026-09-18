import type { ReactNode } from "react";
import styles from "./ProgressHeader.module.css";

interface ProgressHeaderProps {
  step: number;
  totalSteps: number;
  categoryLabel?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

export default function ProgressHeader({
  step,
  totalSteps,
  categoryLabel,
  title,
  subtitle,
  trailing,
}: ProgressHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.stepTrack} aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`${styles.stepDot} ${
                index < step ? styles.stepDotActive : ""
              }`}
            />
          ))}
        </div>
        {categoryLabel ? (
          <span className={styles.categoryBadge} data-testid="progress-category">
            {categoryLabel}
          </span>
        ) : null}
      </div>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        {trailing ? (
          <div className={styles.trailing} data-testid="progress-trailing">
            {trailing}
          </div>
        ) : null}
      </div>
    </header>
  );
}
