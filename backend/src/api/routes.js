const express = require("express");
const { v4: uuidv4 } = require("uuid");
const store = require("../storage/inMemoryStore");
const { scheduleTask } = require("../core/workerQueue");

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
}

// Endpoint to create a new task
router.post("/tasks", (req, res) => {
  const { name } = req.body;
  const delayMs = parseDelayMs(req.body);
  const now = new Date();
  const createdAt = now;
  const scheduledFor = new Date(now.getTime() + delayMs);

  // Always create with current timestamp
  const task = {
    id: uuidv4(),
    name,
    status: "pending",
    createdAt: createdAt.toISOString(), // when task was added
    scheduledFor: scheduledFor.toISOString(), // execution time
  };

  store.addTask(task);
  console.log("Task added:", task);

  // Pass task to worker
  console.log("io in routes:", io);
  if (io) {
    io.emit("task:added", task);
    console.log("Emitted task:added for", task.id);
  }
  
  console.log("Task scheduled with delay:", delayMs);
  scheduleTask(task, delayMs);

  res.status(201).json(task);
});

//Get all tasks
router.get("/tasks", (req, res) => {
  res.json(store.getAllTasks());
  // console.log(store); // should show { addTask: [Function], getTask: [Function], getAllTasks: [Function], ... }
});

//Get single task by id
router.get("/tasks/:id", (req, res) => {
  const task = store.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

//Delete task by id
router.delete("/tasks/:id", (req, res) => {
  const deleted = store.deleteTask(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Task not found" });

  if (io) io.emit("task:deleted", { id: req.params.id });

  res.status(204).send();
  res.json({ message: "Task deleted successfully" });
});

module.exports = router;
module.exports.setSocket = setSocket;
