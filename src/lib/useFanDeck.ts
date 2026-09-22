"use client";

import { useCallback, useEffect, useRef } from "react";

const DRAG_CLICK_THRESHOLD_PX = 6;

/**
 * Free-scrolling horizontal deck: native touch scrolling (swipe/flick) plus
 * mouse-drag-to-scroll and wheel-to-horizontal for desktop. Deliberately
 * has no concept of "slides" or snap points — the deck stops wherever the
 * user releases it (product spec: card selection must never re-center or
 * snap). Only the card-selection screen uses this; card reveal keeps the
 * separate snap-based `useCardCarousel`.
 */
export function useFanDeck() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownRef = useRef(false);
  const draggedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasCenteredRef = useRef(false);

  // Center the deck once, right after its content is first laid out.
  // Never runs again afterward, so picking/unpicking cards can't move it.
  const centerOnce = useCallback(() => {
    const node = containerRef.current;
    if (!node || hasCenteredRef.current) return;
    const max = node.scrollWidth - node.clientWidth;
    if (max <= 0) return;
    node.scrollLeft = max / 2;
    hasCenteredRef.current = true;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      event.preventDefault();
      node.scrollLeft += delta;
    };

    const handleMouseDown = (event: MouseEvent) => {
      isPointerDownRef.current = true;
      draggedRef.current = false;
      startXRef.current = event.clientX;
      startScrollLeftRef.current = node.scrollLeft;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerDownRef.current) return;
      const dx = event.clientX - startXRef.current;
      if (Math.abs(dx) > DRAG_CLICK_THRESHOLD_PX) {
        draggedRef.current = true;
      }
      node.scrollLeft = startScrollLeftRef.current - dx;
    };

    const endDrag = () => {
      isPointerDownRef.current = false;
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    node.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", endDrag);
    node.addEventListener("mouseleave", endDrag);

    return () => {
      node.removeEventListener("wheel", handleWheel);
      node.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
      node.removeEventListener("mouseleave", endDrag);
    };
  }, []);

  /** A card's onClick should call this first and bail out if it returns true. */
  const consumeWasDragged = useCallback(() => {
    const was = draggedRef.current;
    draggedRef.current = false;
    return was;
  }, []);

  return { containerRef, centerOnce, consumeWasDragged };
}
