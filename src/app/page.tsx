"use client";

import { useState, useEffect } from "react";
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

export default function HomePage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("evernote-lite-notes", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  // Sort notes by last updated, newest first
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleOpenForm = (note?: Note) => {
    setEditingNote(note || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleSaveNote = (data: { title: string; content?: string; colorTagValue?: string }) => {
    const now = Date.now();
    if (editingNote) {
      // Update existing note
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...data, updatedAt: now }
            : n
        )
      );
      toast({ title: "Note Updated", description: `"${data.title}" has been successfully updated.` });
    } else {
      // Create new note
      const newNote: Note = {
        id: now.toString() + Math.random().toString(36).substring(2,9), // Simple unique ID
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      toast({ title: "Note Created", description: `"${data.title}" has been successfully created.` });
    }
    handleCloseForm();
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    setNotes((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
    if (noteToDelete) {
      toast({
        title: "Note Deleted",
        description: `"${noteToDelete.title}" has been deleted.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b">
          <div className="flex items-center mb-4 sm:mb-0">
            <Feather className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Evernote <span className="font-light text-primary">Lite</span>
            </h1>
          </div>
          <Button onClick={() => handleOpenForm()} size="lg">
            <Plus className="mr-2 h-5 w-5" /> New Note
          </Button>
        </header>

        <NoteList
          notes={sortedNotes}
          onEdit={handleOpenForm}
          onDelete={handleDeleteNote}
          onNewNoteClick={() => handleOpenForm()}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingNote ? "Edit Note" : "Create New Note"}
              </DialogTitle>
              <DialogDescription>
                {editingNote ? "Modify the details of your note." : "Fill in the details to create a new note."}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto py-4 pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <NoteForm
                initialData={editingNote || undefined}
                onSubmit={handleSaveNote}
                onClose={handleCloseForm}
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <footer className="text-center py-6 mt-12 border-t">
        <p className="text-sm text-muted-foreground">
          Evernote Lite &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
