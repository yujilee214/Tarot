import styles from "./ReadingSection.module.css";

interface CombinedReadingProps {
  combinedReading: string;
}

export default function CombinedReading({ combinedReading }: CombinedReadingProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>세 장을 함께 보면</h2>
      <p className={styles.body}>{combinedReading}</p>
    </div>
  );
}
