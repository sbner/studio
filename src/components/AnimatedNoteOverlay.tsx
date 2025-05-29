
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '@/lib/types';
import { getBgColorFromValue } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedNoteOverlayProps {
  note: Note;
  initialRect: DOMRect;
  targetRect: DOMRect;
  phase: 'expanding' | 'expanded_dialog_open' | 'collapsing';
  onExpandAnimationEnd: () => void;
  onCollapseAnimationEnd: () => void;
  isDialogShowing: boolean; // Embora não usada diretamente para estilos aqui, é uma boa info
}

const ANIMATION_DURATION = 900; // ms
const OPACITY_TRANSITION_DURATION = Math.floor(ANIMATION_DURATION / 2); // ms
const COLLAPSE_OPACITY_DELAY = Math.floor(ANIMATION_DURATION / 2); // ms

export function AnimatedNoteOverlay({
  note,
  initialRect,
  targetRect,
  phase,
  onExpandAnimationEnd,
  onCollapseAnimationEnd,
  // isDialogShowing, // Não diretamente usada para estilos aqui, mas mantida por clareza
}: AnimatedNoteOverlayProps) {
  const [currentStyles, setCurrentStyles] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const date = new Date(note.updatedAt).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const borderColor = note.colorTagValue ? getBgColorFromValue(note.colorTagValue) : 'transparent';

  useEffect(() => {
    const baseFixedStyles: React.CSSProperties = {
        position: 'fixed',
        zIndex: 50, // Mantém o zIndex consistente
        overflow: 'hidden', // Ajuda a conter o conteúdo do card
    };

    if (phase === 'expanding' && initialRect && targetRect) {
        const expandingInitialStyles: React.CSSProperties = {
            ...baseFixedStyles,
            top: `${initialRect.top}px`,
            left: `${initialRect.left}px`,
            width: `${initialRect.width}px`,
            height: `${initialRect.height}px`,
            opacity: 1,
            pointerEvents: 'auto', // Interativo durante a animação de expansão
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out, opacity ${ANIMATION_DURATION}ms ease-in-out`,
        };
        setCurrentStyles(expandingInitialStyles);

        requestAnimationFrame(() => {
            setCurrentStyles({
                ...expandingInitialStyles, // Baseia-se no estado anterior para manter a transição correta
                top: `${targetRect.top}px`,
                left: `${targetRect.left}px`,
                width: `${targetRect.width}px`,
                height: `${targetRect.height}px`,
                // opacity permanece 1 durante a movimentação
            });
        });
    } else if (phase === 'expanded_dialog_open' && targetRect) {
        setCurrentStyles({
            ...baseFixedStyles,
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 0,
            pointerEvents: 'none', // Crucial: torna o overlay não interativo
            transition: `opacity ${OPACITY_TRANSITION_DURATION}ms ease-in-out`, // Apenas opacidade
        });
    } else if (phase === 'collapsing' && initialRect && targetRect) {
        const collapsingInitialStyles: React.CSSProperties = {
            ...baseFixedStyles,
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            opacity: 1,
            pointerEvents: 'auto', // Interativo durante a animação de colapso
            transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out, width ${ANIMATION_DURATION}ms ease-in-out, height ${ANIMATION_DURATION}ms ease-in-out, opacity ${ANIMATION_DURATION}ms ease-in-out ${COLLAPSE_OPACITY_DELAY}ms`,
        };
        setCurrentStyles(collapsingInitialStyles);

        requestAnimationFrame(() => {
            setCurrentStyles({
                ...collapsingInitialStyles, // Baseia-se no estado anterior
                top: `${initialRect.top}px`,
                left: `${initialRect.left}px`,
                width: `${initialRect.width}px`,
                height: `${initialRect.height}px`,
                opacity: 0,
                // pointerEvents se tornará efetivamente 'none' ao final devido à opacidade e fim da animação
            });
        });
    } else if (phase === 'idle') {
        // Garante que está completamente fora do caminho e não interativo
        setCurrentStyles({ opacity: 0, pointerEvents: 'none', zIndex: -1 });
    }
  }, [phase, initialRect, targetRect]);


  useEffect(() => {
    const node = overlayRef.current;
    if (!node || !initialRect || !targetRect) return;

    const handleTransitionEnd = (event: TransitionEvent) => {
        // Certifique-se de que o evento de transição é do próprio overlayRef e não de um filho.
        if (event.target !== node) return;

        // Usar uma propriedade que muda durante a transformação principal (ex: 'width' ou 'height')
        // para detectar o fim da animação de expansão/colapso.
        // 'opacity' também é importante para a fase de colapso.
        if (event.propertyName === 'width' || event.propertyName === 'height' || event.propertyName === 'top' || event.propertyName === 'left') {
            const isAtTarget = currentStyles.top === `${targetRect.top}px` && currentStyles.left === `${targetRect.left}px`;
            const isAtInitial = currentStyles.top === `${initialRect.top}px` && currentStyles.left === `${initialRect.left}px`;

            if (phase === 'expanding' && isAtTarget) {
                onExpandAnimationEnd();
            } else if (phase === 'collapsing' && isAtInitial && currentStyles.opacity === 0) {
                 // Verifica se a opacidade é 0 ao final do colapso e se está na posição inicial
                onCollapseAnimationEnd();
            }
        } else if (event.propertyName === 'opacity' && phase === 'collapsing') {
            // Caso a opacidade seja a última a terminar no colapso, e já estejamos na posição inicial.
            const isAtInitial = currentStyles.top === `${initialRect.top}px` && currentStyles.left === `${initialRect.left}px`;
            if (isAtInitial && currentStyles.opacity === 0) {
                onCollapseAnimationEnd();
            }
        }
    };

    node.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      node.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [currentStyles, phase, onExpandAnimationEnd, onCollapseAnimationEnd, initialRect, targetRect]);


  if (phase === 'idle' || (!initialRect && phase !== 'collapsing' && phase !== 'expanded_dialog_open')) {
    return null;
  }
  // Mesmo que opacity seja 0 em 'expanded_dialog_open', o div ainda precisa existir para a transição de colapso
  // mas com pointerEvents: 'none', ele não bloqueará interações.

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
