import React from "react";

function MetricsPanel({ tasks }) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const running = tasks.filter((t) => t.status === "running").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const failed = tasks.filter((t) => t.status === "failed").length;

  return (
    <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
      <div>Total: {total}</div>
      <div>Pending: {pending}</div>
      <div>Running: {running}</div>
      <div>Completed: {completed}</div>
      <div>Failed: {failed}</div>
    </div>
  );
}

export default MetricsPanel;
