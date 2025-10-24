const async = require("async");
const executor = require("./executor");
const store = require("../storage/sqliteStore");
const { v4: uuidv4 } = require("uuid");

let io = null; // Socket instance
const scheduledTimeouts = {}; // Track scheduled recurring tasks
const deletedRecurringIds = new Set(); // Track deleted recurring series

function setSocket(socketInstance) {
  io = socketInstance;
}

// --- Worker Queue ---
const workerQueue = async.priorityQueue(async (task) => {
  try {
    // Mark as running
    await store.updateTask(task.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });

    if (io) {
      io.emit("task:updated", await store.getTask(task.id));
      await emitMetrics();
    }

    console.log("Worker picked up task:", task.id);

    // Execute the task
    await executor.executeTask(task);

    // Mark as completed
    await store.updateTask(task.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    if (io) {
      io.emit("task:updated", await store.getTask(task.id));
      await emitMetrics();
    }

    console.log(`Completed task: ${task.id}`);

    // --- Recurring tasks ---
    const recurringId = task.recurringId || task.id;
    if (task.recurringInterval && task.recurringInterval > 0) {
      // HARD CHECK: stop scheduling if series deleted
      if (!deletedRecurringIds.has(recurringId)) {
        const intervalMs = Number(task.recurringInterval);
        const nextScheduledFor = new Date(Date.now() + intervalMs).toISOString();

        const newTask = await store.addTask({
          id: uuidv4(),
          name: task.name + " (recurring)",
          status: "pending",
          scheduledFor: nextScheduledFor,
          priority: task.priority,
          maxRetries: task.maxRetries,
          retryDelay: task.retryDelay,
          recurringInterval: task.recurringInterval,
          recurringId: recurringId,
        });

        scheduleTask(newTask, intervalMs);

        if (io) {
          io.emit("task:added", newTask);
          await emitMetrics();
        }
      } else {
        console.log(`Recurring series ${recurringId} deleted. Skipping next recurrence.`);
      }
    }
  } catch (err) {
    console.error(`Task ${task.id} failed:`, err);

    // Retry logic
    task.retries = (task.retries || 0) + 1;
    if (task.retries <= task.maxRetries) {
      await store.updateTask(task.id, {
        status: "retrying",
        retryCount: task.retries,
      });

      scheduleTask(task, task.retryDelay);

      if (io) {
        io.emit("task:updated", await store.getTask(task.id));
        await emitMetrics();
      }
    } else {
      await store.updateTask(task.id, {
        status: "failed",
        error: err?.message || String(err),
      });

      if (io) {
        io.emit("task:updated", await store.getTask(task.id));
        await emitMetrics();
      }
    }
  }
}, 5);

// --- Schedule Task ---
function scheduleTask(task, delay = 0) {
  const priority = 10 - (task.priority ?? 5);

  const timeoutId = setTimeout(async () => {
    // Remove from timeout map once executed
    delete scheduledTimeouts[task.id];

    // Push to worker queue
    workerQueue.push(task, priority, (err) => {
      if (err) console.error("Queue push error:", err);
    });

    if (io) {
      io.emit("task:added", task);
      await emitMetrics();
    }
  }, delay);

  scheduledTimeouts[task.id] = timeoutId;
}

// --- Delete Task ---
async function deleteTask(taskId, deleteRecurring = false) {
  if (deleteRecurring) {
    // Safe fetch
    const tasks = (await store.getAllTasks()) || [];
    
    const recurringTasks = tasks.filter(
      t => t.recurringId === taskId || t.id === taskId
    );

    // Mark series as deleted
    deletedRecurringIds.add(taskId);

    // Clear scheduled timeouts
    for (const t of recurringTasks) {
      if (scheduledTimeouts[t.id]) {
        clearTimeout(scheduledTimeouts[t.id]);
        delete scheduledTimeouts[t.id];
      }
    }

    await store.deleteTasksByRecurringId(taskId);

    if (io) {
      recurringTasks.forEach(t => io.emit("task:deleted", { id: t.id }));
      await emitMetrics();
    }
  } else {
    if (scheduledTimeouts[taskId]) {
      clearTimeout(scheduledTimeouts[taskId]);
      delete scheduledTimeouts[taskId];
    }

    await store.deleteTask(taskId);

    if (io) {
      io.emit("task:deleted", { id: taskId });
      await emitMetrics();
    }
  }

  // Remove from async queue
  const indexInQueue = workerQueue.tasks.findIndex(t => t.data.id === taskId);
  if (indexInQueue >= 0) workerQueue.tasks.splice(indexInQueue, 1);

  console.log(`Deleted task ${taskId}`);
}


// --- Emit Metrics ---
async function emitMetrics() {
  if (!io) return;
  const tasks = await store.getAllTasks();
  const metrics = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    running: tasks.filter(t => t.status === "running").length,
    completed: tasks.filter(t => t.status === "completed").length,
    failed: tasks.filter(t => t.status === "failed").length,
    retrying: tasks.filter(t => t.status === "retrying").length,
  };
  io.emit("metrics:update", metrics);
}

module.exports = { workerQueue, scheduleTask, setSocket, deleteTask };
