
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
  const [notesFromStorage, setNotesInStorage] = useLocalStorage<Note[]>("evernote-lite-notes", []);
  const [isClient, setIsClient] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentNotes = isClient ? notesFromStorage : [];
  const sortedNotes = [...currentNotes].sort((a, b) => b.updatedAt - a.updatedAt);

  const syncChange = async (action: 'create' | 'update' | 'delete', payload: Note | { id: string }) => {
    console.log(`[SINCRONIZANDO COM O BACKEND]`);
    console.log(`  Ação: ${action.toUpperCase()}`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);
    console.log(`  Payload:`, payload);
    console.log(`-----------------------------------`);

    // Em uma aplicação real, esta seria uma chamada de API:
    // try {
    //   const endpoint = '/api/notes'; // ou /api/notes/${payload.id} para update/delete
    //   let method = 'POST';
    //   if (action === 'update') method = 'PUT';
    //   if (action === 'delete') method = 'DELETE';

    //   const response = await fetch(action === 'delete' ? `${endpoint}/${(payload as {id: string}).id}` : endpoint, {
    //     method: method,
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: action !== 'delete' ? JSON.stringify(payload) : undefined,
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.text();
    //     throw new Error(`Falha na sincronização: ${response.status} ${errorData}`);
    //   }

    //   const result = action !== 'delete' ? await response.json() : { message: 'Excluído com sucesso' };
    //   console.log('Sincronização bem-sucedida:', result);
    //   // Opcionalmente, atualize o estado local com base na resposta do servidor, por exemplo, marcar como sincronizado
    // } catch (error) {
    //   console.error('Erro na sincronização:', error);
    //   // Lidar com falha na sincronização, por exemplo, lógica de nova tentativa, marcar como sincronização pendente
    // }
  };

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
      // Atualizar anotação existente
      const updatedNote: Note = {
        ...editingNote,
        ...data,
        content: data.content ?? editingNote.content, // Garante que content seja string
        updatedAt: now,
      };
      setNotesInStorage((prevNotes) =>
        prevNotes.map((n) =>
          n.id === editingNote.id ? updatedNote : n
        )
      );
      toast({ title: "Anotação Atualizada", description: `"${updatedNote.title}" foi atualizada com sucesso.` });
      syncChange('update', updatedNote);
    } else {
      // Criar nova anotação
      const newNote: Note = {
        id: now.toString() + Math.random().toString(36).substring(2, 9),
        title: data.title,
        content: data.content ?? '', // Garante que content seja string
        colorTagValue: data.colorTagValue,
        createdAt: now,
        updatedAt: now,
      };
      setNotesInStorage((prevNotes) => [newNote, ...prevNotes]);
      toast({ title: "Anotação Criada", description: `"${newNote.title}" foi criada com sucesso.` });
      syncChange('create', newNote);
    }
    handleCloseForm();
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notesFromStorage.find(n => n.id === noteId);
    if (noteToDelete) {
      setNotesInStorage((prevNotes) => prevNotes.filter((n) => n.id !== noteId));
      toast({
        title: "Anotação Excluída",
        description: `A anotação "${noteToDelete.title}" foi excluída.`,
        variant: "destructive",
      });
      syncChange('delete', { id: noteId });
    } else {
      console.warn(`Tentativa de excluir anotação não encontrada: ${noteId}`);
      toast({
          title: "Erro",
          description: "Anotação não encontrada para exclusão.",
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
              Notas <span className="font-light text-primary">Aqui</span>
            </h1>
          </div>
          <Button onClick={() => handleOpenForm()} size="lg">
            <Plus className="mr-2 h-5 w-5" /> Nova Anotação
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
                onClose={handleCloseForm}
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
