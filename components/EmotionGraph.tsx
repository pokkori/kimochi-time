import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { EMOTIONS } from '../constants/emotions';

interface DataPoint {
  date: string;
  emotionId: number;
}

interface Props {
  myData: DataPoint[];
  partnerData?: DataPoint[];
  blurFrom?: number; // この日数以降をぼかす（有料ゲート用・0=ぼかしなし）
  width?: number;
  height?: number;
}

const CHART_PADDING = { top: 20, right: 20, bottom: 30, left: 30 };

function buildPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  for (let i = 0; i < rest.length; i++) {
    const prev = points[i];
    const curr = rest[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function EmotionGraph({
  myData,
  partnerData,
  blurFrom = 0,
  width = 340,
  height = 220,
}: Props) {
  const chartW = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartH = height - CHART_PADDING.top - CHART_PADDING.bottom;

  const allDates = Array.from(
    new Set([...myData.map((d) => d.date), ...(partnerData ?? []).map((d) => d.date)]),
  ).sort();

  if (allDates.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={styles.emptyText}>まだデータがありません</Text>
      </View>
    );
  }

  const xStep = chartW / Math.max(allDates.length - 1, 1);
  const yScale = (id: number) => chartH - ((id - 1) / 8) * chartH;

  function getPoints(data: DataPoint[]) {
    return allDates.map((date, i) => {
      const entry = data.find((d) => d.date === date);
      return entry
        ? { x: CHART_PADDING.left + i * xStep, y: CHART_PADDING.top + yScale(entry.emotionId) }
        : null;
    }).filter(Boolean) as { x: number; y: number }[];
  }

  const myPoints = getPoints(myData);
  const partnerPoints = partnerData ? getPoints(partnerData) : [];

  // ぼかし領域の開始X座標
  const blurX = blurFrom > 0 && allDates.length > blurFrom
    ? CHART_PADDING.left + blurFrom * xStep
    : width + 1;

  return (
    <View accessibilityRole="image" accessibilityLabel="2人の感情グラフ">
      <Svg width={width} height={height}>
        {/* Y軸グリッド */}
        {[1, 3, 5, 7, 9].map((id) => {
          const y = CHART_PADDING.top + yScale(id);
          const emotion = EMOTIONS.find((e) => e.id === id);
          return (
            <React.Fragment key={id}>
              <Line
                x1={CHART_PADDING.left}
                y1={y}
                x2={width - CHART_PADDING.right}
                y2={y}
                stroke="rgba(0,0,0,0.07)"
                strokeWidth={1}
              />
              <SvgText
                x={CHART_PADDING.left - 4}
                y={y + 4}
                fontSize={8}
                textAnchor="end"
                fill={Colors.textLight}
              >
                {emotion?.label.slice(0, 4) ?? ''}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X軸ラベル */}
        {allDates.map((date, i) => (
          <SvgText
            key={date}
            x={CHART_PADDING.left + i * xStep}
            y={height - 6}
            fontSize={8}
            textAnchor="middle"
            fill={Colors.textLight}
          >
            {date.slice(5)}
          </SvgText>
        ))}

        {/* パートナーの折れ線 */}
        {partnerPoints.length > 1 && (
          <Path
            d={buildPath(partnerPoints)}
            fill="none"
            stroke={Colors.secondary}
            strokeWidth={2}
            strokeDasharray="6 3"
            opacity={0.8}
          />
        )}
        {partnerPoints.map((p, i) => (
          <Circle key={`p-${i}`} cx={p.x} cy={p.y} r={4} fill={Colors.secondary} />
        ))}

        {/* 自分の折れ線 */}
        {myPoints.length > 1 && (
          <Path
            d={buildPath(myPoints)}
            fill="none"
            stroke={Colors.primary}
            strokeWidth={2.5}
            opacity={0.9}
          />
        )}
        {myPoints.map((p, i) => (
          <Circle key={`m-${i}`} cx={p.x} cy={p.y} r={5} fill={Colors.primary} />
        ))}

        {/* ぼかしオーバーレイ（有料ゲート） */}
        {blurFrom > 0 && blurX < width && (
          <Path
            d={`M ${blurX} 0 L ${width} 0 L ${width} ${height} L ${blurX} ${height} Z`}
            fill="rgba(255,245,248,0.85)"
          />
        )}
      </Svg>

      {/* 凡例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>あなた</Text>
        </View>
        {partnerData && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.legendText}>パートナー</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
