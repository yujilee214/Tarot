"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TarotSpread, TarotSpreadPosition } from "@/data/spreads";
import type { Orientation } from "@/data/cardTypes";

export interface SelectedCard {
  order: number;
  cardId: string;
  position: TarotSpreadPosition;
  orientation: Orientation;
}

interface TarotSessionState {
  questionCategory: string | null;
  question: string;
  spread: TarotSpread | null;
  selectedCards: SelectedCard[];
  /** 0 = spread not started yet; 1..cardCount = which pick is in progress/next. */
  currentStep: number;
}

interface TarotSessionContextValue extends TarotSessionState {
  isHydrated: boolean;
  setQuestionCategory: (id: string) => void;
  setQuestion: (question: string) => void;
  startSpread: (spread: TarotSpread) => void;
  pickCard: (cardId: string) => void;
  unpickCard: (cardId: string) => void;
  reset: () => void;
}

const STORAGE_KEY = "tarot-session";

const initialState: TarotSessionState = {
  questionCategory: null,
  question: "",
  spread: null,
  selectedCards: [],
  currentStep: 0,
};

const TarotSessionContext = createContext<TarotSessionContextValue | null>(null);

export function TarotFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TarotSessionState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TarotSessionState>;
        // Deliberate one-time sync from sessionStorage after mount, so the
        // server-rendered (storage-less) markup matches the client on hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({
          questionCategory: parsed.questionCategory ?? null,
          question: parsed.question ?? "",
          spread: parsed.spread ?? null,
          selectedCards: Array.isArray(parsed.selectedCards) ? parsed.selectedCards : [],
          currentStep: typeof parsed.currentStep === "number" ? parsed.currentStep : 0,
        });
      }
    } catch {
      // ignore malformed storage, fall back to defaults
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const setQuestionCategory = useCallback((questionCategory: string) => {
    setState((prev) => ({ ...prev, questionCategory }));
  }, []);

  const setQuestion = useCallback((question: string) => {
    setState((prev) => ({ ...prev, question }));
  }, []);

  const startSpread = useCallback((spread: TarotSpread) => {
    setState((prev) => ({ ...prev, spread, selectedCards: [], currentStep: 1 }));
  }, []);

  const pickCard = useCallback((cardId: string) => {
    setState((prev) => {
      if (!prev.spread) return prev;
      if (prev.selectedCards.some((c) => c.cardId === cardId)) return prev;
      if (prev.selectedCards.length >= prev.spread.cardCount) return prev;
      const order = prev.selectedCards.length + 1;
      const position = prev.spread.positions[order - 1];
      const nextSelected: SelectedCard[] = [
        ...prev.selectedCards,
        { order, cardId, position, orientation: "upright" },
      ];
      return {
        ...prev,
        selectedCards: nextSelected,
        currentStep: Math.min(nextSelected.length + 1, prev.spread.cardCount),
      };
    });
  }, []);

  const unpickCard = useCallback((cardId: string) => {
    setState((prev) => {
      if (!prev.spread) return prev;
      if (!prev.selectedCards.some((c) => c.cardId === cardId)) return prev;
      // Re-number remaining picks so they still line up with spread.positions[order - 1].
      const nextSelected: SelectedCard[] = prev.selectedCards
        .filter((c) => c.cardId !== cardId)
        .map((c, index) => ({
          ...c,
          order: index + 1,
          position: prev.spread!.positions[index],
        }));
      return {
        ...prev,
        selectedCards: nextSelected,
        currentStep: Math.min(nextSelected.length + 1, prev.spread.cardCount),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<TarotSessionContextValue>(
    () => ({
      ...state,
      isHydrated,
      setQuestionCategory,
      setQuestion,
      startSpread,
      pickCard,
      unpickCard,
      reset,
    }),
    [
      state,
      isHydrated,
      setQuestionCategory,
      setQuestion,
      startSpread,
      pickCard,
      unpickCard,
      reset,
    ]
  );

  return (
    <TarotSessionContext.Provider value={value}>{children}</TarotSessionContext.Provider>
  );
}

export function useTarotFlow(): TarotSessionContextValue {
  const context = useContext(TarotSessionContext);
  if (!context) {
    throw new Error("useTarotFlow must be used within a TarotFlowProvider");
  }
  return context;
}
