export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  colorTagValue?: string; // Stores the 'value' from NOTE_COLORS, e.g., 'sky-blue' or '' for default
}

export const NOTE_COLORS: Array<{ name: string; value: string; bgColor: string;}> = [
  { name: 'Default', value: '', bgColor: 'transparent' }, // transparent for border styling
  { name: 'Sky Blue', value: 'sky-blue', bgColor: 'hsl(var(--primary))' },
  { name: 'Mint Green', value: 'mint-green', bgColor: 'hsl(var(--accent))' },
  { name: 'Sunshine Yellow', value: 'sunshine-yellow', bgColor: '#FFD54F' },
  { name: 'Coral Orange', value: 'coral-orange', bgColor: '#FFB74D' },
  { name: 'Rose Red', value: 'rose-red', bgColor: '#E57373' },
  { name: 'Lavender Purple', value: 'lavender-purple', bgColor: '#BA68C8' },
];

export const getBgColorFromValue = (value?: string): string => {
  if (!value) return NOTE_COLORS[0].bgColor; // Default color
  const color = NOTE_COLORS.find(c => c.value === value);
  return color ? color.bgColor : NOTE_COLORS[0].bgColor;
};
