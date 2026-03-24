import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={itemClassName}>
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
  baseScale?: number;
  scaleEndPosition?: string;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemScale = 0.03,
  itemStackDistance = 30,
  baseScale = 0.9,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const cardRefsRef = useRef<(HTMLDivElement | null)[]>([]);
  const childArray = React.Children.toArray(children);
  const cardCount = childArray.length;

  const updateCards = useCallback(() => {
    const cards = cardRefsRef.current;
    if (!cards.length) return;

    cards.forEach((card, i) => {
      if (!card) return;

      let progress = 0;
      if (i < cardCount - 1) {
        const nextCard = cards[i + 1];
        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          const nextStickyTop = 100 + (i + 1) * itemStackDistance;
          const gap = nextRect.top - nextStickyTop;
          progress = Math.max(0, Math.min(1, 1 - gap / 300));
        }
      }

      const targetScale = baseScale + i * itemScale;
      const scale = 1 - progress * (1 - targetScale);
      const opacity = 1 - progress * 0.2;

      card.style.transform = `scale(${scale})`;
      card.style.opacity = `${opacity}`;
    });
  }, [cardCount, itemScale, itemStackDistance, baseScale]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateCards);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateCards();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateCards]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {childArray.map((child, i) => {
        const stickyTop = 100 + i * itemStackDistance;

        return (
          <div
            key={i}
            ref={(el) => { cardRefsRef.current[i] = el; }}
            className="sticky"
            style={{
              top: `${stickyTop}px`,
              zIndex: i + 1,
              transformOrigin: 'top center',
              willChange: 'transform, opacity',
              marginBottom: i < cardCount - 1 ? '350px' : '150px',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default ScrollStack;
