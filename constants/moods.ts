/**
 * 8種のムードアイコン定義（絵文字不使用・SVGパスで描画）
 * 差別化機能「リアルタイム感情共有＋シンクログラフ」で使用
 */

export interface Mood {
  id: string;
  label: string;
  color: string;
  /** SVG 24x24 viewBox 内のパス */
  svgPath: string;
  /** サブパス（オプション: アクセント描画用） */
  svgPathAccent?: string;
}

export const MOODS: Mood[] = [
  {
    id: 'happy',
    label: '嬉しい',
    color: '#FFD93D',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  },
  {
    id: 'love',
    label: '愛してる',
    color: '#E91E8C',
    svgPath:
      'M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z',
  },
  {
    id: 'calm',
    label: '穏やか',
    color: '#2DD4BF',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 14s1.5 1 4 1 4-1 4-1M9 9h.01M15 9h.01',
  },
  {
    id: 'tired',
    label: '疲れた',
    color: '#95A5A6',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 15h8M9 9.5c0-.5.5-1 1-1s1 .5 1 1M13 9.5c0-.5.5-1 1-1s1 .5 1 1',
  },
  {
    id: 'anxious',
    label: '不安',
    color: '#9B59B6',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M9 15s.5-1.5 3-1.5 3 1.5 3 1.5M9 9h.01M15 9h.01M12 5v3',
  },
  {
    id: 'sad',
    label: '寂しい',
    color: '#4A90D9',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01',
  },
  {
    id: 'angry',
    label: 'イライラ',
    color: '#E63946',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 15s1.5-2 4-2 4 2 4 2M8 9l3 1.5M16 9l-3 1.5',
  },
  {
    id: 'excited',
    label: 'ワクワク',
    color: '#FF7F50',
    svgPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    svgPathAccent: 'M8 13s1.5 3 4 3 4-3 4-3M8.5 8.5l1 1.5M15.5 8.5l-1 1.5M12 2v2M19.5 4.5l-1.5 1.5',
  },
];

export function getMoodById(id: string): Mood | undefined {
  return MOODS.find((m) => m.id === id);
}
