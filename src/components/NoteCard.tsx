
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";
import { getBgColorFromValue } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note, cardRect: DOMRect) => void;
  onDelete: (noteId: string) => void;
  isBeingAnimated?: boolean;
}

export function NoteCard({ note, onEdit, onDelete, isBeingAnimated }: NoteCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const borderColor = note.colorTagValue ? getBgColorFromValue(note.colorTagValue) : 'transparent';
  const date = new Date(note.updatedAt).toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const handleEditClick = () => {
    if (cardRef.current) {
      onEdit(note, cardRef.current.getBoundingClientRect());
    }
  };

  return (
    <div ref={cardRef} className={cn(
      "transition-opacity duration-300",
      isBeingAnimated ? "opacity-0 pointer-events-none" : "opacity-100"
    )}>
      <Card 
        className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200" 
        style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: borderColor }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">{note.title}</CardTitle>
          <CardDescription className="text-xs">
            Última atualização: {date}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-4">
          <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
            {note.content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" size="icon" onClick={handleEditClick} aria-label="Editar anotação">
            <FileEdit className="h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir anotação"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente sua anotação intitulada "{note.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(note.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
