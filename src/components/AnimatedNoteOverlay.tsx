
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { getBgColorFromValue } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; // Assuming Card parts can be used
import { cn } from '@/lib/utils';

interface AnimatedNoteOverlayProps {
  note: Note;
  initialRect: DOMRect;
  targetRect: DOMRect;
  phase: 'expanding' | 'expanded_dialog_open' | 'collapsing';
  onExpandAnimationEnd: () => void;
  onCollapseAnimationEnd: () => void;
  isDialogShowing: boolean;
}

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
    if (phase === 'expanding' && initialRect && targetRect) {
      setCurrentStyles({
        position: 'fixed',
        top: `${initialRect.top}px`,
        left: `${initialRect.left}px`,
        width: `${initialRect.width}px`,
        height: `${initialRect.height}px`,
        opacity: 1,
        zIndex: 50,
        transition: 'top 300ms ease-in-out, left 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, opacity 300ms ease-in-out',
      });

      // Trigger animation to target
      requestAnimationFrame(() => {
        setCurrentStyles({
          position: 'fixed',
          top: `${targetRect.top}px`,
          left: `${targetRect.left}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          opacity: 1, // Stays opaque during expansion
          zIndex: 50,
          transition: 'top 300ms ease-in-out, left 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, opacity 300ms ease-in-out',
        });
      });
    } else if (phase === 'collapsing' && initialRect && targetRect) {
       // Start from target (dialog) position, fully opaque
      setCurrentStyles({
        position: 'fixed',
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
        opacity: 1, 
        zIndex: 50,
        transition: 'top 300ms ease-in-out, left 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, opacity 300ms ease-in-out 150ms', // Delay opacity for collapse
      });
      
      // Trigger animation to initial card position and fade out
      requestAnimationFrame(() => {
        setCurrentStyles({
          position: 'fixed',
          top: `${initialRect.top}px`,
          left: `${initialRect.left}px`,
          width: `${initialRect.width}px`,
          height: `${initialRect.height}px`,
          opacity: 0, // Fade out as it shrinks
          zIndex: 50,
          transition: 'top 300ms ease-in-out, left 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, opacity 300ms ease-in-out 150ms',
        });
      });
    } else if (phase === 'expanded_dialog_open') {
        // Hide the overlay when dialog is fully open and overlay has expanded
        setCurrentStyles(prev => ({...prev, opacity: 0, transition: 'opacity 150ms ease-in-out' }));
    }

  }, [phase, initialRect, targetRect]);

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
      // Ensure we're listening to a property that signifies the end of the main animation
      if (event.propertyName === 'opacity') { 
        if (phase === 'expanding' && currentStyles.opacity === 1 && currentStyles.top === `${targetRect.top}px`) {
           onExpandAnimationEnd();
        } else if (phase === 'collapsing' && currentStyles.opacity === 0) {
          onCollapseAnimationEnd();
        }
      }
    };

    node.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      node.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [currentStyles, phase, onExpandAnimationEnd, onCollapseAnimationEnd, targetRect]);


  if (phase === 'idle' || (!initialRect && phase !== 'collapsing')) { // Also don't render if initialRect is missing unless collapsing
    return null;
  }

  return (
    <div ref={overlayRef} style={currentStyles} className="overflow-hidden">
      <Card 
        className="flex flex-col h-full w-full shadow-xl" // Ensure it fills the animated div
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
        {/* Footer is intentionally omitted for the animated clone to keep it simpler */}
      </Card>
    </div>
  );
}
