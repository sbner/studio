
// src/services/syncService.ts
import type { Note } from '@/lib/types';

/**
 * Simula a obtenção de todas as notas do backend.
 * @returns Uma Promise que resolve para um array de notas.
 */
export async function getNotes(): Promise<Note[]> {
  console.log(`[SERVICE - GET NOTES]`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`-----------------------------------`);
  // Em uma aplicação real, isso faria uma chamada GET para /api/notes
  // Por enquanto, retorna um array vazio como placeholder.
  return Promise.resolve([]);
}

/**
 * Simula a criação de uma nova nota no backend.
 * @param noteData Os dados da nota a ser criada.
 * @returns Uma Promise que resolve para a nota criada.
 */
export async function createNote(noteData: Note): Promise<Note> {
  console.log(`[SERVICE - CREATE NOTE]`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`  Payload:`, noteData);
  console.log(`-----------------------------------`);
  // Em uma aplicação real, isso faria uma chamada POST para /api/notes
  // Retorna os dados da nota como se tivessem sido confirmados pelo backend.
  return Promise.resolve(noteData);
}

/**
 * Simula a atualização de uma nota existente no backend.
 * @param noteData Os dados da nota a ser atualizada.
 * @returns Uma Promise que resolve para a nota atualizada.
 */
export async function updateNote(noteData: Note): Promise<Note> {
  console.log(`[SERVICE - UPDATE NOTE]`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`  Payload:`, noteData);
  console.log(`-----------------------------------`);
  // Em uma aplicação real, isso faria uma chamada PUT para /api/notes/${noteData.id}
  // Retorna os dados da nota como se tivessem sido confirmados pelo backend.
  return Promise.resolve(noteData);
}

/**
 * Simula a exclusão de uma nota no backend.
 * @param noteId O ID da nota a ser excluída.
 * @returns Uma Promise que resolve indicando sucesso ou falha.
 */
export async function deleteNote(noteId: string): Promise<{ id: string, success: boolean }> {
  console.log(`[SERVICE - DELETE NOTE]`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`  Payload: { id: "${noteId}" }`);
  console.log(`-----------------------------------`);
  // Em uma aplicação real, isso faria uma chamada DELETE para /api/notes/${noteId}
  // Retorna um objeto indicando sucesso.
  return Promise.resolve({ id: noteId, success: true });
}
