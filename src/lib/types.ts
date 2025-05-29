
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  colorTagValue?: string; // Stores the 'value' from NOTE_COLORS, e.g., 'sky-blue' or '' for default
}

export const NOTE_COLORS: Array<{ name: string; value: string; bgColor: string;}> = [
  { name: 'Padrão', value: 'no-color', bgColor: 'transparent' }, // transparent for border styling
  { name: 'Azul Céu', value: 'sky-blue', bgColor: 'hsl(var(--primary))' },
  { name: 'Verde Menta', value: 'mint-green', bgColor: 'hsl(var(--accent))' },
  { name: 'Amarelo Sol', value: 'sunshine-yellow', bgColor: '#FFD54F' },
  { name: 'Laranja Coral', value: 'coral-orange', bgColor: '#FFB74D' },
  { name: 'Vermelho Rosa', value: 'rose-red', bgColor: '#E57373' },
  { name: 'Roxo Lavanda', value: 'lavender-purple', bgColor: '#BA68C8' },
];

export const getBgColorFromValue = (value?: string): string => {
  if (!value) return NOTE_COLORS[0].bgColor; // Default color (will be 'no-color' which is transparent)
  const color = NOTE_COLORS.find(c => c.value === value);
  return color ? color.bgColor : NOTE_COLORS[0].bgColor;
};
