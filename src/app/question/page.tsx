"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import PrimaryButton from "@/components/PrimaryButton";
import QuestionInput from "@/components/QuestionInput";
import { getCategoryById } from "@/data/categories";
import { selectSpread } from "@/data/spreads";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

const PLACEHOLDER = "요즘 연락하고 있는 사람과 앞으로 어떻게 될까요?";

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
  const trimmed = draft.trim();
  const isValid = trimmed.length > 0;

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
        title="조금 더 자세히 알려주세요."
        subtitle="궁금한 내용을 자유롭게 적어주세요."
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
