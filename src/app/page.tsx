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
        <h1 className={styles.title}>오늘 마음에 걸리는 게 있나요?</h1>
        <p className={styles.subtitle}>
          궁금한 마음을
          <br />
          카드에게 물어보세요.
        </p>
        <PrimaryButton onClick={() => router.push("/category")}>
          타로 보러가기
        </PrimaryButton>
      </section>
    </main>
  );
}
