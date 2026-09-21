import type { TarotCard } from "@/data/cardCatalog";
import styles from "./TarotResultCard.module.css";

interface TarotResultCardProps {
  card: TarotCard;
  roleTitle: string;
  body: string;
}

export default function TarotResultCard({ card, roleTitle, body }: TarotResultCardProps) {
  return (
    <article className={styles.card}>
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
        <p className={styles.interpretation}>{body}</p>
      </div>
    </article>
  );
}
