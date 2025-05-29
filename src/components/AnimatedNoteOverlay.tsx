
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { getBgColorFromValue } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AnimatedNoteOverlayProps {
  note: Note;
  initialRect: DOMRect;
  targetRect: DOMRect;
  phase: 'expanding' | 'expanded_dialog_open' | 'collapsing';
  onExpandAnimationEnd: () => void;
  onCollapseAnimationEnd: () => void;
  isDialogShowing: boolean;
}

const ANIMATION_DURATION = 900; // ms
const OPACITY_TRANSITION_DURATION = Math.floor(ANIMATION_DURATION / 3); // Make fade out/in quicker
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
        const expandingInitialStyles: React.CSSProperties = {
            ...baseStyles,
            zIndex: 50, // On top during expansion
            top: `${initialRect.top}px`,
            left: `${initialRect.left}px`,
            width: `${initialRect.width}px`,
            height: `${initialRect.height}px`,
            opacity: 1,
            pointerEvents: 'auto',
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out`,
        };
        setCurrentStyles(expandingInitialStyles);

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
        // Overlay should be invisible and non-interactive, behind the dialog
        setCurrentStyles({
            ...baseStyles,
            zIndex: 40, // Behind dialog (dialog is z-50)
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 0,
            pointerEvents: 'none',
            transition: `opacity ${OPACITY_TRANSITION_DURATION}ms ease-out`,
        });
    } else if (phase === 'collapsing' && initialRect && targetRect) {
        // Starts at dialog position, opaque, then animates to card and fades
        const collapsingInitialStyles: React.CSSProperties = {
            ...baseStyles,
            zIndex: 50, // On top during collapse
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 1, // Start opaque
            pointerEvents: 'auto',
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out, opacity ${OPACITY_TRANSITION_DURATION}ms ease-in ${ANIMATION_DURATION - OPACITY_TRANSITION_DURATION}ms`, // Fade out at the end of collapse
        };
        setCurrentStyles(collapsingInitialStyles);

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
    } else if (phase === 'idle') {
        setCurrentStyles({ opacity: 0, pointerEvents: 'none', zIndex: -1 });
    }
  }, [phase, initialRect, targetRect]);


  useEffect(() => {
    const node = overlayRef.current;
    if (!node || !initialRect || !targetRect) return;

    let animationEndTimeoutId: NodeJS.Timeout | null = null;

    const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== node) return;

        // Using a timeout as a more reliable way to detect end of complex animations
        // The specific property check can be fragile.
        if (animationEndTimeoutId) clearTimeout(animationEndTimeoutId);

        animationEndTimeoutId = setTimeout(() => {
            const styles = window.getComputedStyle(node);
            const currentTop = parseFloat(styles.top);
            const currentLeft = parseFloat(styles.left);
            const currentOpacity = parseFloat(styles.opacity);

            if (phase === 'expanding') {
                // Check if dimensions and position match target
                if (Math.abs(currentTop - targetRect.top) < 1 && Math.abs(currentLeft - targetRect.left) < 1) {
                    onExpandAnimationEnd();
                }
            } else if (phase === 'collapsing') {
                 // Check if dimensions and position match initial and opacity is 0
                if (Math.abs(currentTop - initialRect.top) < 1 && Math.abs(currentLeft - initialRect.left) < 1 && currentOpacity < 0.01) {
                    onCollapseAnimationEnd();
                }
            }
        }, ANIMATION_DURATION + 50); // Add a small buffer
    };
    
    node.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      node.removeEventListener('transitionend', handleTransitionEnd);
      if (animationEndTimeoutId) clearTimeout(animationEndTimeoutId);
    };
  }, [phase, onExpandAnimationEnd, onCollapseAnimationEnd, initialRect, targetRect]);


  if (phase === 'idle' && !isDialogShowing) { // Also hide if idle and dialog isn't a factor
    return null;
  }

  // The component needs to exist in the DOM for transitions, even if opacity is 0.
  // The `expanded_dialog_open` phase relies on opacity 0 and zIndex to hide.

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

    