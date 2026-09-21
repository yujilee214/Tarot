"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

/**
 * Bounded (non-looping), center-aligned carousel shared by deck/card
 * selection and card reveal. Beyond touch/drag (which embla gives us for
 * free on both mouse and touch pointers), this also wires up:
 *  - left/right arrow button handlers, for people who don't think to drag
 *  - mouse wheel / trackpad horizontal scroll, debounced to one card per
 *    gesture so a fast wheel spin can't skip past several cards at once
 * so the carousel is fully usable on desktop, not just via drag.
 */
export function useCardCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: "trimSnaps",
    skipSnaps: false,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Sync initial carousel position once embla mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Mouse wheel / trackpad support: one card per gesture, in either axis.
  useEffect(() => {
    if (!emblaApi) return;
    const node = emblaApi.rootNode();
    let locked = false;

    const handleWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8) return;
      event.preventDefault();
      if (locked) return;
      locked = true;
      if (delta > 0) emblaApi.scrollNext();
      else emblaApi.scrollPrev();
      window.setTimeout(() => {
        locked = false;
      }, 350);
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return {
    emblaRef,
    emblaApi,
    selectedIndex,
    scrollTo,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  };
}
