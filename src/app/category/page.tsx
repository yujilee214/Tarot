"use client";

import { useRouter } from "next/navigation";
import ProgressHeader from "@/components/ProgressHeader";
import CategoryCard from "@/components/CategoryCard";
import { categories, type Category } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function CategoryPage() {
  const router = useRouter();
  const { setQuestionCategory } = useTarotFlow();

  const handleSelect = (category: Category) => {
    setQuestionCategory(category.id);
    router.push("/question");
  };

  return (
    <main className="screen">
      <ProgressHeader
        step={1}
        totalSteps={4}
        title="어떤 걸 물어보고 싶나요?"
        subtitle="지금 가장 마음에 걸리는 주제를 골라주세요."
      />

      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} onSelect={handleSelect} />
        ))}
      </div>
    </main>
  );
}
