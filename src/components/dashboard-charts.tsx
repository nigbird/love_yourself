"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
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

const chartData = [
  { month: "Jan", completed: 15 },
  { month: "Feb", completed: 20 },
  { month: "Mar", completed: 24 },
  { month: "Apr", completed: 18 },
  { month: "May", completed: 30 },
  { month: "Jun", completed: 25 },
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function GoalCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Goal Progress</CardTitle>
        <CardDescription>
          Your goal completion rate over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
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
      </CardContent>
    </Card>
  );
}
