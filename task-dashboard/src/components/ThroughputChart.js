import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function bucketTasksByTime(tasks, bucketSizeSec = 15) {
  // Sort by completedAt timestamp
  const completedTasks = tasks.filter((t) => t.completedAt);
  completedTasks.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  const buckets = {};
  completedTasks.forEach((task) => {
    const completedTs = new Date(task.completedAt).getTime();
    // Round down to nearest bucket
    const bucket = Math.floor(completedTs / (bucketSizeSec * 1000)) * bucketSizeSec * 1000;
    const bucketLabel = new Date(bucket).toLocaleTimeString();
    buckets[bucketLabel] = (buckets[bucketLabel] || 0) + 1;
  });

  // Convert to array for chart
  return Object.entries(buckets).map(([time, count]) => ({ time, count }));
}


const ThroughputChart = ({ tasks }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!tasks || !Array.isArray(tasks)) return;
    const bucketed = bucketTasksByTime(tasks, 15); // 15 sec buckets
    setData(bucketed);
  }, [tasks]);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Throughput (Completed Tasks)</h3>
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </div>
  );
};

export default ThroughputChart;
