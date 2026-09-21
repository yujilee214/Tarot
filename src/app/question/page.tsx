"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import QuestionInput from "@/components/QuestionInput";
import { getCategoryById } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const PLACEHOLDER = "요즘 연락하는 사람과 앞으로 어떻게 될까요?";

export default function QuestionPage() {
  const router = useRouter();
  const { isHydrated, categoryId, question, setQuestion } = useTarotFlow();
  const [draft, setDraft] = useState(question);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isHydrated && !categoryId) {
      router.replace("/");
    }
  }, [isHydrated, categoryId, router]);

  if (!isHydrated || !categoryId) {
    return null;
  }

  const category = getCategoryById(categoryId);
  const trimmed = draft.trim();
  const isValid = trimmed.length > 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    setQuestion(trimmed);
    router.push("/cards");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={1}
        totalSteps={3}
        categoryLabel={category?.label}
        title="지금 가장 궁금한 질문은 무엇인가요?"
        subtitle="구체적으로 적을수록 카드의 이야기가 더 선명해져요."
      />

      <QuestionInput
        value={draft}
        onChange={setDraft}
        onBlur={() => setTouched(true)}
        placeholder={PLACEHOLDER}
        showError={touched && !isValid}
      />

      <div className={styles.spacer} />

      <PrimaryButton onClick={handleSubmit} disabled={!isValid}>
        카드 뽑으러 가기
      </PrimaryButton>
    </main>
  );
}
