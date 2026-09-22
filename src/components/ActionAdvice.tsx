import styles from "./ReadingSection.module.css";

interface ActionAdviceProps {
  items: string[];
}

export default function ActionAdvice({ items }: ActionAdviceProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>지금은 이렇게 해보세요</h2>
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.listBullet} aria-hidden="true">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
