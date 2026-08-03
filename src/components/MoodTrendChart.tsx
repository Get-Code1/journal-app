import { MOOD_COLORS, MOODS, MOOD_VALUES } from "@/types";
import type { MoodTrendPoint } from "@/lib/dashboard";

const HEIGHT = 64;
const BAR_GAP = 2;
const RADIUS = 3;
const MIN_BAR_HEIGHT = 6;
const NO_ENTRY_HEIGHT = 3;

function roundedTopRectPath(
  x: number,
  width: number,
  barHeight: number
): string {
  const top = HEIGHT - barHeight;
  const bottom = HEIGHT;
  const r = Math.min(RADIUS, width / 2, barHeight);
  return `
    M ${x} ${bottom}
    L ${x} ${top + r}
    Q ${x} ${top} ${x + r} ${top}
    L ${x + width - r} ${top}
    Q ${x + width} ${top} ${x + width} ${top + r}
    L ${x + width} ${bottom}
    Z
  `;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function MoodTrendChart({
  points,
}: {
  points: MoodTrendPoint[];
}) {
  const width = 100;
  const barWidth = width / points.length - BAR_GAP;

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-16 w-full"
        role="img"
        aria-label={`Mood over the last ${points.length} days`}
      >
        <line
          x1={0}
          y1={HEIGHT - 0.5}
          x2={width}
          y2={HEIGHT - 0.5}
          stroke="var(--border)"
          strokeWidth={0.5}
        />
        {points.map((point, i) => {
          const x = i * (barWidth + BAR_GAP);
          const value = point.mood ? MOOD_VALUES[point.mood] : 0;
          const barHeight = point.mood
            ? MIN_BAR_HEIGHT + ((value - 1) / 4) * (HEIGHT - MIN_BAR_HEIGHT)
            : NO_ENTRY_HEIGHT;
          const fill = point.mood ? MOOD_COLORS[point.mood] : "var(--border)";
          const label = point.mood
            ? MOODS.find((m) => m.value === point.mood)?.label
            : "No entry";

          return (
            <path
              key={point.date}
              d={roundedTopRectPath(x, barWidth, barHeight)}
              fill={fill}
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${formatDate(point.date)}: ${label}`}</title>
            </path>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {MOODS.map((m) => (
          <span
            key={m.value}
            className="flex items-center gap-1 text-xs text-foreground-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: MOOD_COLORS[m.value] }}
            />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
