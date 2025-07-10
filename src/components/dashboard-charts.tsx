
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
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

const goalChartData = [
  { month: "Jan", completed: 15 },
  { month: "Feb", completed: 20 },
  { month: "Mar", completed: 24 },
  { month: "Apr", completed: 18 },
  { month: "May", completed: 30 },
  { month: "Jun", completed: 25 },
];

const goalChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function GoalCompletionChart() {
  return (
    <ChartContainer config={goalChartConfig} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={goalChartData}
        margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
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


// New Routine Chart
const routineChartData = {
  weekly: [
    { day: "Sun", completed: 5 },
    { day: "Mon", completed: 8 },
    { day: "Tue", completed: 6 },
    { day: "Wed", completed: 7 },
    { day: "Thu", completed: 9 },
    { day: "Fri", completed: 4 },
    { day: "Sat", completed: 6 },
  ],
  monthly: [
    { week: "Week 1", completed: 35 },
    { week: "Week 2", completed: 42 },
    { week: "Week 3", completed: 40 },
    { week: "Week 4", completed: 38 },
  ],
  yearly: [
    { month: "Jan", completed: 150 },
    { month: "Feb", completed: 160 },
    { month: "Mar", completed: 155 },
    { month: "Apr", completed: 170 },
    { month: "May", completed: 180 },
    { month: "Jun", completed: 165 },
  ],
};

const routineChartConfig = {
  completed: {
    label: "Routines Completed",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function RoutineCompletionChart({ timeRange }: { timeRange: "weekly" | "monthly" | "yearly" }) {
  const data = routineChartData[timeRange] || routineChartData.monthly;
  const dataKey = timeRange === 'weekly' ? 'day' : (timeRange === 'monthly' ? 'week' : 'month');

  return (
     <ChartContainer config={routineChartConfig} className="h-[250px] w-full">
        <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey={dataKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            />
            <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            />
            <ChartTooltip
            cursor={true}
            content={<ChartTooltipContent indicator="line" />}
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
