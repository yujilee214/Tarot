"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import CategoryCard from "@/components/CategoryCard";
import PrimaryButton from "@/components/PrimaryButton";
import { categories, type Category } from "@/data/categories";
import { useTarotFlow } from "@/context/TarotFlowContext";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const { setCategoryId } = useTarotFlow();
  const categorySectionRef = useRef<HTMLDivElement>(null);

  const handleSelectCategory = (category: Category) => {
    setCategoryId(category.id);
    router.push("/question");
  };

  const scrollToCategories = () => {
    categorySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="screen">
      <section className={styles.hero}>
        <span className={styles.wordmark}>LUNA TAROT</span>
        <h1 className={styles.title}>
          말하지 못한 고민에
          <br />
          카드가 조용히 답합니다
        </h1>
        <p className={styles.subtitle}>
          지금 마음에 걸리는 질문 하나를 떠올려보세요.
          <br />
          세 장의 카드가 그 흐름을 함께 비춰줄게요.
        </p>
        <PrimaryButton onClick={scrollToCategories}>타로 보러가기</PrimaryButton>
      </section>

      <section ref={categorySectionRef} className={styles.categorySection}>
        <h2 className={styles.categoryHeading}>어떤 고민이 궁금한가요?</h2>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={handleSelectCategory}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
