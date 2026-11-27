"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  formatDuration,
  formatNumber,
  formatPercent,
} from "@repo/core/number";

export type ValueFormat = "number" | "seconds" | "percent";

function formatValue(value: number, format: ValueFormat): string {
  if (format === "seconds") return formatDuration(value);
  if (format === "percent") return formatPercent(value);
  return formatNumber(value);
}

export interface Series {
  key: string;
  label: string;
  color: string;
}

const dayLabel = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDay(value: string): string {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : dayLabel.format(parsed);
}

function configFor(series: Series[]): ChartConfig {
  return Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }]),
  );
}

export function TrendChart({
  data,
  series,
  className,
  stacked = false,
}: {
  data: Array<Record<string, string | number>>;
  series: Series[];
  className?: string;
  stacked?: boolean;
}) {
  return (
    <ChartContainer
      config={configFor(series)}
      className={cn("aspect-auto h-64 w-full", className)}
    >
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          {series.map((item) => (
            <linearGradient
              key={item.key}
              id={`fill-${item.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={`var(--color-${item.key})`} stopOpacity={0.5} />
              <stop offset="95%" stopColor={`var(--color-${item.key})`} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={formatDay}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value) => formatDay(String(value))}
            />
          }
        />
        {series.map((item) => (
          <Area
            key={item.key}
            dataKey={item.key}
            type="monotone"
            fill={`url(#fill-${item.key})`}
            stroke={`var(--color-${item.key})`}
            strokeWidth={2}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
        {series.length > 1 && (
          <ChartLegend
            content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1" />}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}

export function StackedBars({
  data,
  series,
  className,
}: {
  data: Array<Record<string, string | number>>;
  series: Series[];
  className?: string;
}) {
  return (
    <ChartContainer
      config={configFor(series)}
      className={cn("aspect-auto h-64 w-full", className)}
    >
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={formatDay}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatDay(String(value))}
            />
          }
        />
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            stackId="stack"
            fill={`var(--color-${item.key})`}
            radius={index === series.length - 1 ? [3, 3, 0, 0] : 0}
          />
        ))}
        <ChartLegend
          content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1" />}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function RankedBars({
  data,
  label = "Count",
  color = "var(--chart-2)",
  format = "number",
  labelWidth = 150,
  empty = "Nothing recorded in this range.",
}: {
  data: Array<{ label: string; value: number }>;
  label?: string;
  color?: string;
  format?: ValueFormat;
  labelWidth?: number;
  empty?: string;
}) {
  if (data.length === 0) {
    return (
      <Text variant="caption" className="py-10 text-center">
        {empty}
      </Text>
    );
  }
  const config = { value: { label, color } } satisfies ChartConfig;
  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: Math.max(data.length * 34, 68) }}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 48, top: 0, bottom: 0 }}
        barCategoryGap={6}
      >
        <XAxis type="number" dataKey="value" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tickLine={false}
          axisLine={false}
          interval={0}
          tick={(props: { x?: number | string; y?: number | string; payload?: { value?: unknown } }) => {
            const full = String(props.payload?.value ?? "");
            const max = Math.floor(labelWidth / 7);
            return (
              <text
                x={Number(props.x ?? 0)}
                y={Number(props.y ?? 0)}
                dy={4}
                textAnchor="end"
                fontSize={12}
                className="fill-foreground"
              >
                <title>{full}</title>
                {full.length > max ? `${full.slice(0, max - 1)}…` : full}
              </text>
            );
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={4}
          minPointSize={2}
        >
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            className="fill-muted-foreground font-mono"
            fontSize={12}
            formatter={(value: unknown) => formatValue(Number(value), format)}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function DonutChart({
  data,
  total,
  caption,
  empty = "Nothing recorded in this range.",
}: {
  data: Array<{ label: string; value: number }>;
  total?: string;
  caption?: string;
  empty?: string;
}) {
  const rows = data.filter((row) => row.value > 0);
  if (rows.length === 0) {
    return (
      <Text variant="caption" className="py-10 text-center">
        {empty}
      </Text>
    );
  }
  const config: ChartConfig = Object.fromEntries(
    rows.map((row, index) => [
      `slice${index}`,
      { label: row.label, color: PALETTE[index % PALETTE.length] },
    ]),
  );
  const chartData = rows.map((row, index) => ({
    key: `slice${index}`,
    label: row.label,
    value: row.value,
    fill: `var(--color-slice${index})`,
  }));
  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-56 max-w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey="key" hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="key"
          innerRadius="58%"
          outerRadius="88%"
          strokeWidth={2}
          stroke="var(--background)"
        >
          {chartData.map((row) => (
            <Cell key={row.key} fill={row.fill} />
          ))}
        </Pie>
        {total && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-display text-2xl font-bold"
          >
            <tspan x="50%" dy="-0.2em">
              {total}
            </tspan>
            {caption && (
              <tspan
                x="50%"
                dy="1.6em"
                className="fill-muted-foreground font-sans text-xs font-normal"
              >
                {caption}
              </tspan>
            )}
          </text>
        )}
        <ChartLegend
          content={
            <ChartLegendContent
              nameKey="key"
              className="flex-wrap gap-x-4 gap-y-1"
            />
          }
          className="flex-wrap gap-2"
        />
      </PieChart>
    </ChartContainer>
  );
}
