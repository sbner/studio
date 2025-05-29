
"use client";

import type { Note } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { NotebookPen } from "lucide-react";
import { Button } from "./ui/button";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note, cardRect: DOMRect) => void;
  onDelete: (noteId: string) => void;
  onNewNoteClick: () => void;
  isCardBeingAnimated: (noteId: string) => boolean;
}

export function NoteList({ notes, onEdit, onDelete, onNewNoteClick, isCardBeingAnimated }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed rounded-lg bg-card">
        <NotebookPen className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-3 text-card-foreground">Nenhuma Anotação Ainda</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Parece um pouco vazio por aqui. Que tal criar sua primeira anotação?
        </p>
        <Button onClick={onNewNoteClick} size="lg">
          Criar Nova Anotação
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          isBeingAnimated={isCardBeingAnimated(note.id)}
        />
      ))}
    </div>
  );
}
