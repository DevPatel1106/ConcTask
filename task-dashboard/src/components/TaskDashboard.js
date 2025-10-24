import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import TaskForm from "./TaskForm";

const socket = io("http://localhost:3000");

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to backend"));
    socket.on("task:added", async (task) => updateTaskList(task));
    socket.on("task:updated", async (task) => updateTaskList(task));
    socket.on("metrics:update", setMetrics);

    fetchTasks();
    return () => socket.disconnect();
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  function updateTaskList(task) {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = task;
        return updated;
      }
      return [...prev, task];
    });
  }

  async function addTask(newTask) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Task Scheduler Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        <TaskForm onSubmit={addTask} />

        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Metrics</h2>
          <ul>
            {Object.entries(metrics).map(([key, val]) => (
              <li key={key}>
                <strong>{key}</strong>: {val}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All Tasks</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Retries</th>
              <th>Recurring</th>
              <th>Started</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b text-center">
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>
                <td>{t.retryCount || 0}/{t.maxRetries}</td>
                <td>{t.recurringInterval || "—"}</td>
                <td>{t.startedAt ? new Date(t.startedAt).toLocaleTimeString() : "—"}</td>
                <td>{t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
