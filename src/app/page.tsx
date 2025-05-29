
"use client";

import type { RefObject } from "react";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Plus, Feather, NotebookPen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createNote, updateNote, deleteNote } from "@/services/syncService";
import { AnimatedNoteOverlay } from "@/components/AnimatedNoteOverlay";

type AnimationPendingState = {
  noteToEdit: Note;
  cardRect: DOMRect;
} | null;

type AnimatingState = {
  note: Note | null;
  initialRect: DOMRect | null;
  targetRect: DOMRect | null;
  phase: 'idle' | 'expanding' | 'expanded_dialog_open' | 'collapsing';
};

export default function HomePage() {
  const [notesFromStorage, setNotesInStorage] = useLocalStorage<Note[]>("evernote-lite-notes", []);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const [animationPending, setAnimationPending] = useState<AnimationPendingState>(null);
  const [animatingState, setAnimatingState] = useState<AnimatingState>({
    note: null,
    initialRect: null,
    targetRect: null,
    phase: 'idle',
  });

  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentNotes = isClient ? notesFromStorage : [];
  const sortedNotes = [...currentNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    if (animationPending && isFormOpen && dialogContentRef.current) {
      const actualTargetRect = dialogContentRef.current.getBoundingClientRect();
      
      const currentNoteFromStorage = notesFromStorage.find(n => n.id === animationPending.noteToEdit.id);
      const noteForFormAndAnimation = currentNoteFromStorage || animationPending.noteToEdit;

      setAnimatingState({
        note: noteForFormAndAnimation,
        initialRect: animationPending.cardRect,
        targetRect: actualTargetRect,
        phase: 'expanding',
      });
      setEditingNote(noteForFormAndAnimation); 
      setAnimationPending(null); 
    }
  }, [animationPending, isFormOpen, notesFromStorage]);


  const handleOpenForm = useCallback((noteToEditParam?: Note | null, cardRect?: DOMRect) => {
    if (noteToEditParam && cardRect) { // Editing existing note with animation
      // Ensure we use the absolute latest version from storage for editing
      const freshNoteToEdit = notesFromStorage.find(n => n.id === noteToEditParam.id) || noteToEditParam;
      setEditingNote(freshNoteToEdit); // Set editingNote immediately for the form
      setAnimationPending({ noteToEdit: freshNoteToEdit, cardRect });
      setIsFormOpen(true); 
    } else { // New note or no cardRect (fallback, e.g. "Nova Anotação" button)
      setEditingNote(noteToEditParam || null); // If noteToEditParam is provided without cardRect, use it. Otherwise, new note.
      setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' }); 
      setIsFormOpen(true);
    }
  }, [notesFromStorage]);


  const handleCloseForm = useCallback(() => {
    if (animatingState.phase === 'expanded_dialog_open' && editingNote && animatingState.initialRect && animatingState.targetRect) {
      setIsFormOpen(false); 
      const noteForAnimation = notesFromStorage.find(n => n.id === editingNote.id) || editingNote;
      setAnimatingState(prev => ({
        ...prev,
        note: noteForAnimation, 
        phase: 'collapsing',
      }));
    } else {
      setIsFormOpen(false);
      setEditingNote(null);
      setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' });
    }
  }, [animatingState.phase, editingNote, notesFromStorage, animatingState.initialRect, animatingState.targetRect]);


  const onExpandAnimationEnd = useCallback(() => {
    if (animatingState.phase === 'expanding') {
      setAnimatingState(prev => ({ ...prev, phase: 'expanded_dialog_open' }));
    }
  }, [animatingState.phase]);

  const onCollapseAnimationEnd = useCallback(() => {
    if (animatingState.phase === 'collapsing') {
      setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' });
      setEditingNote(null); 
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
    
    if (editingNote && noteToAnimate && animatingState.phase === 'expanded_dialog_open' && animatingState.initialRect && animatingState.targetRect) {
        setIsFormOpen(false); 
        const finalNoteForAnimation = noteToAnimate; // Use the most recently updated note data
         setAnimatingState(prev => ({
            ...prev,
            note: finalNoteForAnimation, 
            phase: 'collapsing',
        }));
    } else {
        setIsFormOpen(false);
        setEditingNote(null);
        setAnimatingState({ note: null, initialRect: null, targetRect: null, phase: 'idle' });
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
    if (editingNote && editingNote.id === noteId) {
        handleCloseForm();
    }
  };
  
  const isCardBeingAnimated = useCallback((noteId: string) => {
    return animatingState.note?.id === noteId && 
           (animatingState.phase === 'expanding' || 
            animatingState.phase === 'expanded_dialog_open' || 
            animatingState.phase === 'collapsing');
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
          <Button onClick={() => handleOpenForm()} size="lg">
            <Plus className="mr-2 h-5 w-5" /> Nova Anotação
          </Button>
        </header>

        {isClient ? (
            <NoteList
            notes={sortedNotes}
            onEdit={handleOpenForm}
            onDelete={handleDeleteNote}
            onNewNoteClick={() => handleOpenForm()}
            isCardBeingAnimated={isCardBeingAnimated}
            />
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed rounded-lg bg-card">
                <NotebookPen className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold mb-3 text-card-foreground">Carregando Anotações...</h2>
                <p className="text-muted-foreground mb-6 max-w-xs">
                Por favor, aguarde um momento.
                </p>
            </div>
        )}
        
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleCloseForm(); }}>
          <DialogContent 
            ref={dialogContentRef}
            className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] flex flex-col"
            onInteractOutside={(e) => {
              if (animatingState.phase === 'expanding' || animatingState.phase === 'collapsing') {
                 e.preventDefault();
              }
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
                key={editingNote ? editingNote.id : 'new-note-form'}
                initialData={editingNote || undefined}
                onSubmit={handleSaveNote}
                onClose={handleCloseForm}
              />
            </div>
          </DialogContent>
        </Dialog>

        {(animatingState.phase === 'expanding' || animatingState.phase === 'expanded_dialog_open' || animatingState.phase === 'collapsing') && 
         animatingState.note && animatingState.initialRect && animatingState.targetRect && (
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

      </main>
      <footer className="text-center py-6 mt-12 border-t">
        <p className="text-sm text-muted-foreground">
          Notas Aqui &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
    

    

    