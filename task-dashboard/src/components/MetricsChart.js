import React, {useEffect, useMemo} from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = {
  pending: "#f0ad4e",
  running: "#5bc0de",
  completed: "#5cb85c",
  failed: "#d9534f",
  retrying: "#f7ec42",
};

const MetricsChart = ({ metrics }) => {
  useEffect(() => {
    console.log("Chart received metrics:", metrics);
  }, [metrics]);

  const data = useMemo(() => [
    { name: "pending", value: metrics.pending },
    { name: "running", value: metrics.running },
    { name: "completed", value: metrics.completed },
    { name: "failed", value: metrics.failed },
    { name: "retrying", value: metrics.retrying },
  ], [metrics]);

  // const data = [
  //   { name: "pending", value: metrics.pending || 0 },
  //   { name: "running", value: metrics.running || 0 },
  //   { name: "completed", value: metrics.completed || 0 },
  //   { name: "failed", value: metrics.failed || 0 },
  //   { name: "retrying", value: metrics.retrying || 0 },
  // ];

  // ensure rerender when metrics object changes
  return (
    <PieChart
      key={JSON.stringify(metrics)}
      width={400}
      height={300}
    >
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {data.map((entry, index) => (
          <Cell key={index} fill={COLORS[entry.name]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default MetricsChart;
