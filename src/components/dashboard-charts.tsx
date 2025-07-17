
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, Sector } from "recharts";
import {
  ChartContainer,
  ChartTooltip as ChartTooltipContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { CardDescription } from "./ui/card";
import { useState, useCallback } from "react";

// Goal Status Chart
type GoalStatusData = {
    name: string;
    value: number;
    fill: string;
}[];

const goalChartConfig = {
  value: {
    label: "Goals",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-2))",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--chart-1))",
  },
  overdue: {
    label: "Overdue",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-2xl font-bold">
        {payload.value}
      </text>
       <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
        {payload.name} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};


export function GoalStatusChart({ data }: { data: GoalStatusData }) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, [setActiveIndex]);

    return (
        <ChartContainer config={goalChartConfig} className="h-64 w-full">
        <PieChart>
            <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                onMouseEnter={onPieEnter}
            >
            {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
            </Pie>
        </PieChart>
        </ChartContainer>
    );
}

// Routine Completion Chart
type RoutineChartData = {
    date: string;
    completed: number;
    missed: number;
}[];

const routineChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  missed: {
    label: "Missed",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export function RoutineCompletionChart({ data }: { data: RoutineChartData }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64"><CardDescription>No routine data for this period.</CardDescription></div>;
  }
  return (
     <ChartContainer config={routineChartConfig} className="h-64 w-full">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltipContainer 
                cursor={true}
                content={<ChartTooltipContent indicator="dot" />} 
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" stackId="a" fill="var(--color-missed)" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ChartContainer>
  )
}
