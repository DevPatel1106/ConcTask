import React from "react";

function MetricsPanel({ metrics }) {
  return (
    <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
      <div>Total: {metrics.total}</div>
      <div>Pending: {metrics.pending}</div>
      <div>Running: {metrics.running}</div>
      <div>Completed: {metrics.completed}</div>
      <div>Failed: {metrics.failed}</div>
      <div>Retrying: {metrics.retrying}</div>
    </div>
  );
}


export default MetricsPanel;
