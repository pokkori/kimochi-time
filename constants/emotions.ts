export const EMOTIONS = [
  { id: 1, label: 'とても辛い',    color: '#1A1A2E', textColor: '#FFFFFF', soundNote: 'C2' },
  { id: 2, label: '落ち込み',      color: '#4A4E8C', textColor: '#FFFFFF', soundNote: 'D2' },
  { id: 3, label: 'ちょっと憂鬱',  color: '#7B8CB3', textColor: '#FFFFFF', soundNote: 'E2' },
  { id: 4, label: 'まあまあ',      color: '#A8B4C4', textColor: '#333333', soundNote: 'F3' },
  { id: 5, label: 'ふつう',        color: '#E8E4D9', textColor: '#333333', soundNote: 'G3' },
  { id: 6, label: 'まずまず',      color: '#FFD166', textColor: '#333333', soundNote: 'A3' },
  { id: 7, label: 'いい感じ',      color: '#F4A261', textColor: '#333333', soundNote: 'B3' },
  { id: 8, label: '嬉しい',        color: '#E76F51', textColor: '#FFFFFF', soundNote: 'C4' },
  { id: 9, label: '最高！',        color: '#FF6B9D', textColor: '#FFFFFF', soundNote: 'D4' },
] as const;

export type EmotionId = typeof EMOTIONS[number]['id'];
export type Emotion = typeof EMOTIONS[number];

export function getEmotion(id: EmotionId): Emotion {
  return EMOTIONS.find((e) => e.id === id) ?? EMOTIONS[4];
}
