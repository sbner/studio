
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { getBgColorFromValue } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AnimatedNoteOverlayProps {
  note: Note;
  initialRect: DOMRect;
  targetRect: DOMRect;
  phase: 'preparing_to_expand' | 'expanding' | 'expanded_dialog_open' | 'collapsing';
  onExpandAnimationEnd: () => void;
  onCollapseAnimationEnd: () => void;
  isDialogShowing: boolean;
}

const ANIMATION_DURATION = 400; // ms - Alterado de 900ms para 400ms
const OPACITY_TRANSITION_DURATION = Math.floor(ANIMATION_DURATION / 3);
const COLLAPSE_OPACITY_DELAY = Math.floor(ANIMATION_DURATION / 2);


export function AnimatedNoteOverlay({
  note,
  initialRect,
  targetRect,
  phase,
  onExpandAnimationEnd,
  onCollapseAnimationEnd,
  isDialogShowing,
}: AnimatedNoteOverlayProps) {
  const [currentStyles, setCurrentStyles] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const date = new Date(note.updatedAt).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const borderColor = note.colorTagValue ? getBgColorFromValue(note.colorTagValue) : 'transparent';

  useEffect(() => {
    const baseStyles: Omit<React.CSSProperties, 'zIndex' | 'opacity' | 'pointerEvents' | 'transition' | 'top' | 'left' | 'width' | 'height'> = {
        position: 'fixed',
        overflow: 'hidden',
    };

    if (phase === 'expanding' && initialRect && targetRect) {
        // Start at card position, fully opaque
        const expandingInitialStyles: React.CSSProperties = {
            ...baseStyles,
            zIndex: 50,
            top: `${initialRect.top}px`,
            left: `${initialRect.left}px`,
            width: `${initialRect.width}px`,
            height: `${initialRect.height}px`,
            opacity: 1,
            pointerEvents: 'auto', // Initially allow interaction if needed, though it's short-lived
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out`,
        };
        setCurrentStyles(expandingInitialStyles);

        // Trigger animation to target (dialog) position
        requestAnimationFrame(() => {
            setCurrentStyles(prevStyles => ({
                ...prevStyles,
                top: `${targetRect.top}px`,
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
                height: `${targetRect.height}px`,
            }));
        });
    } else if (phase === 'expanded_dialog_open' && targetRect) {
        // At dialog position, but fully transparent and non-interactive
        setCurrentStyles({
            ...baseStyles,
            zIndex: 40, // Behind dialog
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 0,
            pointerEvents: 'none',
            transition: `opacity ${OPACITY_TRANSITION_DURATION}ms ease-out`,
        });
    } else if (phase === 'collapsing' && initialRect && targetRect) {
        // Start at dialog position, fully opaque
        const collapsingInitialStyles: React.CSSProperties = {
            ...baseStyles,
            zIndex: 50,
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 1, // Start opaque
            pointerEvents: 'auto',
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out, opacity ${OPACITY_TRANSITION_DURATION}ms ease-in ${ANIMATION_DURATION - OPACITY_TRANSITION_DURATION}ms`, // Fade out at the end
        };
        setCurrentStyles(collapsingInitialStyles);

        // Trigger animation to initial (card) position and fade out
        requestAnimationFrame(() => {
            setCurrentStyles(prevStyles => ({
                ...prevStyles,
                top: `${initialRect.top}px`,
                left: `${initialRect.left}px`,
                width: `${initialRect.width}px`,
                height: `${initialRect.height}px`,
                opacity: 0, // End transparent
            }));
        });
    } else if (phase === 'preparing_to_expand' && initialRect) {
        // Positioned at the card, visible, before dialog is ready for measurement
        setCurrentStyles({
            ...baseStyles,
            zIndex: 50,
            top: `${initialRect.top}px`,
            left: `${initialRect.left}px`,
            width: `${initialRect.width}px`,
            height: `${initialRect.height}px`,
            opacity: 1,
            pointerEvents: 'auto',
            transition: 'none', // No transition yet, just position it
        });
    } else {
        // Idle or other states, ensure it's hidden
         setCurrentStyles({ opacity: 0, pointerEvents: 'none', zIndex: -1, transition: 'none' });
    }
  }, [phase, initialRect, targetRect]);


  useEffect(() => {
    const node = overlayRef.current;
    if (!node || !initialRect || !targetRect) return;

    let animationEndTimeoutId: NodeJS.Timeout | null = null;

    const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== node || !event.propertyName.match(/top|left|width|height|opacity/)) return;

        if (animationEndTimeoutId) clearTimeout(animationEndTimeoutId);

        animationEndTimeoutId = setTimeout(() => {
            const styles = window.getComputedStyle(node);
            const currentTop = parseFloat(styles.top);
            const currentLeft = parseFloat(styles.left);
            const currentOpacity = parseFloat(styles.opacity);

            if (phase === 'expanding') {
                // Check if dimensions and position match target
                if (Math.abs(currentTop - targetRect.top) < 2 && Math.abs(currentLeft - targetRect.left) < 2) { // Allow small tolerance
                    onExpandAnimationEnd();
                }
            } else if (phase === 'collapsing') {
                 // Check if dimensions and position match initial and opacity is 0
                if (Math.abs(currentTop - initialRect.top) < 2 && Math.abs(currentLeft - initialRect.left) < 2 && currentOpacity < 0.05) { // Allow small tolerance for opacity
                    onCollapseAnimationEnd();
                }
            }
        }, ANIMATION_DURATION + 100); // Add a small buffer, slightly more than transition duration
    };
    
    node.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      node.removeEventListener('transitionend', handleTransitionEnd);
      if (animationEndTimeoutId) clearTimeout(animationEndTimeoutId);
    };
  // Rerun if critical props change, but be mindful of infinite loops.
  // initialRect/targetRect are DOMRects, can cause re-runs if not stable.
  // It's generally okay here as phase controls the logic.
  }, [phase, onExpandAnimationEnd, onCollapseAnimationEnd, initialRect, targetRect]);


  if (phase === 'idle' && !isDialogShowing) {
    return null;
  }

  return (
    <div ref={overlayRef} style={currentStyles} className="overflow-hidden">
      <Card 
        className="flex flex-col h-full w-full shadow-xl"
        style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: borderColor }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">{note.title}</CardTitle>
          <CardDescription className="text-xs">
            Última atualização: {date}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-4 overflow-y-auto">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {note.content}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    

    