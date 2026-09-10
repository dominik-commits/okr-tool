import { sparklinePath } from './utils';

interface SparklineProps {
  points: number[];
  width: number;
  height: number;
  color: string;
  className?: string;
}

export default function Sparkline({ points, width, height, color, className }: SparklineProps) {
  const pad = 3;

  if (!points.length) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
        <text x={width / 2} y={height / 2 + 3} textAnchor="middle" fontSize={9} fill="var(--muted)">
          –
        </text>
      </svg>
    );
  }

  const d = sparklinePath(points, width, height, pad);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <path d={d ?? undefined} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
