"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./PrimaryButton.module.css";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "solid" | "outline";
}

export default function PrimaryButton({
  children,
  variant = "solid",
  className,
  ...rest
}: PrimaryButtonProps) {
  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...rest}>
      {children}
    </button>
  );
}
