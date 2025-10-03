import React from "react";

function TaskTable({ tasks }) {
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f0ad4e"; // orange
      case "running":
        return "#5bc0de"; // blue
      case "completed":
        return "#5cb85c"; // green
      case "failed":
        return "#d9534f"; // red
      default:
        return "#ccc";
    }
  };

  return (
    <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Created At</th>
          <th>Scheduled For</th>
          <th>Status</th>
          <th>Started At</th>
          <th>Completed At</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} style={{ backgroundColor: statusColor(task.status) }}>
            <td>{task.name}</td>
            <td>{new Date(task.createdAt).toLocaleString()}</td>
            <td>{new Date(task.scheduledFor).toLocaleString()}</td>
            <td>{task.status}</td>
            <td>{task.startedAt ? new Date(task.startedAt).toLocaleString() : "-"}</td>
            <td>{task.completedAt ? new Date(task.completedAt).toLocaleString() : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TaskTable;
