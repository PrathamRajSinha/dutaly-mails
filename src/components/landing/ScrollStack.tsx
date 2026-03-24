import React, { ReactNode, useLayoutEffect, useRef, useCallback } from "react";
import Lenis from "lenis";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div
    className={`scroll-stack-card relative w-full my-8 rounded-2xl ${itemClassName}`.trim()}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>(0);
  const stackCompleteRef = useRef(false);

  const updateCards = useCallback(() => {
    const container = scrollerRef.current;
    if (!container) return;

    const scrollTop = useWindowScroll
      ? window.scrollY
      : container.scrollTop;

    const cards = container.querySelectorAll<HTMLDivElement>(".scroll-stack-card");
    const viewportHeight = window.innerHeight;
    const stackPos = (parseFloat(stackPosition) / 100) * viewportHeight;
    const scaleEndPos = (parseFloat(scaleEndPosition) / 100) * viewportHeight;
    const totalCards = cards.length;

    let allStacked = true;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardTop = useWindowScroll
        ? rect.top
        : rect.top - container.getBoundingClientRect().top + scrollTop;
      const actualCardTop = useWindowScroll ? rect.top : cardTop - scrollTop;
      const distanceFromStack = actualCardTop - stackPos;

      if (distanceFromStack > 0) {
        allStacked = false;
        card.style.transform = "translateY(0) scale(1) rotate(0deg)";
        card.style.filter = "blur(0px)";
        card.style.position = "relative";
        card.style.top = "0";
        card.style.zIndex = `${index}`;
        return;
      }

      const stackIndex = totalCards - 1 - index;
      const targetY = stackIndex * itemStackDistance;
      const progress = Math.min(
        1,
        Math.abs(distanceFromStack) / itemDistance
      );
      const currentY = targetY * progress;
      const targetScale =
        baseScale + (totalCards - 1 - stackIndex) * itemScale;
      const scaleProgress = Math.min(
        1,
        Math.abs(distanceFromStack) / (scaleEndPos + itemDistance)
      );
      const currentScale = 1 - (1 - targetScale) * scaleProgress;
      const rotation = rotationAmount * stackIndex * progress;
      const blur = blurAmount * stackIndex * progress;

      card.style.position = "sticky";
      card.style.top = `${stackPos}px`;
      card.style.zIndex = `${totalCards - stackIndex}`;
      card.style.transform = `translateY(${currentY}px) scale(${currentScale}) rotate(${rotation}deg)`;
      card.style.transition = `transform ${scaleDuration}s ease-out`;
      card.style.filter = blur > 0 ? `blur(${blur}px)` : "blur(0px)";
    });

    if (
      allStacked &&
      !stackCompleteRef.current &&
      onStackComplete
    ) {
      stackCompleteRef.current = true;
      onStackComplete();
    }
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
  ]);

  useLayoutEffect(() => {
    const container = scrollerRef.current;
    if (!container) return;

    if (useWindowScroll) {
      const onScroll = () => {
        rafRef.current = requestAnimationFrame(updateCards);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      updateCards();
      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafRef.current);
      };
    }

    const lenis = new Lenis({
      wrapper: container,
      content: container.firstElementChild as HTMLElement,
      smoothWheel: true,
      lerp: 0.1,
    });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      updateCards();
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, [updateCards, useWindowScroll]);

  if (useWindowScroll) {
    return (
      <div ref={scrollerRef} className={className}>
        {children}
        <div className="w-full h-px" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim()}
      ref={scrollerRef}
      style={{
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="pt-[20vh] px-4 sm:px-20 pb-[50rem] min-h-screen">
        {children}
        <div className="w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;
