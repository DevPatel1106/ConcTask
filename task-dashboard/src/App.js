import React, { useState, useEffect } from "react";
import "./App.css";

import TaskTable from "./components/TaskTable";
import MetricsPanel from "./components/MetricsPanel";
import MetricsChart from "./components/MetricsChart";
import ThroughputChart from "./components/ThroughputChart";

import {
  getTasks,
  addTask,
  socket,
  getMetrics,
  deleteTask,
  exportTasks,
} from "./api";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [delay, setDelay] = useState(5);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
  });
  const [priority, setPriority] = useState(5);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(1000);
  const [recurringInterval, setRecurringInterval] = useState(0);

  const computeMetrics = (tasks) => {
    const validTasks = tasks.filter((t) => t != null);
    return {
      total: validTasks.length,
      pending: validTasks.filter((t) => t.status === "pending").length,
      running: validTasks.filter((t) => t.status === "running").length,
      completed: validTasks.filter((t) => t.status === "completed").length,
      failed: validTasks.filter((t) => t.status === "failed").length,
      retrying: validTasks.filter((t) => t.status === "retrying").length,
    };
  };

  const updateTasks = (newTasks) => {
    const tasksArray = Array.isArray(newTasks) ? newTasks : [newTasks];
    setTasks(tasksArray);
    setMetrics(computeMetrics(tasksArray));
  };

  useEffect(() => {
    async function fetchTasksAndMetrics() {
      try {
        const data = await getTasks();
        updateTasks(data);
        const metricsData = await getMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching tasks/metrics:", error);
      }
    }

    fetchTasksAndMetrics();

    // --- WebSocket listeners ---
    socket.on("task:added", (newTask) => {
      if (!newTask) return;
      setTasks((prev) => {
        const updated = prev.some((t) => t?.id === newTask.id)
          ? prev
          : [...prev, newTask];
        setMetrics(computeMetrics(updated));
        return updated;
      });
    });

    socket.on("task:updated", (updatedTask) => {
      if (!updatedTask) return;
      setTasks((prev) => {
        const updatedTasks = prev
          .filter((t) => t != null)
          .map((t) => (t.id === updatedTask.id ? updatedTask : t));
        setMetrics(computeMetrics(updatedTasks));
        return updatedTasks;
      });
    });

    socket.on("task:deleted", (data) => {
      const { id, recurring } = data || {};
      if (!id) return;

      setTasks((prevTasks) => {
        let updatedTasks;
        if (recurring) {
          updatedTasks = prevTasks.filter(
            (t) => t.id !== id && t.recurringId !== id
          );
        } else {
          updatedTasks = prevTasks.filter((t) => t.id !== id);
        }
        setMetrics(computeMetrics(updatedTasks));
        return updatedTasks;
      });
    });

    socket.on("metrics:update", (metricsData) => {
      setMetrics(metricsData);
    });

    return () => {
      socket.off("task:added");
      socket.off("task:updated");
      socket.off("task:deleted");
      socket.off("metrics:update");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName) return alert("Task name is required");
    try {
      await addTask({
        name: taskName,
        delaySeconds: delay,
        priority,
        maxRetries,
        retryDelay,
        recurringInterval: recurringInterval > 0 ? recurringInterval : null,
      });
      setTaskName("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleDeleteTask = async (task) => {
    const deleteRecurring = task.recurringInterval > 0;
    try {
      await deleteTask(task.id, deleteRecurring);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await exportTasks(format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tasks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#e6edffff", minHeight: "100vh" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Task Scheduler Dashboard
      </Typography>

      {/* --- Add Task Form --- */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Task
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          }}
        >
          <TextField
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
          />
          <TextField
            label="Delay (seconds)"
            type="number"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
          />
          <TextField
            label="Priority (1-10)"
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <TextField
            label="Max Retries"
            type="number"
            value={maxRetries}
            onChange={(e) => setMaxRetries(e.target.value)}
          />
          <TextField
            label="Retry Delay (ms)"
            type="number"
            value={retryDelay}
            onChange={(e) => setRetryDelay(e.target.value)}
          />
          <TextField
            label="Recurring Interval (ms)"
            type="number"
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Add Task
          </Button>
        </Box>
      </Card>

      {/* --- Metrics, Charts, and Table --- */}
      <Grid container spacing={2}>

        {/* Task Table */}
        <Grid item xs={12}>
          <Card sx={{ overflow: "auto" }}>
            <CardContent>
              <TaskTable tasks={tasks} handleDeleteTask={handleDeleteTask} />
            </CardContent>
          </Card>
        </Grid>

        {/* Export Buttons */}
        <Grid item xs={12} md={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Export Tasks
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={() => handleExport("json")}>
                  Export JSON
                </Button>
                <Button variant="outlined" onClick={() => handleExport("csv")}>
                  Export CSV
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <MetricsChart metrics={metrics} />
            </CardContent>
          </Card>
        </Grid>

        {/* Throughput Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <ThroughputChart tasks={tasks} />
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Panel */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <MetricsPanel metrics={metrics} />
            </CardContent>
          </Card>
        </Grid>



      </Grid>
    </Box>
  );
}

export default App;
