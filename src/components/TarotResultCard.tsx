import type { TarotCardData } from "@/data/tarotCards";
import styles from "./TarotResultCard.module.css";

interface TarotResultCardProps {
  card: TarotCardData;
  roleTitle: string;
}

export default function TarotResultCard({ card, roleTitle }: TarotResultCardProps) {
  return (
    <article className={styles.card} style={{ ["--card-accent" as string]: card.accent }}>
      <img className={styles.image} src={card.image} alt={card.koreanName} />
      <div className={styles.info}>
        <span className={styles.role}>{roleTitle}</span>
        <h3 className={styles.name}>
          {card.koreanName}
          <span className={styles.nameEn}> · {card.name}</span>
        </h3>
        <div className={styles.keywords}>
          {card.keywords.map((keyword) => (
            <span key={keyword} className={styles.keyword}>
              {keyword}
            </span>
          ))}
        </div>
        <p className={styles.interpretation}>{card.interpretation}</p>
      </div>
    </article>
  );
}
