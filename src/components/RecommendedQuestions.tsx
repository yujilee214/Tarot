"use client";

import type { RecommendedQuestion } from "@/data/recommendedQuestions";
import styles from "./RecommendedQuestions.module.css";

interface RecommendedQuestionsProps {
  questions: RecommendedQuestion[];
  onSelect: (question: RecommendedQuestion) => void;
}

export default function RecommendedQuestions({ questions, onSelect }: RecommendedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className={styles.list} role="list">
      {questions.map((question) => (
        <button
          key={question.id}
          type="button"
          role="listitem"
          className={styles.chip}
          onClick={() => onSelect(question)}
        >
          {question.label}
        </button>
      ))}
    </div>
  );
}
