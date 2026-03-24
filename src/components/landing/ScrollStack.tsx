import React, { ReactNode, useEffect, useRef } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
  children,
  itemClassName = "",
}) => (
  <div className={`scroll-stack-item ${itemClassName}`.trim()}>
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  cardHeight?: number;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  cardHeight = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLDivElement>(".scroll-stack-item");
    const totalCards = cards.length;
    if (totalCards === 0) return;

    const onScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // How far the container top has scrolled past the viewport top
      const scrolled = -containerRect.top;

      cards.forEach((card, i) => {
        const cardStart = i * cardHeight;
        const progress = Math.max(0, Math.min(1, (scrolled - cardStart) / cardHeight));
        
        if (scrolled < cardStart) {
          // Card hasn't reached sticky zone yet — natural position
          card.style.position = "relative";
          card.style.top = "0";
          card.style.zIndex = `${i}`;
          card.style.transform = "scale(1)";
          card.style.opacity = "1";
        } else {
          // Card is in sticky zone
          card.style.position = "sticky";
          card.style.top = `${Math.round(viewportH * 0.15)}px`;
          card.style.zIndex = `${totalCards + i}`;
          
          // Scale down slightly as next card comes in
          const isLast = i === totalCards - 1;
          if (!isLast) {
            const nextCardStart = (i + 1) * cardHeight;
            const nextProgress = Math.max(0, Math.min(1, (scrolled - nextCardStart) / cardHeight));
            const scale = 1 - nextProgress * 0.05;
            const yShift = nextProgress * 20;
            card.style.transform = `scale(${scale}) translateY(-${yShift}px)`;
            card.style.opacity = `${1 - nextProgress * 0.3}`;
          } else {
            card.style.transform = "scale(1)";
            card.style.opacity = "1";
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [cardHeight]);

  const childCount = React.Children.count(children);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: `${childCount * cardHeight + window.innerHeight * 0.5}px` }}
    >
      {React.Children.map(children, (child, i) => (
        <div
          key={i}
          style={{
            height: i < childCount - 1 ? `${cardHeight}px` : "auto",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default ScrollStack;
