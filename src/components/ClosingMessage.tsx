import styles from "./ClosingMessage.module.css";

interface ClosingMessageProps {
  message: string;
}

export default function ClosingMessage({ message }: ClosingMessageProps) {
  return (
    <div className={styles.closing}>
      <span className={styles.label}>오늘의 카드 메시지</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
