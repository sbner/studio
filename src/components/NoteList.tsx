"use client";

import type { Note } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { NotebookPen } from "lucide-react";
import { Button } from "./ui/button";

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onNewNoteClick: () => void;
}

export function NoteList({ notes, onEdit, onDelete, onNewNoteClick }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed rounded-lg bg-card">
        <NotebookPen className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold mb-3 text-card-foreground">No Notes Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          It looks a bit empty here. Why not create your first note?
        </p>
        <Button onClick={onNewNoteClick} size="lg">
          Create New Note
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
        />
      ))}
    </div>
  );
}
