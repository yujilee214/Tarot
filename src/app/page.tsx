"use client";

import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/PrimaryButton";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="screen">
      <section className={styles.hero}>
        <span className={styles.wordmark}>LUNA TAROT</span>
        <h1 className={styles.title}>마음에 걸리는 일이 있나요?</h1>
        <p className={styles.subtitle}>
          지금 궁금한 마음을 떠올리고 카드를 골라보세요.
          <br />
          선택한 카드의 흐름을 바탕으로 자세히 읽어드릴게요.
        </p>
        <PrimaryButton onClick={() => router.push("/category")}>
          타로 보러가기
        </PrimaryButton>
      </section>
    </main>
  );
}
