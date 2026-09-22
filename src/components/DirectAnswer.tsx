import type { DirectAnswer as DirectAnswerData } from "@/lib/reading";
import styles from "./ReadingSection.module.css";

interface DirectAnswerProps {
  directAnswer: DirectAnswerData;
}

export default function DirectAnswer({ directAnswer }: DirectAnswerProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>{directAnswer.title}</h2>
      <p className={styles.body}>{directAnswer.body}</p>
    </div>
  );
}
