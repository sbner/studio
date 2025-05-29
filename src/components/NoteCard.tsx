"use client";

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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const borderColor = note.colorTagValue ? getBgColorFromValue(note.colorTagValue) : 'transparent';
  const date = new Date(note.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200" style={{ borderLeftWidth: '4px', borderLeftStyle: 'solid', borderLeftColor: borderColor }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">{note.title}</CardTitle>
        <CardDescription className="text-xs">
          Last updated: {date}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {note.content}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" size="icon" onClick={() => onEdit(note)} aria-label="Edit note">
          <FileEdit className="h-5 w-5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Delete note">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your note titled "{note.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
