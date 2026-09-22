"use client";

import styles from "./QuestionInput.module.css";

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  showError?: boolean;
  maxLength?: number;
}

export default function QuestionInput({
  value,
  onChange,
  onBlur,
  placeholder,
  showError = false,
  maxLength = 200,
}: QuestionInputProps) {
  return (
    <div className={styles.field}>
      <textarea
        className={styles.textarea}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        rows={5}
        maxLength={maxLength}
      />
      <div className={styles.helperRow}>
        <span className={showError ? styles.helperError : styles.helper}>
          {showError
            ? "질문을 입력해야 다음 단계로 이동할 수 있어요."
            : "상황을 자세히 적을수록 더 구체적으로 읽어드릴 수 있어요."}
        </span>
        <span className={styles.count}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
