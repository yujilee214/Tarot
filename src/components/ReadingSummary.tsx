import styles from "./ReadingSection.module.css";

interface ReadingSummaryProps {
  summary: string;
}

export default function ReadingSummary({ summary }: ReadingSummaryProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>카드가 보여주는 지금의 흐름</h2>
      <p className={styles.body}>{summary}</p>
    </div>
  );
}
