"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import QuestionInput from "@/components/QuestionInput";
import RecommendedQuestions from "@/components/RecommendedQuestions";
import { getCategoryById } from "@/data/categories";
import { getRecommendedQuestions, type RecommendedQuestion } from "@/data/recommendedQuestions";
import { selectSpread } from "@/data/spreads";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const PLACEHOLDER = "궁금한 상황을 자유롭게 적어주세요.";

export default function QuestionPage() {
  const router = useRouter();
  const { isHydrated, questionCategory, question, setQuestion, startSpread } = useTarotFlow();
  const [draft, setDraft] = useState(question);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isHydrated && !questionCategory) {
      router.replace("/");
    }
  }, [isHydrated, questionCategory, router]);

  if (!isHydrated || !questionCategory) {
    return null;
  }

  const category = getCategoryById(questionCategory);
  const recommendedQuestions = getRecommendedQuestions(questionCategory);
  const trimmed = draft.trim();
  const isValid = trimmed.length > 0;

  const handleSelectRecommended = (recommended: RecommendedQuestion) => {
    setDraft(recommended.question);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    setQuestion(trimmed);
    const spread = selectSpread(questionCategory, trimmed);
    startSpread(spread);
    router.push("/cards");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={2}
        totalSteps={4}
        categoryLabel={category?.label}
        title={category?.questionTitle ?? "무엇이 궁금한가요?"}
        subtitle="추천 질문을 골라도 좋고 직접 적어도 좋아요."
      />

      <RecommendedQuestions
        questions={recommendedQuestions}
        onSelect={handleSelectRecommended}
      />

      <div className={styles.inputGap} />

      <QuestionInput
        value={draft}
        onChange={setDraft}
        onBlur={() => setTouched(true)}
        placeholder={PLACEHOLDER}
        showError={touched && !isValid}
      />

      <div className={styles.spacer} />

      <PrimaryButton onClick={handleSubmit} disabled={!isValid}>
        이 질문으로 카드 뽑기
      </PrimaryButton>
    </main>
  );
}
