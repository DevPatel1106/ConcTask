const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { Parser } = require("json2csv"); 
const { scheduleTask, deleteTask: deleteTaskFromQueue } = require("../core/workerQueue");
// const store = require("../storage/inMemoryStore");
const store = require("../storage/sqliteStore");

const router = express.Router();
let io = null; // will be set from main.js

function parseDelayMs(body) {
  // Priority: delayMs -> delaySeconds -> delay
  if (body.delayMs != null) {
    const n = Number(body.delayMs);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  }
  if (body.delaySeconds != null) {
    const n = Number(body.delaySeconds);
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) : 0;
  }
  if (body.delay != null) {
    const n = Number(body.delay);
    if (!Number.isFinite(n) || n < 0) return 0;
    // Heuristic: if delay < 1000 treat it as seconds (human-friendly), else treat as ms
    return n < 1000 ? Math.round(n * 1000) : Math.round(n);
  }
  return 0;
}

function setSocket(socketInstance) {
  io = socketInstance;
  // also set it in workerQueue for consistent updates
  const { setSocket: setWorkerSocket } = require("../core/workerQueue");
  setWorkerSocket(io);
}

// Endpoint to create a new task
router.post("/tasks", async (req, res) => {
  const { name } = req.body;
  const delayMs = parseDelayMs(req.body);
  const now = new Date();

  const task = {
    id: uuidv4(),
    name,
    status: "pending",
    createdAt: now.toISOString(),
    scheduledFor: new Date(now.getTime() + delayMs).toISOString(),
    retryCount: 0,
    maxRetries: req.body.maxRetries ?? 3,
    retryDelay: req.body.retryDelay ?? 1000,
    priority: req.body.priority ?? 5,
    recurringInterval: req.body.recurringInterval ?? null,
  };

  await store.addTask(task);

  // Schedule task in worker queue
  const { scheduleTask } = require("../core/workerQueue");
  scheduleTask(task, delayMs);

  // Emit to frontend
  if (io) {
    io.emit("task:added", task);
    await require("../core/workerQueue").emitMetrics();
  }

  res.status(201).json(task);
});

//Get all tasks
router.get("/tasks", async (req, res) => {
  const tasks = await store.getAllTasks();
  res.json(tasks);
  // console.log(store); // should show { addTask: [Function], getTask: [Function], getAllTasks: [Function], ... }
});

//Get single task by id
router.get("/tasks/:id", async (req, res) => {
  const task = await store.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// Delete task by id (support recurring)
router.delete("/tasks/:id", async (req, res) => {
  const { recurring } = req.query; // <-- read query param
  const taskId = req.params.id;

  try {
    // Use workerQueue delete so recurring flags and timeouts are cleared
    await deleteTaskFromQueue(taskId, recurring === "true");

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});


router.get("/metrics", async (req, res) => {
  try {
    const tasks = await store.getAllTasks();

    const metrics = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      running: tasks.filter((t) => t.status === "running").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      retrying: tasks.filter((t) => t.status === "retrying").length,
    };
    res.json(metrics);
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Failed to fetch metrics-Internal server error" });
  }
});

router.get("/metrics/export", async (req, res) => {
  try {
    const format = (req.query.format || "json").toLowerCase();
    const tasks = await store.getAllTasks();

    if (format === "csv") {
      const fields = [
        "id",
        "name",
        "status",
        "createdAt",
        "scheduledFor",
        "startedAt",
        "completedAt",
        "retryCount",
        "maxRetries",
        "retryDelay",
        "priority",
        "recurringInterval",
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(tasks);
      res.header("Content-Type", "text/csv");
      res.attachment("tasks.csv");
      return res.send(csv);
    }

    // default JSON
    res.json(tasks);
  } catch (err) {
    console.error("Error exporting metrics:", err);
    res.status(500).json({ error: "Failed to export metrics" });
  }
});

module.exports = router;
module.exports.setSocket = setSocket;
