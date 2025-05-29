
"use client";

import type { Control } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Note } from "@/lib/types";
import { NOTE_COLORS } from "@/lib/types";
import { DialogFooter } from "@/components/ui/dialog"; // Assuming this is part of a Dialog

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório").max(100, "O título é muito longo"),
  content: z.string().optional(),
  colorTagValue: z.string().optional(),
});

type NoteFormValues = z.infer<typeof formSchema>;

interface NoteFormProps {
  initialData?: Note;
  onSubmit: (data: NoteFormValues) => void;
  onClose: () => void;
}

export function NoteForm({ initialData, onSubmit, onClose }: NoteFormProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      colorTagValue: (initialData?.colorTagValue === '' || typeof initialData?.colorTagValue === 'undefined')
                     ? 'no-color' 
                     : initialData.colorTagValue,
    },
  });

  const handleSubmit = (values: NoteFormValues) => {
    const dataToSubmit = {
      ...values,
      colorTagValue: values.colorTagValue === 'no-color' ? '' : values.colorTagValue,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control as unknown as Control<NoteFormValues>}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da anotação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as unknown as Control<NoteFormValues>}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escreva sua anotação aqui..."
                  className="min-h-[200px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as unknown as Control<NoteFormValues>}
          name="colorTagValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiqueta de Cor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma etiqueta de cor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NOTE_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <span
                          className="w-4 h-4 rounded-full mr-3 border"
                          style={{ backgroundColor: color.bgColor, borderColor: color.bgColor === 'transparent' ? 'hsl(var(--border))' : color.bgColor }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Anotação</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
