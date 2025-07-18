
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Line,
  LineChart,
  TooltipProps
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";

type ChartData = {
  name: string;
  completed: number;
  tooltip: string;
}[];

const goalChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-sm bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="font-bold text-foreground">{label}</p>
        <p className="text-muted-foreground whitespace-pre-wrap">{data.tooltip}</p>
      </div>
    );
  }
  return null;
};

export function GoalCompletionChart({ data }: { data: ChartData }) {
    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-12">No goal data for this period.</div>
    }
  return (
    <ChartContainer config={goalChartConfig} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<CustomTooltip />}
        />
        <Bar dataKey="completed" fill="var(--color-completed)" radius={8}>
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}


const routineChartConfig = {
  completed: {
    label: "Routines Completed",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function RoutineCompletionChart({ data }: { data: ChartData }) {
   if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-12">No routine data for this period.</div>
    }
  return (
     <ChartContainer config={routineChartConfig} className="h-[250px] w-full">
        <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={true}
              content={<CustomTooltip />}
            />
            <Line
                dataKey="completed"
                type="monotone"
                stroke="var(--color-completed)"
                strokeWidth={3}
                dot={{
                    fill: "var(--color-completed)",
                    r: 5,
                }}
             />
        </LineChart>
    </ChartContainer>
  )
}
