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

interface TarotFlowState {
  categoryId: string | null;
  question: string;
  deckId: string | null;
  selectedCardIds: string[];
}

interface TarotFlowContextValue extends TarotFlowState {
  isHydrated: boolean;
  setCategoryId: (categoryId: string) => void;
  setQuestion: (question: string) => void;
  setDeckId: (deckId: string) => void;
  setSelectedCardIds: (ids: string[]) => void;
  reset: () => void;
}

const STORAGE_KEY = "tarot-flow-state";

const initialState: TarotFlowState = {
  categoryId: null,
  question: "",
  deckId: null,
  selectedCardIds: [],
};

const TarotFlowContext = createContext<TarotFlowContextValue | null>(null);

export function TarotFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TarotFlowState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TarotFlowState>;
        // Deliberate one-time sync from sessionStorage after mount, so the
        // server-rendered (storage-less) markup matches the client on hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({
          categoryId: parsed.categoryId ?? null,
          question: parsed.question ?? "",
          deckId: parsed.deckId ?? null,
          selectedCardIds: Array.isArray(parsed.selectedCardIds)
            ? parsed.selectedCardIds
            : [],
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

  const setCategoryId = useCallback((categoryId: string) => {
    setState((prev) => ({ ...prev, categoryId }));
  }, []);

  const setQuestion = useCallback((question: string) => {
    setState((prev) => ({ ...prev, question }));
  }, []);

  const setDeckId = useCallback((deckId: string) => {
    setState((prev) => ({ ...prev, deckId }));
  }, []);

  const setSelectedCardIds = useCallback((selectedCardIds: string[]) => {
    setState((prev) => ({ ...prev, selectedCardIds }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<TarotFlowContextValue>(
    () => ({
      ...state,
      isHydrated,
      setCategoryId,
      setQuestion,
      setDeckId,
      setSelectedCardIds,
      reset,
    }),
    [
      state,
      isHydrated,
      setCategoryId,
      setQuestion,
      setDeckId,
      setSelectedCardIds,
      reset,
    ]
  );

  return (
    <TarotFlowContext.Provider value={value}>
      {children}
    </TarotFlowContext.Provider>
  );
}

export function useTarotFlow(): TarotFlowContextValue {
  const context = useContext(TarotFlowContext);
  if (!context) {
    throw new Error("useTarotFlow must be used within a TarotFlowProvider");
  }
  return context;
}
