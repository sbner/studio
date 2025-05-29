
"use client";

import type { RefObject } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NoteForm } from "@/components/NoteForm";
import { NoteList } from "@/components/NoteList";
import type { Note } from "@/lib/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Plus, Feather } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNote, updateNote, deleteNote } from "@/services/syncService";
import { AnimatedNoteOverlay } from "@/components/AnimatedNoteOverlay";

type AnimatingState = {
  note: Note | null;
  initialRect: DOMRect | null;
  targetRect: DOMRect | null; // Store target rect for consistent collapse
  phase: 'idle' | 'expanding' | 'expanded_dialog_open' | 'collapsing';
};

export default function HomePage() {
  const [notesFromStorage, setNotesInStorage] = useLocalStorage<Note[]>("evernote-lite-notes", []);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const [animatingState, setAnimatingState] = useState<AnimatingState>({
    note: null,
    initialRect: null,
    targetRect: null,
    phase: 'idle',
  });

  const dialogContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentNotes = isClient ? notesFromStorage : [];
  const sortedNotes = [...currentNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  const calculateTargetRect = useCallback(() => {
    if (typeof window !== 'undefined') {
      const dialogElement = dialogContentRef.current;
      if (dialogElement) {
        return dialogElement.getBoundingClientRect();
      }
      // Fallback if ref is not ready - approximate center
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(600, vw * 0.8);
      const height = Math.min(500, vh * 0.7);
      return new DOMRect((vw - width) / 2, (vh - height) / 2, width, height);
    }
    return new DOMRect(0,0,600,500); // Default for SSR or if window is not defined
  }, []);


  const handleOpenForm = useCallback((noteToEdit: Note, cardRect?: DOMRect) => {
    if (cardRect) {
      const targetRect = calculateTargetRect();
      setAnimatingState({
        note: noteToEdit,
        initialRect: cardRect,
        targetRect: targetRect,
        phase: 'expanding',
      });
      setEditingNote(noteToEdit);
      // Dialog will be opened by onExpandAnimationEnd
    } else { // Fallback if no cardRect (e.g., new note)
      setEditingNote(noteToEdit || null);
      setIsFormOpen(true);
    }
  }, [calculateTargetRect]);

  const handleCloseForm = useCallback(() => {
    if (animatingState.phase === 'expanded_dialog_open' && editingNote && animatingState.initialRect && animatingState.targetRect) {
      setIsFormOpen(false); // Close dialog first
      // Ensure we use the latest note data for animation if it was edited
      const noteForAnimation = notesFromStorage.find(n => n.id === editingNote.id) || editingNote;
      setAnimatingState(prev => ({
        ...prev,
        note: noteForAnimation,
        phase: 'collapsing',
      }));
    } else { // If not part of animation sequence (e.g. new note cancel)
      setIsFormOpen(false);
      setEditingNote(null);
      setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' });
    }
  }, [animatingState, editingNote, notesFromStorage]);


  const onExpandAnimationEnd = useCallback(() => {
    if (animatingState.phase === 'expanding') {
      setAnimatingState(prev => ({ ...prev, phase: 'expanded_dialog_open' }));
      setIsFormOpen(true);
    }
  }, [animatingState.phase]);

  const onCollapseAnimationEnd = useCallback(() => {
    if (animatingState.phase === 'collapsing') {
      setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' });
      setEditingNote(null); // Clear editing note after collapse
    }
  }, [animatingState.phase]);


  const handleSaveNote = async (data: { title: string; content?: string; colorTagValue?: string }) => {
    const now = Date.now();
    let noteToAnimate: Note | null = null;

    if (editingNote) {
      const updatedNoteData: Note = {
        ...editingNote,
        ...data,
        content: data.content ?? editingNote.content,
        updatedAt: now,
      };
      setNotesInStorage((prevNotes) =>
        prevNotes.map((n) =>
          n.id === editingNote.id ? updatedNoteData : n
        )
      );
      noteToAnimate = updatedNoteData;
      toast({ title: "Anotação Atualizada", description: `"${updatedNoteData.title}" foi atualizada com sucesso.` });
      try {
        await updateNote(updatedNoteData);
      } catch (error) {
        console.error("Falha ao sincronizar atualização da anotação:", error);
        toast({
          title: "Erro de Sincronização",
          description: "Não foi possível atualizar a anotação no servidor.",
          variant: "destructive",
        });
      }
    } else {
      // Criar nova anotação
      const newNoteData: Note = {
        id: now.toString() + Math.random().toString(36).substring(2, 9),
        title: data.title,
        content: data.content ?? '',
        colorTagValue: data.colorTagValue,
        createdAt: now,
        updatedAt: now,
      };
      setNotesInStorage((prevNotes) => [newNoteData, ...prevNotes]);
      toast({ title: "Anotação Criada", description: `"${newNoteData.title}" foi criada com sucesso.` });
      try {
        await createNote(newNoteData);
      } catch (error) {
        console.error("Falha ao sincronizar criação da anotação:", error);
        toast({
          title: "Erro de Sincronização",
          description: "Não foi possível criar a anotação no servidor.",
          variant: "destructive",
        });
      }
    }
    
    // Trigger collapse animation if was editing
    if (editingNote && animatingState.phase === 'expanded_dialog_open' && animatingState.initialRect && animatingState.targetRect) {
        setIsFormOpen(false);
        const finalNoteForAnimation = noteToAnimate || editingNote;
         setAnimatingState(prev => ({
            ...prev,
            note: finalNoteForAnimation, // Use the most up-to-date note for animation
            phase: 'collapsing',
        }));
    } else {
        setIsFormOpen(false);
        setEditingNote(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const noteToDelete = notesFromStorage.find(n => n.id === noteId);
    if (noteToDelete) {
      setNotesInStorage((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
      toast({
        title: "Anotação Excluída",
        description: `A anotação "${noteToDelete.title}" foi excluída.`,
        variant: "destructive",
      });
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error("Falha ao sincronizar exclusão da anotação:", error);
         toast({
          title: "Erro de Sincronização",
          description: "Não foi possível excluir a anotação no servidor.",
          variant: "destructive",
        });
      }
    } else {
      console.warn(`Tentativa de excluir anotação não encontrada: ${noteId}`);
      toast({
          title: "Erro",
          description: "Anotação não encontrada para exclusão.",
          variant: "destructive",
        });
    }
  };
  
  const isCardBeingAnimated = useCallback((noteId: string) => {
    return animatingState.note?.id === noteId && animatingState.phase !== 'idle';
  }, [animatingState.note?.id, animatingState.phase]);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b">
          <div className="flex items-center mb-4 sm:mb-0">
            <Feather className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Notas <span className="font-light text-primary">Aqui</span>
            </h1>
          </div>
          <Button onClick={() => handleOpenForm(null as any)} size="lg"> {/* Cast to any to satisfy new signature temporarily for new notes */}
            <Plus className="mr-2 h-5 w-5" /> Nova Anotação
          </Button>
        </header>

        <NoteList
          notes={sortedNotes}
          onEdit={handleOpenForm}
          onDelete={handleDeleteNote}
          onNewNoteClick={() => handleOpenForm(null as any)}
          isCardBeingAnimated={isCardBeingAnimated}
        />

        {animatingState.phase !== 'idle' && animatingState.note && animatingState.initialRect && animatingState.targetRect && (
          <AnimatedNoteOverlay
            note={animatingState.note}
            initialRect={animatingState.initialRect}
            targetRect={animatingState.targetRect}
            phase={animatingState.phase}
            onExpandAnimationEnd={onExpandAnimationEnd}
            onCollapseAnimationEnd={onCollapseAnimationEnd}
            isDialogShowing={animatingState.phase === 'expanded_dialog_open'}
          />
        )}
        
        {/* Dialog for editing/creating notes. The `open` prop is controlled by `isFormOpen`.
            The `onOpenChange` prop handles user actions like clicking outside or pressing Esc.
            When these actions occur, we want to trigger our `handleCloseForm` logic,
            which includes managing the collapse animation if necessary.
        */}
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleCloseForm(); }}>
          <DialogContent 
            ref={dialogContentRef}
            className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] flex flex-col"
            onInteractOutside={(e) => {
              // Prevent closing via overlay click if an animation is in progress that should complete first.
              // However, for simplicity here, we allow it and handleCloseForm will manage state.
              // if (animatingState.phase === 'expanding' || animatingState.phase === 'collapsing') {
              //   e.preventDefault();
              // }
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingNote ? "Editar Anotação" : "Criar Nova Anotação"}
              </DialogTitle>
              <DialogDescription>
                {editingNote ? "Modifique os detalhes da sua anotação." : "Preencha os detalhes para criar uma nova anotação."}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto py-4 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <NoteForm
                initialData={editingNote || undefined}
                onSubmit={handleSaveNote}
                onClose={handleCloseForm} // Pass handleCloseForm for explicit cancel
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <footer className="text-center py-6 mt-12 border-t">
        <p className="text-sm text-muted-foreground">
          Notas Aqui &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
